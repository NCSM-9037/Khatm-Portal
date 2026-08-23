'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const ACTIVE_FAMILY_COOKIE = 'activeFamilyId'

async function getActiveFamilyId() {
  const cookieStore = await cookies()
  return cookieStore.get(ACTIVE_FAMILY_COOKIE)?.value
}

async function verifyAdmin(userId: string, familyId: string) {
  const membership = await prisma.membership.findUnique({
    where: {
      user_id_family_id: { user_id: userId, family_id: familyId },
    },
  })
  if (!membership || membership.status !== 'ACTIVE' || membership.role !== 'ADMIN') {
    throw new Error('Unauthorized: Must be family admin')
  }
}

async function verifyMember(userId: string, familyId: string) {
  const membership = await prisma.membership.findUnique({
    where: {
      user_id_family_id: { user_id: userId, family_id: familyId },
    },
  })
  if (!membership || membership.status !== 'ACTIVE') {
    throw new Error('Unauthorized: Must be family member')
  }
}

export async function startKhatm(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not logged in')

  const familyId = await getActiveFamilyId()
  if (!familyId) throw new Error('No active family selected')

  await verifyAdmin(user.id, familyId)

  // Verify there is no active khatm
  const activeKhatm = await prisma.khatm.findFirst({
    where: { family_id: familyId, status: 'ACTIVE' },
  })

  if (activeKhatm) throw new Error('A Khatm is already active')

  const niyyah_text = formData.get('niyyah_text') as string
  const niyyah_category = formData.get('niyyah_category') as string

  // Create Khatm + 30 Juz
  await prisma.$transaction(async (tx) => {
    const khatm = await tx.khatm.create({
      data: {
        family_id: familyId,
        niyyah_text: niyyah_text || null,
        niyyah_category: niyyah_category || null,
        started_by: user.id,
        juzAssignments: {
          create: Array.from({ length: 30 }, (_, i) => ({
            juz_number: i + 1,
            status: 'UNCLAIMED',
          })),
        },
      },
    })

    await tx.activityLog.create({
      data: {
        family_id: familyId,
        khatm_id: khatm.id,
        user_id: user.id,
        action: 'KHATM_STARTED',
        meta: { niyyah_category },
      },
    })
  })

  revalidatePath('/(protected)/khatm', 'page')
}

export async function reserveJuz(juzId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not logged in')

  const familyId = await getActiveFamilyId()
  if (!familyId) throw new Error('No active family selected')

  await verifyMember(user.id, familyId)

  // Config Decision: We could enforce a max number of reserved Juz per member here if desired.
  // Currently allowing unlimited.

  await prisma.$transaction(async (tx) => {
    const juz = await tx.juzAssignment.findUnique({ where: { id: juzId } })
    if (!juz) throw new Error('Juz not found')
    if (juz.status !== 'UNCLAIMED') throw new Error('Juz is not unclaimed')

    const updated = await tx.juzAssignment.update({
      where: { id: juzId },
      data: {
        status: 'RESERVED',
        reserved_by: user.id,
        reserved_at: new Date(),
      },
    })

    await tx.activityLog.create({
      data: {
        family_id: familyId,
        khatm_id: juz.khatm_id,
        user_id: user.id,
        action: 'JUZ_RESERVED',
        meta: { juz_number: updated.juz_number },
      },
    })
  })

  revalidatePath('/(protected)/khatm', 'page')
}

export async function completeJuz(juzId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not logged in')

  const familyId = await getActiveFamilyId()
  if (!familyId) throw new Error('No active family selected')

  await verifyMember(user.id, familyId)

  await prisma.$transaction(async (tx) => {
    const juz = await tx.juzAssignment.findUnique({ where: { id: juzId } })
    if (!juz) throw new Error('Juz not found')
    if (juz.status !== 'RESERVED' || juz.reserved_by !== user.id) {
      throw new Error('Juz not reserved by you')
    }

    const updated = await tx.juzAssignment.update({
      where: { id: juzId },
      data: {
        status: 'COMPLETED',
        completed_at: new Date(),
      },
    })

    await tx.activityLog.create({
      data: {
        family_id: familyId,
        khatm_id: juz.khatm_id,
        user_id: user.id,
        action: 'JUZ_COMPLETED',
        meta: { juz_number: updated.juz_number },
      },
    })
  })

  revalidatePath('/(protected)/khatm', 'page')
}

export async function unreserveJuz(juzId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not logged in')

  const familyId = await getActiveFamilyId()
  if (!familyId) throw new Error('No active family selected')

  await verifyAdmin(user.id, familyId)

  await prisma.$transaction(async (tx) => {
    const juz = await tx.juzAssignment.findUnique({ where: { id: juzId } })
    if (!juz) throw new Error('Juz not found')

    const updated = await tx.juzAssignment.update({
      where: { id: juzId },
      data: {
        status: 'UNCLAIMED',
        reserved_by: null,
        reserved_at: null,
        completed_at: null,
      },
    })

    await tx.activityLog.create({
      data: {
        family_id: familyId,
        khatm_id: juz.khatm_id,
        user_id: user.id,
        action: 'JUZ_UNRESERVED',
        meta: { juz_number: updated.juz_number },
      },
    })
  })

  revalidatePath('/(protected)/khatm', 'page')
}

export async function closeKhatm(khatmId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not logged in')

  const familyId = await getActiveFamilyId()
  if (!familyId) throw new Error('No active family selected')

  await verifyAdmin(user.id, familyId)

  await prisma.$transaction(async (tx) => {
    const khatm = await tx.khatm.findUnique({
      where: { id: khatmId },
      include: { juzAssignments: true },
    })
    
    if (!khatm) throw new Error('Khatm not found')
    if (khatm.status === 'CLOSED') throw new Error('Khatm already closed')

    const allCompleted = khatm.juzAssignments.every((juz) => juz.status === 'COMPLETED')
    if (!allCompleted) throw new Error('All 30 Juz must be completed to close Khatm')

    await tx.khatm.update({
      where: { id: khatmId },
      data: {
        status: 'CLOSED',
        closed_at: new Date(),
      },
    })

    await tx.activityLog.create({
      data: {
        family_id: familyId,
        khatm_id: khatm.id,
        user_id: user.id,
        action: 'KHATM_CLOSED',
      },
    })
  })

  revalidatePath('/(protected)/khatm', 'page')
}
