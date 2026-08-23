import { createClient } from './supabase/server'
import { prisma } from './prisma'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (error || !authUser) {
    return null
  }

  // Fetch from our User table which stays the source of truth for profile data
  const user = await prisma.user.findUnique({
    where: { id: authUser.id }
  })

  return user
}
