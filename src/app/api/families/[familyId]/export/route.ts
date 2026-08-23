import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { requireFamilyMembership } from '@/lib/family'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { familyId } = await params
    const membership = await requireFamilyMembership(user.id, familyId)
    
    if (membership.role !== 'ADMIN') {
      return new NextResponse('Forbidden: Admins only', { status: 403 })
    }

    const familyData = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        khatms: {
          include: {
            juzAssignments: true
          },
          orderBy: {
            started_at: 'desc'
          }
        }
      }
    })

    if (!familyData) {
      return new NextResponse('Family not found', { status: 404 })
    }

    const json = JSON.stringify(familyData, null, 2)

    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="family-${familyId}-export.json"`
      },
    })
  } catch (error: any) {
    if (error?.message === 'NEXT_REDIRECT') {
      throw error
    }
    console.error('Export error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
