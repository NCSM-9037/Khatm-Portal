import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function MyActivityPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const userAssignments = await prisma.juzAssignment.findMany({
    where: {
      reserved_by: user.id,
      khatm: {
        is: {
          family: {
            is: {
              deleted_at: null
            }
          }
        }
      }
    },
    include: {
      khatm: {
        include: {
          family: true
        }
      }
    },
    orderBy: [
      { completed_at: 'desc' },
      { reserved_at: 'desc' },
    ]
  })

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold font-heading">My Activity</h1>
      
      {userAssignments.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-[var(--radius-card)] border border-muted/20 px-4">
          <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌱</span>
          </div>
          <p className="text-lg text-ink font-medium">No activity yet</p>
          <p className="text-sm text-muted mt-2 max-w-sm mx-auto">Reserve and complete a Juz to see your progress tracked here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userAssignments.map((assignment) => {
            const isCompleted = assignment.status === 'COMPLETED'
            const date = isCompleted ? assignment.completed_at : assignment.reserved_at
            
            return (
              <div 
                key={assignment.id} 
                className="bg-card border border-muted/20 rounded-[var(--radius-card)] p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-xl font-bold ${
                    isCompleted ? 'bg-primary text-white' : 'bg-surface border-2 border-primary text-primary'
                  }`}>
                    {assignment.juz_number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-ink">
                      Juz' {assignment.juz_number}
                    </h3>
                    <p className="text-sm text-muted">
                      {assignment.khatm.family.name} 
                      {assignment.khatm.niyyah_text ? ` · "${assignment.khatm.niyyah_text}"` : ''}
                    </p>
                  </div>
                </div>
                
                <div className="text-right sm:text-right text-sm">
                  <div className={`font-medium ${isCompleted ? 'text-primary' : 'text-alert'}`}>
                    {isCompleted ? 'Completed' : 'Reserved'}
                  </div>
                  {date && (
                    <div className="text-muted">
                      {new Date(date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
