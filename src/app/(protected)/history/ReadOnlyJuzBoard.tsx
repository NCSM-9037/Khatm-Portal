'use client'

type ReadOnlyJuzBoardProps = {
  juzAssignments: any[]
}

export function ReadOnlyJuzBoard({ juzAssignments }: ReadOnlyJuzBoardProps) {
  // Sort assignments by juz number
  const sortedAssignments = [...juzAssignments].sort((a, b) => a.juz_number - b.juz_number)

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
      {sortedAssignments.map((juz) => (
        <div 
          key={juz.id} 
          className="relative flex flex-col items-center justify-center p-3 h-24 rounded-[var(--radius-control)] border border-muted/20 bg-card transition-all hover:border-primary/30"
        >
          <span className="text-2xl mb-1 text-ink">{juz.juz_number}</span>
          
          <div className="text-[10px] uppercase tracking-wider text-center w-full truncate px-1 text-muted">
            {juz.status === 'COMPLETED' ? (
              <span className="text-primary font-medium">
                {juz.reserver?.name?.split(' ')[0] || 'Unknown'}
              </span>
            ) : (
              <span>Not completed</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
