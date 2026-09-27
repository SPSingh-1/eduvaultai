import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { GeminiService } from '../../ai/gemini.service'
import { DealsService } from '../../services/deals.service'

const router = Router()
const prisma = new PrismaClient()

// GET /api/v1/schools — List schools with search & filters
router.get('/', async (req, res) => {
  try {
    const { search, city, type, page = '1', limit = '50' } = req.query as Record<string, string>
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { principalName: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (city) where.city = { equals: city, mode: 'insensitive' }
    if (type && type !== 'all') where.type = type

    try {
      const [schools, total] = await Promise.all([
        prisma.school.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: [{ phone: 'desc' }, { createdAt: 'desc' }],
          include: {
            contacts: true,
            leads: { select: { id: true, leadScore: true, status: true } },
          },
        }),
        prisma.school.count({ where }),
      ])

      if (schools && schools.length > 0) {
        return res.json({
          success: true,
          data: schools,
          meta: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        })
      }
    } catch (dbErr) {
      console.warn('Prisma DB query fallback in GET /schools:', (dbErr as Error).message)
    }

    // Fallback: Populate schools list from DealsService deals store
    const deals = DealsService.loadDeals()
    let mapped = deals.map((d) => ({
      id: `sch_${d.id}`,
      name: d.schoolName,
      city: d.city,
      address: `${d.city}, India`,
      website: d.website,
      phone: d.phone,
      email: d.email,
      studentCount: d.studentCount,
      type: 'cbse',
      principalName: d.contactName,
      contacts: [{ firstName: d.contactName, phone: d.phone, email: d.email }],
      leads: [{ id: d.id, leadScore: d.leadScore, status: d.stage === 'ai_strong' ? 'qualified' : 'new' }],
    }))

    if (search) {
      const q = search.toLowerCase()
      mapped = mapped.filter((s) => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q))
    }

    res.json({
      success: true,
      data: mapped,
      meta: {
        page: 1,
        limit: parseInt(limit),
        total: mapped.length,
        totalPages: Math.ceil(mapped.length / parseInt(limit)) || 1,
      },
    })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// GET /api/v1/schools/:id — Get School 360° Profile
router.get('/:id', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: req.params.id },
      include: {
        contacts: true,
        leads: {
          include: {
            assignee: true,
          },
        },
      },
    })

    if (!school) {
      return res.status(404).json({ success: false, error: 'School not found' })
    }

    res.json({ success: true, data: school })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// POST /api/v1/schools — Create Manual School Record
router.post('/', async (req, res) => {
  try {
    const { name, type, city, state, address, website, phone, email, studentCount, principalName } = req.body

    const org = await prisma.organization.findFirst()
    if (!org) return res.status(400).json({ success: false, error: 'No active organization found' })

    const school = await prisma.school.create({
      data: {
        organizationId: org.id,
        name,
        type: type || 'cbse',
        city,
        state,
        address,
        website,
        phone,
        email,
        studentCount: studentCount ? parseInt(studentCount) : null,
        principalName,
        source: 'manual',
      },
    })

    res.status(201).json({ success: true, data: school })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// POST /api/v1/schools/import — Bulk CSV Import
router.post('/import', async (req, res) => {
  try {
    const { schools } = req.body
    if (!Array.isArray(schools) || schools.length === 0) {
      return res.status(400).json({ success: false, error: 'No schools provided for import' })
    }

    const org = await prisma.organization.findFirst()
    if (!org) return res.status(400).json({ success: false, error: 'No active organization found' })

    const created = await prisma.school.createMany({
      data: schools.map((s: any) => ({
        organizationId: org.id,
        name: s.name,
        type: s.type || 'cbse',
        city: s.city || 'Unknown',
        state: s.state || 'India',
        website: s.website || null,
        phone: s.phone || null,
        email: s.email || null,
        studentCount: s.studentCount ? parseInt(s.studentCount) : 1000,
        principalName: s.principalName || null,
        source: 'csv_import',
      })),
      skipDuplicates: true,
    })

    res.json({ success: true, count: created.count })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// POST /api/v1/schools/:id/website-research — Website Vision AI via Gemini
router.post('/:id/website-research', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({ where: { id: req.params.id } })
    if (!school) return res.status(404).json({ success: false, error: 'School not found' })

    // Uses robust generateWebsiteIntelligence (with retry + fallback)
    const parsed = await GeminiService.generateWebsiteIntelligence(
      school.name,
      school.city || 'India',
      school.website || '',
      school.studentCount || 1200
    )

    // Save website intelligence JSON back to school record
    const updated = await prisma.school.update({
      where: { id: school.id },
      data: { websiteData: parsed as any },
      include: { contacts: true },
    })

    res.json({ success: true, data: parsed, school: updated })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

export default router
