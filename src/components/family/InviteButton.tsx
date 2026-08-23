'use client'

import { useState } from 'react'
import { generateInviteLinkAction } from '@/app/actions/family'

export function InviteButton({ familyId }: { familyId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  async function handleGenerateInvite() {
    setIsLoading(true)
    try {
      const token = await generateInviteLinkAction(familyId)
      const link = `${window.location.origin}/invite/${token}`
      setInviteLink(link)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerateInvite}
        disabled={isLoading}
        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-[var(--radius-control)] hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate Invite Link'}
      </button>
      
      {inviteLink && (
        <div className="p-3 bg-surface border border-muted/20 rounded-[var(--radius-control)] flex flex-col gap-2">
          <p className="text-sm font-medium text-ink">Share this link to invite members:</p>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={inviteLink}
              className="flex-1 text-sm p-2 border border-muted/20 rounded-[var(--radius-control)] bg-transparent text-ink"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(inviteLink)
                alert('Copied to clipboard!')
              }}
              className="px-3 py-2 bg-muted/10 text-ink text-sm font-medium rounded-[var(--radius-control)] hover:bg-muted/20"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
