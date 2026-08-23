'use client'

import { useTransition, useRef } from 'react'
import { reserveJuz, completeJuz, unreserveJuz } from '@/app/actions/khatm'

type JuzStatus = 'UNCLAIMED' | 'RESERVED' | 'COMPLETED'

type JuzAssignment = {
  id: string
  juz_number: number
  status: JuzStatus
  reserved_by: string | null
  reserver?: { name: string } | null
}

type JuzCellProps = {
  juz: JuzAssignment
  currentUserId: string
  isAdmin: boolean
}

export function JuzCell({ juz, currentUserId, isAdmin }: JuzCellProps) {
  const [isPending, startTransition] = useTransition()
  const isTransitioning = useRef(false)

  const isYours = juz.status !== 'UNCLAIMED' && juz.reserved_by === currentUserId
  const isSomeoneElses = juz.status !== 'UNCLAIMED' && juz.reserved_by !== currentUserId

  const handleClick = () => {
    if (isPending || isTransitioning.current) return
    
    if (juz.status === 'UNCLAIMED') {
      isTransitioning.current = true
      startTransition(async () => {
        try {
          await reserveJuz(juz.id)
        } finally {
          isTransitioning.current = false
        }
      })
    } else if (isYours && juz.status === 'RESERVED') {
      isTransitioning.current = true
      startTransition(async () => {
        try {
          await completeJuz(juz.id)
        } finally {
          isTransitioning.current = false
        }
      })
    }
  }

  const handleUnreserve = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to unreserve Juz ${juz.juz_number}?`)) return
    if (isPending || isTransitioning.current) return
    
    isTransitioning.current = true
    startTransition(async () => {
      try {
        await unreserveJuz(juz.id)
      } finally {
        isTransitioning.current = false
      }
    })
  }

  // Determine styles based on rules
  // Unclaimed: border border-muted/40 bg-transparent
  // Reserved (by someone else): border-2 border-primary text-primary bg-transparent
  // Yours (reserved by you): bg-primary text-white
  // Completed: bg-accent text-ink (gold fill)

  let cellStyles = 'border border-muted/40 bg-transparent' // default unclaimed
  
  if (juz.status === 'COMPLETED') {
    cellStyles = 'bg-accent text-ink font-bold'
  } else if (isYours) {
    cellStyles = 'bg-primary text-white font-semibold shadow-inner'
  } else if (isSomeoneElses) {
    cellStyles = 'border-2 border-primary text-primary bg-transparent'
  }

  return (
    <div 
      className={`relative flex flex-col items-center justify-center p-4 h-24 rounded-[var(--radius-control)] transition-all ${
        juz.status === 'UNCLAIMED' || (isYours && juz.status === 'RESERVED')
          ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' 
          : 'cursor-default'
      } ${cellStyles} ${isPending ? 'opacity-50' : ''}`}
      onClick={handleClick}
    >
      <span className="text-2xl mb-1">{juz.juz_number}</span>
      
      {/* Status indicator */}
      <div className="text-[10px] uppercase tracking-wider text-center w-full truncate px-1">
        {juz.status === 'UNCLAIMED' && 'Unclaimed'}
        {juz.status === 'COMPLETED' && 'Completed'}
        {juz.status === 'RESERVED' && isYours && 'Tap to Complete'}
        {juz.status === 'RESERVED' && isSomeoneElses && (
          <span className="opacity-80">By {juz.reserver?.name?.split(' ')[0] || 'User'}</span>
        )}
      </div>

      {/* Admin actions menu */}
      {isAdmin && juz.status !== 'UNCLAIMED' && (
        <button
          onClick={handleUnreserve}
          disabled={isPending}
          className="absolute -top-2 -right-2 w-6 h-6 bg-surface border border-muted rounded-full flex items-center justify-center text-alert shadow-sm hover:bg-alert hover:text-white transition-colors"
          title="Unreserve"
        >
          ×
        </button>
      )}
    </div>
  )
}
