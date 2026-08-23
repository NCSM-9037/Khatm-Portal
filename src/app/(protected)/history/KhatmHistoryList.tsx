'use client'

import { useState } from 'react'
import { ReadOnlyJuzBoard } from './ReadOnlyJuzBoard'

type KhatmHistoryListProps = {
  khatms: any[]
}

export function KhatmHistoryList({ khatms }: KhatmHistoryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {khatms.map((khatm) => {
        const startDate = new Date(khatm.started_at)
        const closeDate = khatm.closed_at ? new Date(khatm.closed_at) : new Date()
        
        // Calculate duration in days
        const durationMs = closeDate.getTime() - startDate.getTime()
        const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)))
        
        // Count unique participants
        const participants = new Set(
          khatm.juzAssignments
            .filter((j: any) => j.reserved_by)
            .map((j: any) => j.reserved_by)
        ).size

        const isExpanded = expandedId === khatm.id

        return (
          <div key={khatm.id} className="bg-card border border-muted/20 rounded-[var(--radius-card)] overflow-hidden transition-all">
            <div 
              className="p-4 sm:p-6 cursor-pointer hover:bg-surface flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              onClick={() => setExpandedId(isExpanded ? null : khatm.id)}
            >
              <div className="space-y-1 flex-1">
                <h3 className="font-semibold text-lg">
                  {khatm.niyyah_text ? `"${khatm.niyyah_text}"` : 'No specific Niyyah'}
                </h3>
                <div className="text-sm text-muted flex flex-wrap gap-x-4 gap-y-1">
                  <span suppressHydrationWarning>Started: {startDate.toLocaleDateString()}</span>
                  {khatm.closed_at && <span suppressHydrationWarning>Closed: {closeDate.toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-4 md:gap-1 text-sm md:text-right shrink-0">
                <span className="bg-surface md:bg-transparent px-2 py-1 md:p-0 rounded text-ink">
                  Duration: {durationDays} day{durationDays !== 1 ? 's' : ''}
                </span>
                <span className="bg-surface md:bg-transparent px-2 py-1 md:p-0 rounded text-ink">
                  {participants} participant{participants !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            {isExpanded && (
              <div className="p-4 sm:p-6 border-t border-muted/20 bg-surface/50">
                <h4 className="text-md font-medium mb-4 text-ink">Final Juz' Board</h4>
                <ReadOnlyJuzBoard juzAssignments={khatm.juzAssignments} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
