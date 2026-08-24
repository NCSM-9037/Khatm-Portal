import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/lib/auth'
import { getUserFamilies } from '@/lib/family'
import { FamilySwitcher } from '@/components/ui/FamilySwitcher'
import { LiveDashboardUpdater } from '@/components/dashboard/LiveDashboardUpdater'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { SignOutButton } from '@/components/ui/SignOutButton'
import { LayoutDashboard, History, Activity } from 'lucide-react'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const families = await getUserFamilies(user.id)
  const cookieStore = await cookies()
  const activeFamilyId = cookieStore.get('activeFamilyId')?.value
  
  let activeFamily = families.find((f) => f.id === activeFamilyId) || null
  if (!activeFamily && families.length > 0) {
    activeFamily = families[0]
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface border-b border-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 justify-between items-center">
            <div className="flex items-center min-w-0 flex-1 mr-2">
              <span className="text-xl sm:text-2xl font-bold font-heading text-primary mr-2 sm:mr-8 tracking-wide truncate hidden sm:inline-block">Khatm Portal</span>
              <span className="text-xl sm:text-2xl font-bold font-heading text-primary mr-2 tracking-wide sm:hidden">KP</span>
              <div className="min-w-0">
                <FamilySwitcher activeFamily={activeFamily} families={families} isPlatformAdmin={user.is_platform_admin} />
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="flex items-center gap-4 mr-2 hidden md:flex">
                <a href="/dashboard" className="text-sm font-medium text-ink hover:text-primary transition-colors">Dashboard</a>
                <a href="/history" className="text-sm font-medium text-ink hover:text-primary transition-colors">History</a>
                <a href="/my-activity" className="text-sm font-medium text-ink hover:text-primary transition-colors">My Activity</a>
              </div>
              <NotificationBell />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink hidden sm:inline-block">{user.name || 'User'}</span>
                {user.is_platform_admin && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 hidden sm:inline-flex">
                    Admin
                  </span>
                )}
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </nav>
      {activeFamilyId && <LiveDashboardUpdater familyId={activeFamilyId} />}
      <main className="mx-auto max-w-7xl py-6 sm:py-8 pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-muted/20 z-40 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          <a href="/dashboard" className="flex flex-col items-center justify-center w-full h-full text-ink hover:text-primary transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Dashboard</span>
          </a>
          <a href="/history" className="flex flex-col items-center justify-center w-full h-full text-ink hover:text-primary transition-colors border-l border-muted/10">
            <History className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">History</span>
          </a>
          <a href="/my-activity" className="flex flex-col items-center justify-center w-full h-full text-ink hover:text-primary transition-colors border-l border-muted/10">
            <Activity className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1">Activity</span>
          </a>
        </div>
      </nav>
    </div>
  )
}
