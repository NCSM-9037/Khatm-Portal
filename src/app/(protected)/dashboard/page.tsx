import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { requireFamilyMembership } from '@/lib/family'
import { prisma } from '@/lib/prisma'
import { KhatmWheel } from '@/components/ui/KhatmWheel'
import Link from 'next/link'

function formatRelativeTime(date: Date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return 'yesterday'
  
  return `${diffInDays}d ago`
}

function formatActivityMessage(log: any) {
  const name = log.user.name.split(' ')[0]
  const juz = (log.meta as any)?.juz_number
  
  switch (log.action) {
    case 'JUZ_RESERVED':
      return `${name} reserved juz ${juz}`
    case 'JUZ_COMPLETED':
      return `${name} completed juz ${juz}`
    case 'JUZ_UNRESERVED':
      return `${name} unreserved juz ${juz}`
    case 'KHATM_STARTED':
      return `${name} started a new Khatm`
    case 'KHATM_CLOSED':
      return `${name} closed the Khatm`
    default:
      return `${name} performed an action`
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const cookieStore = await cookies()
  const activeFamilyId = cookieStore.get('activeFamilyId')?.value

  if (!activeFamilyId) {
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl font-bold font-heading">Dashboard</h1>
        <div className="p-6 bg-surface border border-muted/20 rounded-[var(--radius-card)] space-y-4">
          <p className="text-ink font-medium text-lg">You aren't in any families yet.</p>
          <p className="text-muted mb-4">Create a family to begin tracking Khatms together.</p>
          {user.is_platform_admin && (
            <div>
              <Link 
                href="/families/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-[var(--radius-control)] shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Create a Family
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Ensure user has access
  const membership = await requireFamilyMembership(user.id, activeFamilyId)

  // Fetch dashboard data
  const activeKhatm = await prisma.khatm.findFirst({
    where: { family_id: activeFamilyId, status: 'ACTIVE' },
    include: { juzAssignments: true }
  })

  const totalKhatms = await prisma.khatm.count({
    where: { family_id: activeFamilyId, status: 'CLOSED' }
  })

  const activityLogs = await prisma.activityLog.findMany({
    where: { family_id: activeFamilyId },
    orderBy: { created_at: 'desc' },
    take: 10,
    include: { user: true }
  })

  let completedJuz: number[] = []
  let reservedCount = 0
  let completedCount = 0
  let remainingCount = 30

  if (activeKhatm) {
    completedJuz = activeKhatm.juzAssignments
      .filter(j => j.status === 'COMPLETED')
      .map(j => j.juz_number)
    
    completedCount = completedJuz.length
    reservedCount = activeKhatm.juzAssignments.filter(j => j.status === 'RESERVED').length
    remainingCount = 30 - completedCount - reservedCount
  }

  return (
    <div className="p-6 md:p-8 max-w-md mx-auto space-y-8">
      
      {/* Top section: Wheel and Niyyah or Empty State */}
      <div className="flex flex-col items-center justify-center pt-4 pb-2">
        {activeKhatm ? (
          <>
            <KhatmWheel completedJuz={completedJuz} size={240} />
            {activeKhatm.niyyah_text && (
              <p className="mt-8 text-center text-muted italic font-medium">
                Niyyah: {activeKhatm.niyyah_text}
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-24 h-24 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-muted/20">
              <span className="text-4xl">📖</span>
            </div>
            <h2 className="text-xl font-semibold text-ink">No active Khatm yet</h2>
            <p className="text-muted max-w-[250px]">
              {membership.role === 'ADMIN' 
                ? "Start a new Khatm to invite your family to read together." 
                : "Waiting for an admin to start a new Khatm."}
            </p>
            {membership.role === 'ADMIN' && (
              <Link 
                href="/khatm" 
                className="inline-block mt-4 px-6 py-2 border border-transparent rounded-[var(--radius-control)] shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Start Khatm
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-[var(--radius-card)] border border-muted/20">
          <p className="text-sm text-muted font-medium mb-1">Reserved</p>
          <p className="text-2xl text-primary font-heading">{reservedCount}</p>
        </div>
        <div className="bg-card p-4 rounded-[var(--radius-card)] border border-muted/20">
          <p className="text-sm text-muted font-medium mb-1">Remaining</p>
          <p className="text-2xl text-ink font-heading">{remainingCount}</p>
        </div>
        <div className="bg-card p-4 rounded-[var(--radius-card)] border border-muted/20">
          <p className="text-sm text-muted font-medium mb-1">Completed</p>
          <p className="text-2xl text-primary font-heading">{completedCount}</p>
        </div>
        <div className="bg-card p-4 rounded-[var(--radius-card)] border border-muted/20">
          <p className="text-sm text-muted font-medium mb-1">Total Khatms</p>
          <p className="text-2xl text-ink font-heading">{totalKhatms}</p>
        </div>
      </div>

      {/* Juz Board Link */}
      <div className="flex justify-center flex-col gap-3">
        <Link 
          href="/khatm" 
          className="w-full text-center px-4 py-3 rounded-[var(--radius-control)] shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          View Juz' Board
        </Link>
        
        {membership.role === 'ADMIN' && (
          <Link 
            href={`/families/${activeFamilyId}/members`}
            className="w-full text-center px-4 py-3 rounded-[var(--radius-control)] shadow-sm text-sm font-medium border border-muted/20 text-ink bg-surface hover:bg-muted/10 transition-colors"
          >
            Manage Members
          </Link>
        )}
      </div>
      {/* Recent Activity Feed */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg text-muted font-medium">Recent activity</h2>
        
        {activityLogs.length > 0 ? (
          <div className="space-y-3">
            {activityLogs.map(log => (
              <p key={log.id} className="text-ink">
                {formatActivityMessage(log)}{' '}
                <span className="text-muted text-sm">· {formatRelativeTime(log.created_at)}</span>
              </p>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm italic">No recent activity.</p>
        )}
      </div>
    </div>
  )
}
