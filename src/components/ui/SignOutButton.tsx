'use client'

import { LogOut } from 'lucide-react'
import { signOutAction } from '@/app/actions/auth'

export function SignOutButton() {
  return (
    <button 
      onClick={() => signOutAction()} 
      className="p-2 text-muted hover:text-alert transition-colors rounded-full hover:bg-muted/10 ml-2"
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut className="w-5 h-5" />
    </button>
  )
}
