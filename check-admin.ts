import { prisma } from './src/lib/prisma'; async function main() { console.log(await prisma.user.findMany()); } main().finally(() => prisma.$disconnect());
