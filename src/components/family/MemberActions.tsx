'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { removeMemberAction } from '@/app/actions/family'

type Role = 'ADMIN' | 'MEMBER'

export function MemberActions({ 
  familyId, 
  memberId, 
  currentRole, 
  canRemoveAdmin 
}: { 
  familyId: string
  memberId: string
  currentRole: Role
  canRemoveAdmin: boolean
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleRemove() {
    if (currentRole === 'ADMIN' && !canRemoveAdmin) {
      alert('Cannot remove the last admin of the family')
      return
    }
    if (!confirm('Are you sure you want to remove this member?')) return
    setIsLoading(true)
    try {
      await removeMemberAction(familyId, memberId)
      router.refresh()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleRemove} 
        disabled={isLoading || (currentRole === 'ADMIN' && !canRemoveAdmin)}
        className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-[var(--radius-control)] hover:bg-red-200 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  )
}
