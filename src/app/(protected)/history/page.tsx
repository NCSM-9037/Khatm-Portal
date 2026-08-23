import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { requireFamilyMembership } from '@/lib/family'
import { KhatmHistoryList } from './KhatmHistoryList'
import { HistoryFilters } from './HistoryFilters'

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const activeFamilyId = cookieStore.get('activeFamilyId')?.value

  if (!activeFamilyId) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl font-bold">Khatm History</h1>
        <p className="text-muted">Please select or create a family first.</p>
      </div>
    )
  }

  await requireFamilyMembership(user.id, activeFamilyId)
  
  const resolvedParams = await searchParams
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : ''
  const dateRange = typeof resolvedParams.dateRange === 'string' ? resolvedParams.dateRange : ''

  const where: any = {
    family_id: activeFamilyId,
    status: 'CLOSED',
  }

  if (search) {
    where.niyyah_text = {
      contains: search,
      mode: 'insensitive',
    }
  }
  
  if (dateRange === 'last_30_days') {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    where.closed_at = {
      gte: thirtyDaysAgo
    }
  } else if (dateRange === 'last_year') {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    where.closed_at = {
      gte: oneYearAgo
    }
  }

  const closedKhatms = await prisma.khatm.findMany({
    where,
    orderBy: {
      closed_at: 'desc',
    },
    include: {
      juzAssignments: {
        include: { reserver: true }
      }
    }
  })

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold font-heading">Khatm History</h1>
        <HistoryFilters currentSearch={search} currentDateRange={dateRange} />
      </div>
      
      {closedKhatms.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-[var(--radius-card)] border border-muted/20 px-4">
          <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📜</span>
          </div>
          <p className="text-lg text-ink font-medium">No history yet</p>
          <p className="text-sm text-muted mt-2 max-w-sm mx-auto">Once your family completes a Khatm, it will appear here so you can look back on your achievements.</p>
        </div>
      ) : (
        <KhatmHistoryList khatms={closedKhatms} />
      )}
    </div>
  )
}
