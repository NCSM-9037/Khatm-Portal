import { prisma } from '@/lib/prisma'
import { joinFamilyAction } from '@/app/actions/family'
import { getCurrentUser } from '@/lib/auth'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { family: true, creator: true }
  })

  if (!invite || invite.revoked_at || (invite.expires_at && invite.expires_at < new Date())) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invite</h2>
          <p className="text-gray-600">This invite link is invalid, expired, or has been revoked.</p>
        </div>
      </div>
    )
  }

  if (invite.family.deleted_at !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invite No Longer Valid</h2>
          <p className="text-gray-600">This family has been deleted. You can no longer join it.</p>
        </div>
      </div>
    )
  }

  const user = await getCurrentUser()
  // bind token to the action
  const actionWithToken = joinFamilyAction.bind(null, token)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join {invite.family.name}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Invited by {invite.creator.name}
          </p>
        </div>
        <form action={actionWithToken}>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {user ? 'Accept Invite' : 'Log in to Accept Invite'}
          </button>
        </form>
      </div>
    </div>
  )
}
