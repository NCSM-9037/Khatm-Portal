import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { requireFamilyMembership } from '@/lib/family'
import { prisma } from '@/lib/prisma'
import { MemberActions } from '@/components/family/MemberActions'
import { InviteButton } from '@/components/family/InviteButton'
import { DeleteFamilyForm } from '@/components/family/DeleteFamilyForm'

export default async function FamilyMembersPage({
  params,
}: {
  params: Promise<{ familyId: string }>
}) {
  const { familyId } = await params
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const userMembership = await requireFamilyMembership(user.id, familyId)
  
  if (userMembership.role !== 'ADMIN') {
    redirect('/dashboard') // Only admins can see this page
  }

  const family = await prisma.family.findUnique({
    where: { id: familyId }
  })
  
  if (!family) redirect('/dashboard')

  async function updateReminderThresholdAction(formData: FormData) {
    'use server'
    const threshold = formData.get('threshold')
    if (threshold) {
      await prisma.family.update({
        where: { id: familyId },
        data: { reminder_threshold_days: Number(threshold) }
      })
      revalidatePath(`/families/${familyId}/members`)
    }
  }

  const memberships = await prisma.membership.findMany({
    where: {
      family_id: familyId,
      status: {
        in: ['ACTIVE', 'INVITED']
      }
    },
    include: {
      user: true,
    },
    orderBy: [
      { role: 'asc' }, // ADMINs first, assuming enum is ADMIN, MEMBER. Wait, enum string comparison? 'ADMIN' < 'MEMBER'. Yes.
      { joined_at: 'asc' },
    ]
  })

  const adminCount = memberships.filter(m => m.role === 'ADMIN' && m.status === 'ACTIVE').length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-primary">Family Members</h1>
          <p className="text-muted mt-1">Manage members and their roles in your family.</p>
        </div>
      </div>

      <div className="bg-surface rounded-[var(--radius-card)] border border-muted/20 overflow-hidden">
        <ul className="divide-y divide-muted/20">
          {memberships.map((membership) => (
            <li key={membership.id} className="p-4 sm:p-6 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium text-ink flex items-center gap-2">
                  {membership.user.name}
                  {membership.user_id === user.id && (
                    <span className="text-xs bg-muted/10 text-muted px-2 py-0.5 rounded-full">You</span>
                  )}
                </span>
                <span className="text-sm text-muted">
                  {membership.role} • {membership.status} • Joined {new Date(membership.joined_at).toLocaleDateString()}
                </span>
              </div>
              
              {membership.user_id !== user.id && (
                <MemberActions 
                  familyId={familyId}
                  memberId={membership.user_id}
                  currentRole={membership.role}
                  canRemoveAdmin={adminCount > 1}
                />
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-8 border-t border-muted/20">
        <h2 className="text-xl font-semibold font-heading text-ink mb-4">Invite New Members</h2>
        <InviteButton familyId={familyId} />
      </div>

      <div className="pt-8 border-t border-muted/20">
        <h2 className="text-xl font-semibold font-heading text-ink mb-4">Family Settings</h2>
        
        <div className="bg-surface p-6 rounded-[var(--radius-card)] border border-muted/20">
          <form action={updateReminderThresholdAction} className="space-y-4">
            <input type="hidden" name="familyId" value={familyId} />
            <div>
              <label htmlFor="threshold" className="block text-sm font-medium text-ink">
                Reminder Threshold (Days)
              </label>
              <p className="text-sm text-muted mb-2">
                Number of days a Juz remains reserved before a reminder is sent.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  name="threshold"
                  id="threshold"
                  defaultValue={family.reminder_threshold_days}
                  min="1"
                  max="30"
                  className="block w-32 rounded-[var(--radius-control)] border-muted/30 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-background text-ink px-3 py-2 border"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-[var(--radius-control)] shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-surface p-6 rounded-[var(--radius-card)] border border-muted/20">
          <h3 className="text-lg font-medium text-ink mb-2">Export Data</h3>
          <p className="text-sm text-muted mb-4">
            Download a complete JSON backup of your family's Khatm history, members, and Juz assignments.
          </p>
          <a
            href={`/api/families/${familyId}/export`}
            download
            className="inline-flex items-center px-4 py-2 border border-muted/30 rounded-[var(--radius-control)] shadow-sm text-sm font-medium text-ink bg-background hover:bg-muted/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            Export Family Data
          </a>
        </div>

        {user.is_platform_admin && (
          <DeleteFamilyForm familyId={familyId} familyName={family.name} />
        )}
      </div>
    </div>
  )
}
