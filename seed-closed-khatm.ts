import { prisma } from './src/lib/prisma'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  const family = await prisma.family.findFirst()
  if (!family) {
    console.log('No family found.')
    return
  }
  
  const starter = await prisma.user.findFirst()
  if (!starter) return

  // Create a closed Khatm
  const khatm = await prisma.khatm.create({
    data: {
      family_id: family.id,
      niyyah_text: 'For the deceased in Palestine',
      niyyah_category: 'Other',
      status: 'CLOSED',
      started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      closed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),  // 1 day ago
      started_by: starter.id,
    }
  })

  // Assign some Juz
  for (let i = 1; i <= 30; i++) {
    await prisma.juzAssignment.create({
      data: {
        khatm_id: khatm.id,
        juz_number: i,
        status: 'COMPLETED',
        reserved_by: starter.id,
        reserved_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        completed_at: new Date(Date.now() - (6 - (i % 5)) * 24 * 60 * 60 * 1000)
      }
    })
  }

  console.log('Created closed Khatm:', khatm.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
