'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const ACTIVE_FAMILY_COOKIE = 'activeFamilyId'

export async function createFamilyAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  if (user.is_platform_admin !== true) {
    throw new Error('Only the portal admin can set up new families. Contact them for an invite instead.')
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const icon = formData.get('icon') as string | null

  if (!name) {
    throw new Error('Family name is required')
  }

  const family = await prisma.family.create({
    data: {
      name,
      description,
      icon,
      created_by: user.id,
      memberships: {
        create: {
          user_id: user.id,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      },
    },
  })

  // Set as active family
  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_FAMILY_COOKIE, family.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })

  revalidatePath('/(protected)', 'layout')
  redirect('/dashboard')
}

export async function joinFamilyAction(token: string) {
  const user = await getCurrentUser()
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`)
  }

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { family: true },
  })

  if (!invite) {
    throw new Error('Invalid invite link')
  }

  if (invite.expires_at && invite.expires_at < new Date()) {
    throw new Error('Invite link has expired')
  }
  if (invite.revoked_at) {
    throw new Error('Invite link has been revoked')
  }

  // Idempotent: check if already a member
  let membership = await prisma.membership.findUnique({
    where: {
      user_id_family_id: {
        user_id: user.id,
        family_id: invite.family_id,
      },
    },
  })

  if (!membership) {
    membership = await prisma.membership.create({
      data: {
        user_id: user.id,
        family_id: invite.family_id,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    })
  } else if (membership.status !== 'ACTIVE') {
    // If previously removed or invited but not active, make them active
    membership = await prisma.membership.update({
      where: { id: membership.id },
      data: { status: 'ACTIVE' },
    })
  }

  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_FAMILY_COOKIE, invite.family_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })

  revalidatePath('/(protected)', 'layout')
  redirect('/dashboard')
}

export async function setActiveFamilyAction(familyId: string) {
  const user = await getCurrentUser()
  if (!user) return

  // Verify membership
  const membership = await prisma.membership.findUnique({
    where: {
      user_id_family_id: {
        user_id: user.id,
        family_id: familyId,
      },
    },
  })

  if (!membership || membership.status !== 'ACTIVE') {
    throw new Error('Not an active member of this family')
  }

  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_FAMILY_COOKIE, familyId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })

  revalidatePath('/(protected)', 'layout')
  redirect('/dashboard')
}

export async function generateInviteLinkAction(familyId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  // Verify admin membership
  const membership = await prisma.membership.findUnique({
    where: {
      user_id_family_id: {
        user_id: user.id,
        family_id: familyId,
      },
    },
  })

  if (!membership || membership.status !== 'ACTIVE' || membership.role !== 'ADMIN') {
    throw new Error('Unauthorized to generate invite link')
  }

  const token = randomBytes(16).toString('hex')

  const invite = await prisma.invite.create({
    data: {
      family_id: familyId,
      token,
      created_by: user.id,
    },
  })

  return invite.token
}


export async function removeMemberAction(familyId: string, memberId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  // Verify caller is admin
  const callerMembership = await prisma.membership.findUnique({
    where: {
      user_id_family_id: {
        user_id: user.id,
        family_id: familyId,
      },
    },
  })

  if (!callerMembership || callerMembership.status !== 'ACTIVE' || callerMembership.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const adminCount = await prisma.membership.count({
    where: {
      family_id: familyId,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  const targetMembership = await prisma.membership.findUnique({
    where: {
      user_id_family_id: {
        user_id: memberId,
        family_id: familyId,
      },
    },
  })

  if (targetMembership?.role === 'ADMIN' && adminCount <= 1) {
    throw new Error('Cannot remove the last admin of the family')
  }

  await prisma.membership.update({
    where: {
      user_id_family_id: {
        user_id: memberId,
        family_id: familyId,
      },
    },
    data: {
      status: 'REMOVED',
    },
  })

  revalidatePath(`/(protected)/families/${familyId}/members`)
}

export async function deleteFamilyAction(familyId: string, confirmName: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  if (!user.is_platform_admin) {
    throw new Error('Only platform admins can delete families')
  }

  const family = await prisma.family.findUnique({
    where: { id: familyId }
  })

  if (!family) {
    throw new Error('Family not found')
  }

  if (family.name !== confirmName) {
    throw new Error('Family name confirmation does not match')
  }

  await prisma.family.update({
    where: { id: familyId },
    data: { deleted_at: new Date() }
  })

  // Check if active cookie is this family
  const cookieStore = await cookies()
  const activeFamilyId = cookieStore.get(ACTIVE_FAMILY_COOKIE)?.value
  if (activeFamilyId === familyId) {
    cookieStore.delete(ACTIVE_FAMILY_COOKIE)
  }

  revalidatePath('/(protected)', 'layout')
  redirect('/dashboard')
}
