import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/contacts — List contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        school: true,
      },
    })
    res.json({ success: true, data: contacts })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// POST /api/v1/contacts — Create contact for a school
router.post('/', async (req, res) => {
  try {
    const { schoolId, firstName, lastName, email, phone, whatsapp, designation, linkedinUrl } = req.body

    const org = await prisma.organization.findFirst()
    if (!org) return res.status(400).json({ success: false, error: 'No active organization found' })

    const contact = await prisma.contact.create({
      data: {
        organizationId: org.id,
        schoolId,
        firstName,
        lastName,
        email,
        phone,
        whatsapp,
        designation: designation || 'Principal',
        linkedinUrl,
      },
      include: { school: true },
    })

    res.status(201).json({ success: true, data: contact })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// GET /api/v1/contacts/:id — Get contact profile
router.get('/:id', async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id },
      include: { school: true, leads: true },
    })

    if (!contact) return res.status(404).json({ success: false, error: 'Contact not found' })

    res.json({ success: true, data: contact })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

export default router
