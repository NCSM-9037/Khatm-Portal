import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification || notification.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.notification.update({
      where: { id },
      data: { is_read: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
