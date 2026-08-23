import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Channel } from '@prisma/client'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  if (!process.env.CRON_SECRET) {
    console.warn('CRON_SECRET is not set in environment variables')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const families = await prisma.family.findMany({
      select: { id: true, reminder_threshold_days: true },
    })

    let remindersCreated = 0

    for (const family of families) {
      const thresholdDate = new Date()
      thresholdDate.setDate(thresholdDate.getDate() - family.reminder_threshold_days)

      // Find JuzAssignments that:
      // 1. Are RESERVED
      // 2. Were reserved BEFORE the threshold date
      // 3. Do not already have a reminder sent (for simplicity, no reminders at all yet)
      const overdueAssignments = await prisma.juzAssignment.findMany({
        where: {
          status: 'RESERVED',
          khatm: { family_id: family.id },
          reserved_at: { lt: thresholdDate },
          reminders: { none: {} },
        },
        include: {
          khatm: true,
          reserver: true,
        },
      })

      for (const assignment of overdueAssignments) {
        if (!assignment.reserved_by) continue

        await prisma.$transaction(async (tx) => {
          // Create the Reminder
          await tx.reminder.create({
            data: {
              juz_assignment_id: assignment.id,
              channel: Channel.EMAIL, // Or PUSH
              status: 'SENT',
              scheduled_for: new Date(),
              sent_at: new Date(),
            },
          })

          // Create In-App Notification
          await tx.notification.create({
            data: {
              user_id: assignment.reserved_by!,
              title: 'Juz Reminder',
              message: `You reserved Juz ${assignment.juz_number} ${family.reminder_threshold_days} days ago. Please complete it soon!`,
              link: `/dashboard?familyId=${family.id}`,
            },
          })
          
          remindersCreated++
          
          // Stub Email/WhatsApp
          console.log(`[REMINDER] Would send email/whatsapp to ${assignment.reserver?.email || assignment.reserver?.phone} for Juz ${assignment.juz_number}`)
        })
      }
    }

    return NextResponse.json({ success: true, remindersCreated })
  } catch (error) {
    console.error('Error running reminders cron:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
