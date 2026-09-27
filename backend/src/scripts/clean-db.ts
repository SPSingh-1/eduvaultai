import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning Database — Deleting all dummy schools, leads, contacts...')

  await prisma.lead.deleteMany({})
  await prisma.contact.deleteMany({})
  await prisma.school.deleteMany({})
  await prisma.aIAgent.deleteMany({})

  console.log('✅ Database is now 100% BLANK & CLEAN!')
}

main()
  .catch((e) => {
    console.error('❌ Cleaning error:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
