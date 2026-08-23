'use client'

import { useState, useTransition } from 'react'
import { Check, ChevronsUpDown, PlusCircle, Share } from 'lucide-react'
import { setActiveFamilyAction, generateInviteLinkAction } from '@/app/actions/family'
import { useRouter } from 'next/navigation'

type Family = {
  id: string
  name: string
  icon: string | null
}

interface FamilySwitcherProps {
  activeFamily: Family | null
  families: Family[]
  isPlatformAdmin?: boolean
}

export function FamilySwitcher({ activeFamily, families, isPlatformAdmin }: FamilySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSwitch = (familyId: string) => {
    setIsOpen(false)
    startTransition(async () => {
      await setActiveFamilyAction(familyId)
    })
  }

  const handleCopyInvite = async () => {
    if (!activeFamily) return
    try {
      const token = await generateInviteLinkAction(activeFamily.id)
      const url = `${window.location.origin}/invite/${token}`
      await navigator.clipboard.writeText(url)
      alert('Invite link copied to clipboard!')
    } catch (err: any) {
      alert(err.message || 'Failed to generate invite link')
    }
  }

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex w-full justify-between items-center gap-x-1.5 rounded-[var(--radius-control)] bg-card px-3 py-2 text-sm font-medium text-ink shadow-sm ring-1 ring-inset ring-muted/20 hover:bg-muted/10 disabled:opacity-50"
          disabled={isPending}
        >
          {activeFamily ? activeFamily.name : 'Select a family'}
          <ChevronsUpDown className="-mr-1 h-5 w-5 text-muted" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-[var(--radius-card)] bg-surface shadow-lg ring-1 ring-muted/20 focus:outline-none">
          <div className="py-1">
            {families.map((family) => (
              <button
                key={family.id}
                onClick={() => handleSwitch(family.id)}
                className="group flex w-full items-center px-4 py-2 text-sm text-ink hover:bg-muted/10"
              >
                <div className="flex-1 text-left">{family.name}</div>
                {activeFamily?.id === family.id && (
                  <Check className="h-5 w-5 text-primary" aria-hidden="true" />
                )}
              </button>
            ))}
            
            <hr className="my-1 border-muted/20" />
            
            {isPlatformAdmin && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/families/create')
                }}
                className="group flex w-full items-center px-4 py-2 text-sm text-primary hover:bg-muted/10"
              >
                <PlusCircle className="mr-3 h-5 w-5 text-primary/70 group-hover:text-primary" aria-hidden="true" />
                Create Family
              </button>
            )}

            {activeFamily && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  handleCopyInvite()
                }}
                className="group flex w-full items-center px-4 py-2 text-sm text-ink hover:bg-muted/10"
              >
                <Share className="mr-3 h-5 w-5 text-muted group-hover:text-ink" aria-hidden="true" />
                Copy Invite Link
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
