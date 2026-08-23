'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LiveDashboardUpdater({ familyId }: { familyId: string }) {
  const router = useRouter()

  useEffect(() => {
    if (!familyId) return

    console.log(`[Realtime] Initiating subscription for familyId: ${familyId}`)
    const supabase = createClient()
    
    // Debug: verify we actually have an active session in the browser client
    supabase.auth.getSession().then(({ data, error }) => {
      console.log(`[Realtime] Client session check:`, data.session ? 'Valid session found' : 'No session!', error || '')
    })
    
    // Subscribe to ActivityLog inserts for the active family
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ActivityLog',
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          console.log('[Realtime] Payload received!', payload)
          // When a new activity occurs, refresh the server component
          // to fetch the latest Khatm data, stats, and feed
          router.refresh()
        }
      )
      .subscribe((status, err) => {
        console.log(`[Realtime] Subscription status: ${status}`)
        if (err) {
          console.error('[Realtime] Subscription error:', err)
        }
      })

    return () => {
      console.log(`[Realtime] Cleaning up subscription for familyId: ${familyId}`)
      supabase.removeChannel(channel)
    }
  }, [familyId, router])

  return null
}
