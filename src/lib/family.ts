import { redirect } from 'next/navigation'
import { prisma } from './prisma'

/**
 * Ensures the user has an active membership in the specified family.
 * If not, it redirects to the dashboard (or throws).
 */
export async function requireFamilyMembership(userId: string, familyId: string) {
  const membership = await prisma.membership.findFirst({
    where: {
      user_id: userId,
      family_id: familyId,
      family: {
        is: {
          deleted_at: null
        }
      }
    },
    include: {
      family: true
    }
  })

  if (!membership || membership.status !== 'ACTIVE') {
    redirect('/dashboard')
  }

  return membership
}

/**
 * Gets all active families for a user.
 */
export async function getUserFamilies(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: {
      user_id: userId,
      status: 'ACTIVE',
      family: {
        is: {
          deleted_at: null
        }
      }
    },
    include: {
      family: true,
    },
    orderBy: {
      joined_at: 'asc',
    },
  })

  return memberships.map((m) => m.family)
}
