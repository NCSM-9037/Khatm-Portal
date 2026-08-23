import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { StartKhatmForm } from '@/components/khatm/StartKhatmForm'
import { KhatmBoard } from '@/components/khatm/KhatmBoard'

export default async function KhatmPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const cookieStore = await cookies()
  const activeFamilyId = cookieStore.get('activeFamilyId')?.value

  if (!activeFamilyId) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl font-bold">Juz' Board</h1>
        <p className="text-muted">Please select or create a family first.</p>
      </div>
    )
  }

  const membership = await prisma.membership.findUnique({
    where: {
      user_id_family_id: {
        user_id: user.id,
        family_id: activeFamilyId,
      },
    },
  })

  if (!membership || membership.status !== 'ACTIVE') {
    redirect('/dashboard')
  }

  const isAdmin = membership.role === 'ADMIN'

  const activeKhatm = await prisma.khatm.findFirst({
    where: {
      family_id: activeFamilyId,
      status: 'ACTIVE',
    },
    include: {
      juzAssignments: {
        orderBy: { juz_number: 'asc' },
        include: { reserver: true },
      },
      starter: true,
    },
  })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold font-heading">Juz' Board</h1>
      
      {!activeKhatm ? (
        isAdmin ? (
          <div className="bg-white p-6 rounded-[var(--radius-card)] border border-muted/20 shadow-sm max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Start a New Khatm</h2>
            <StartKhatmForm />
          </div>
        ) : (
          <div className="text-center py-12 bg-surface rounded-[var(--radius-card)] border border-muted/20 px-4">
            <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📖</span>
            </div>
            <p className="text-lg text-ink font-medium">No active Khatm</p>
            <p className="text-sm text-muted mt-2 max-w-sm mx-auto">Your family doesn't have an active Khatm reading right now. Ask a family admin to start one.</p>
          </div>
        )
      ) : (
        <KhatmBoard 
          khatm={activeKhatm} 
          currentUserId={user.id} 
          isAdmin={isAdmin} 
        />
      )}
    </div>
  )
}
