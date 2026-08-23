'use client'

import { JuzGrid } from './JuzGrid'
import { closeKhatm } from '@/app/actions/khatm'
import { useTransition } from 'react'

type KhatmProps = {
  khatm: any // We can type this better, but omitting full type for brevity
  currentUserId: string
  isAdmin: boolean
}

export function KhatmBoard({ khatm, currentUserId, isAdmin }: KhatmProps) {
  const [isPending, startTransition] = useTransition()
  
  const allCompleted = khatm.juzAssignments.every((j: any) => j.status === 'COMPLETED')
  
  const handleClose = () => {
    if (!confirm('Are you sure you want to close this Khatm?')) return
    startTransition(async () => {
      await closeKhatm(khatm.id)
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-[var(--radius-card)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Active Khatm</h2>
          {khatm.niyyah_text && (
            <p className="text-ink/80 italic">"{khatm.niyyah_text}"</p>
          )}
          {khatm.niyyah_category && (
            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-surface text-muted rounded-full">
              {khatm.niyyah_category}
            </span>
          )}
        </div>
        
        {isAdmin && (
          <button
            onClick={handleClose}
            disabled={!allCompleted || isPending}
            className="px-4 py-2 border border-transparent rounded-[var(--radius-control)] shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            title={!allCompleted ? 'All Juz must be completed to close' : ''}
          >
            {isPending ? 'Closing...' : 'Close Khatm'}
          </button>
        )}
      </div>

      <JuzGrid 
        juzAssignments={khatm.juzAssignments}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
      />
    </div>
  )
}
