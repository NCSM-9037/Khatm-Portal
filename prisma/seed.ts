import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding the database...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@example.com',
    },
  });

  // Create demo family
  // We'll just create a new one each time or find first.
  let family = await prisma.family.findFirst({
    where: { created_by: user.id }
  });

  if (!family) {
    family = await prisma.family.create({
      data: {
        name: 'The Demo Family',
        description: 'A family for testing the Khatm portal',
        created_by: user.id,
      },
    });
  }

  // Ensure membership
  await prisma.membership.upsert({
    where: {
      user_id_family_id: {
        user_id: user.id,
        family_id: family.id,
      },
    },
    update: {
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      user_id: user.id,
      family_id: family.id,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create an active Khatm
  let khatm = await prisma.khatm.findFirst({
    where: { family_id: family.id }
  });

  if (!khatm) {
    khatm = await prisma.khatm.create({
      data: {
        family_id: family.id,
        niyyah_text: 'For the well-being of the family and community.',
        status: 'ACTIVE',
        started_by: user.id,
      },
    });

    // Generate JuzAssignments for this Khatm (1 to 30)
    // 1-10: Completed
    // 11-15: Reserved
    // 16-30: Unclaimed
    const assignments = [];
    for (let i = 1; i <= 30; i++) {
      let status: 'COMPLETED' | 'RESERVED' | 'UNCLAIMED' = 'UNCLAIMED';
      let reserved_by = null;
      let completed_at = null;
      
      if (i <= 10) {
        status = 'COMPLETED';
        reserved_by = user.id;
        completed_at = new Date();
      } else if (i <= 15) {
        status = 'RESERVED';
        reserved_by = user.id;
      }

      assignments.push({
        khatm_id: khatm.id,
        juz_number: i,
        status,
        reserved_by,
        completed_at,
        reserved_at: reserved_by ? new Date() : null,
      });
    }

    await prisma.juzAssignment.createMany({
      data: assignments,
    });
    
    console.log(`Created Khatm with 30 Juz assignments.`);
  }

  console.log('Seeding finished successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
