'use client'

import { JuzCell } from './JuzCell'

type JuzGridProps = {
  juzAssignments: any[]
  currentUserId: string
  isAdmin: boolean
}

export function JuzGrid({ juzAssignments, currentUserId, isAdmin }: JuzGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
      {juzAssignments.map((juz) => (
        <JuzCell 
          key={juz.id} 
          juz={juz} 
          currentUserId={currentUserId} 
          isAdmin={isAdmin} 
        />
      ))}
    </div>
  )
}
