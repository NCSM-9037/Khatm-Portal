'use server'

import { requireFamilyMembership } from '@/lib/family'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function updateReminderThreshold(familyId: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const membership = await requireFamilyMembership(user.id, familyId)
  if (membership.role !== 'ADMIN') throw new Error('Unauthorized')

  const threshold = formData.get('threshold')
  if (!threshold || isNaN(Number(threshold))) {
    throw new Error('Invalid threshold')
  }

  await prisma.family.update({
    where: { id: familyId },
    data: { reminder_threshold_days: Number(threshold) },
  })
}
