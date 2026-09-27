import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding EduVault AI Database...')

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'eduvault-india' },
    update: {},
    create: {
      name: 'EduVault India',
      slug: 'eduvault-india',
      plan: 'free',
    },
  })

  // 2. Create User
  const user = await prisma.user.upsert({
    where: { email: 'architect@eduvault.ai' },
    update: {},
    create: {
      organizationId: org.id,
      email: 'architect@eduvault.ai',
      name: 'Shashi Sales Architect',
      role: 'owner',
      passwordHash: '$2a$10$YourHashedPasswordHere',
    },
  })

  // 3. Create Sample Schools
  const school1 = await prisma.school.create({
    data: {
      organizationId: org.id,
      name: 'Delhi Public School (DPS) International',
      type: 'cbse',
      city: 'Pune',
      state: 'Maharashtra',
      website: 'https://dpspune.edu.in',
      phone: '+91 20 2690 2100',
      email: 'info@dpspune.edu.in',
      studentCount: 1850,
      principalName: 'Dr. Sunita Sharma',
      source: 'open_street_map',
      confidence: 0.98,
    },
  })

  const school2 = await prisma.school.create({
    data: {
      organizationId: org.id,
      name: 'Ryan International Academy',
      type: 'icse',
      city: 'Mumbai',
      state: 'Maharashtra',
      website: 'https://ryaninternational.org',
      phone: '+91 22 2880 1234',
      email: 'contact@ryaninternational.org',
      studentCount: 2200,
      principalName: 'Mr. Rajesh Nair',
      source: 'open_street_map',
      confidence: 0.96,
    },
  })

  // 4. Create Sample Contact
  const contact = await prisma.contact.create({
    data: {
      organizationId: org.id,
      schoolId: school1.id,
      firstName: 'Sunita',
      lastName: 'Sharma',
      email: 'principal@dpspune.edu.in',
      phone: '+91 98230 11223',
      designation: 'Principal',
    },
  })

  // 5. Create Sample Lead
  await prisma.lead.create({
    data: {
      organizationId: org.id,
      schoolId: school1.id,
      contactId: contact.id,
      assignedTo: user.id,
      status: 'qualified',
      leadScore: 92,
      scoreBreakdown: {
        schoolSize: 30,
        websiteQuality: 25,
        decisionMakerFound: 20,
        icpFit: 17,
      },
    },
  })

  // 6. Create AI Agents Records
  const agentTypes = [
    { name: 'School Discovery Agent', type: 'discovery' },
    { name: 'Lead Intelligence Agent', type: 'lead_intelligence' },
    { name: 'Contact Intelligence Agent', type: 'contact_intelligence' },
    { name: 'Lead Scoring Agent', type: 'lead_scoring' },
    { name: 'Email Personalization Agent', type: 'email_personalization' },
  ] as const

  for (const agent of agentTypes) {
    await prisma.aIAgent.create({
      data: {
        organizationId: org.id,
        name: agent.name,
        type: agent.type,
        status: 'active',
        model: 'gemini-1.5-flash',
      },
    })
  }

  console.log('✅ Database Seeding Completed Successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
