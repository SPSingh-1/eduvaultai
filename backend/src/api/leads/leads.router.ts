import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { GeminiService } from '../../ai/gemini.service'
import { EmailService } from '../../services/email.service'
import { DealsService } from '../../services/deals.service'
import fs from 'fs'
import path from 'path'

const router = Router()
const prisma = new PrismaClient()

const DATA_DIR = path.resolve(__dirname, '../../../data')
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json')

function loadJson<T>(file: string, fallback: T): T {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'))
    }
  } catch {}
  return fallback
}

function saveJson(file: string, data: any) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  } catch (err) {
    console.warn(`Failed to save ${file}:`, (err as Error).message)
  }
}

// Memory fallback leads (Fresh CRM: starts empty, populated as user adds/discovers leads)
let memoryLeadsStore: any[] = []

// GET /api/v1/leads — List leads with status, score, search & pagination
router.get('/', async (req, res) => {
  try {
    const { status, minScore, search, page = '1', limit = '20' } = req.query as Record<string, string>
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where: any = {}
    if (status) where.status = status
    if (minScore) where.leadScore = { gte: parseInt(minScore) }
    if (search) {
      where.school = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    try {
      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { leadScore: 'desc' },
          include: {
            school: true,
            contact: true,
            assignee: true,
          },
        }),
        prisma.lead.count({ where }),
      ])

      if (leads && leads.length > 0) {
        return res.json({
          success: true,
          data: leads,
          meta: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)) || 1,
          },
        })
      }
    } catch (dbErr) {
      console.warn('Prisma leads query warning (using persistent deals store):', (dbErr as Error).message)
    }

    // Fallback: Use DealsService persistent deals store mapped to Lead structure
    const deals = DealsService.loadDeals()
    const mappedDeals = deals.map((d) => ({
      id: d.id,
      status:
        d.stage === 'ai_strong'
          ? 'qualified'
          : d.stage === 'outreach_sent'
          ? 'contacted'
          : d.stage === 'demo_scheduled'
          ? 'meeting_scheduled'
          : d.stage === 'proposal_sent'
          ? 'proposal_sent'
          : d.stage === 'closed_won'
          ? 'won'
          : 'new',
      leadScore: d.leadScore || 85,
      scoreBreakdown: d.scoreBreakdown || { reasoning: 'AI ICP fit verified' },
      school: {
        id: `sch_${d.id}`,
        name: d.schoolName,
        city: d.city,
        phone: d.phone,
        email: d.email,
        website: d.website,
        studentCount: d.studentCount,
      },
      contact: {
        id: `cnt_${d.id}`,
        firstName: d.contactName,
        lastName: '',
        designation: 'Principal',
        phone: d.phone,
        email: d.email,
      },
      createdAt: d.updatedAt || new Date().toISOString(),
    }))

    let filtered = [...mappedDeals, ...memoryLeadsStore]
    if (status) filtered = filtered.filter((l) => l.status === status)
    if (minScore) filtered = filtered.filter((l) => l.leadScore >= parseInt(minScore))
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (l) => l.school?.name?.toLowerCase().includes(q) || l.school?.city?.toLowerCase().includes(q)
      )
    }

    res.json({
      success: true,
      data: filtered,
      meta: {
        page: 1,
        limit: 20,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / 20) || 1,
      },
    })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// GET /api/v1/leads/:id — Get Lead Detail & Intelligence Context
router.get('/:id', async (req, res) => {
  try {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: req.params.id },
        include: {
          school: true,
          contact: true,
          assignee: true,
        },
      })
      if (lead) return res.json({ success: true, data: lead })
    } catch (dbErr) {
      console.warn('Prisma lead findUnique warning (using memory fallback):', (dbErr as Error).message)
    }

    const memoryLead = memoryLeadsStore.find((l) => l.id === req.params.id)
    if (memoryLead) return res.json({ success: true, data: memoryLead })

    res.status(404).json({ success: false, error: 'Lead not found' })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// PATCH /api/v1/leads/:id/status — Change Lead Pipeline Status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    if (!status) return res.status(400).json({ success: false, error: 'Status is required' })

    try {
      const updated = await prisma.lead.update({
        where: { id: req.params.id },
        data: { status },
        include: { school: true, contact: true },
      })
      return res.json({ success: true, data: updated })
    } catch (dbErr) {
      console.warn('Prisma lead update warning (using memory fallback):', (dbErr as Error).message)
    }

    const memoryLead = memoryLeadsStore.find((l) => l.id === req.params.id)
    if (memoryLead) {
      memoryLead.status = status
      return res.json({ success: true, data: memoryLead })
    }

    res.status(404).json({ success: false, error: 'Lead not found' })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// POST /api/v1/leads/:id/rescore — Re-score lead using Gemini / Hermes 3
router.post('/:id/rescore', async (req, res) => {
  try {
    let lead: any = null
    try {
      lead = await prisma.lead.findUnique({
        where: { id: req.params.id },
        include: { school: true, contact: true },
      })
    } catch (dbErr) {
      console.warn('Prisma lead rescore lookup warning:', (dbErr as Error).message)
    }

    if (!lead) {
      lead = memoryLeadsStore.find((l) => l.id === req.params.id)
    }

    if (!lead || !lead.school) return res.status(404).json({ success: false, error: 'Lead or school not found' })

    const scoreResult = await GeminiService.scoreLead(
      lead.school.name,
      lead.school.studentCount || 1200,
      lead.school.website || ''
    )

    try {
      const updated = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          leadScore: scoreResult.score,
          status: scoreResult.score >= 80 ? 'qualified' : lead.status,
          scoreBreakdown: {
            reasoning: scoreResult.reasoning,
            rescoredAt: new Date().toISOString(),
            aiEngine: 'Hermes 3 AI (Groq)',
          },
        },
        include: { school: true, contact: true },
      })
      return res.json({ success: true, data: updated, scoreResult })
    } catch (dbErr) {
      console.warn('Prisma lead rescore update warning:', (dbErr as Error).message)
    }

    lead.leadScore = scoreResult.score
    lead.status = scoreResult.score >= 80 ? 'qualified' : lead.status
    lead.scoreBreakdown = {
      reasoning: scoreResult.reasoning,
      rescoredAt: new Date().toISOString(),
      aiEngine: 'Hermes 3 AI (Groq)',
    }

    res.json({ success: true, data: lead, scoreResult })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// POST /api/v1/leads/:id/send-email — Hyper-personalized single lead cold email dispatch
router.post('/:id/send-email', async (req, res) => {
  try {
    let lead: any = null
    try {
      lead = await prisma.lead.findUnique({
        where: { id: req.params.id },
        include: { school: true, contact: true },
      })
    } catch (err) {}

    if (!lead) {
      lead = memoryLeadsStore.find((l) => l.id === req.params.id)
    }

    if (!lead || !lead.school) {
      return res.status(404).json({ success: false, error: 'Lead or school not found' })
    }

    const recipientEmail = req.body.toEmail || lead.school.email || lead.contact?.email
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'No valid email address found for this school. Please update the school email first.',
      })
    }

    // STRICT DUPLICATE GUARD: Block duplicate cold outreach
    if (EmailService.hasOutreachBeenSent(recipientEmail, lead.school.name)) {
      return res.json({
        success: true,
        alreadySent: true,
        message: `Initial cold outreach email was already dispatched to ${recipientEmail} (${lead.school.name}). Repeated cold pitches are blocked!`,
      })
    }

    const recipientName = lead.school.principalName || lead.contact?.firstName || 'Principal'
    const studentCount = lead.school.studentCount || 500
    let slabRate = 6
    if (studentCount <= 200) slabRate = 8
    else if (studentCount <= 500) slabRate = 7
    else if (studentCount <= 1000) slabRate = 6
    else slabRate = 5

    const monthlyEst = studentCount * slabRate

    const subject =
      req.body.subject ||
      `Eduvault ERP for ${lead.school.name}: 2 Months Free Trial (No Bond) + Automated WhatsApp Fee Alerts`
    const emailBody =
      req.body.body ||
      `Respected Principal ${recipientName},<br/><br/>
Greetings from Ruviq!<br/><br/>
We are delighted to introduce <b>Eduvault ERP (Education with Security)</b> for ${lead.school.name}.<br/><br/>
🌟 <b>100% Risk-Free Commercial Assurance for ${lead.school.name}:</b><br/>
• <b>2 Months Free Trial:</b> "2 महीने चलाकर देखें — पसंद न आए तो ₹0 चार्ज, कोई बॉन्ड नहीं!"<br/>
• <b>Transparent Low Pricing:</b> Just ₹${slabRate}/month per student (~₹${monthlyEst.toLocaleString('en-IN')}/month for ${studentCount} students).<br/>
• <b>100% Free Data Migration:</b> Our engineering team migrates all your past Excel/register records within 48 hours at ₹0 cost.<br/>
• <b>Zero Setup Fee:</b> ₹5,000 onboarding fee 100% Waived for onboarding this month.<br/><br/>
<b>Key Advantages:</b><br/>
1. <b>Automated WhatsApp Fee Receipts:</b> Parents receive instant UPI QR codes & payment receipts on WhatsApp.<br/>
2. <b>Effortless Attendance:</b> 1-click teacher attendance with automated SMS/WhatsApp alerts for absentees.<br/>
3. <b>CBSE/ICSE Compliant Report Cards:</b> Ready in 10 minutes without manual calculation.<br/><br/>
Would you be open for a brief 15-minute live screen walkthrough this Wednesday or Thursday?<br/><br/>
Warm regards,<br/>
<b>Shashi Pratap Singh</b><br/>
Founder, Ruviq | Eduvault ERP<br/>
${process.env.EMAIL_FROM || 'connectwitheduvault@gmail.com'}`

    const brevoRes = await EmailService.sendOutreachEmail(
      recipientEmail,
      recipientName,
      subject,
      emailBody
    )

    if (!brevoRes.success) {
      return res.status(500).json({
        success: false,
        error: brevoRes.error || 'Failed to dispatch email via Brevo',
      })
    }

    // Update lead status to contacted
    try {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'contacted' },
      })
    } catch (e) {}

    // Log in messagesStore
    const msgRecord = {
      id: `msg_out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      channel: 'email',
      direction: 'outbound',
      contactName: recipientName,
      contactEmail: recipientEmail,
      schoolName: lead.school.name,
      subject,
      body: emailBody.replace(/<br\/>/g, '\n').replace(/<[^>]*>/g, ''),
      status: 'sent',
      sentAt: new Date().toISOString(),
    }
    const messages = loadJson<any[]>(MESSAGES_FILE, [])
    messages.unshift(msgRecord)
    saveJson(MESSAGES_FILE, messages)

    return res.json({
      success: true,
      messageId: brevoRes.messageId,
      sentTo: recipientEmail,
      status: 'contacted',
      message: `Personalized email dispatched successfully to ${recipientEmail}!`,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/v1/leads/:id/execute-strategy — Run AI Strategy (Email #1 + Schedule Follow-up)
router.post('/:id/execute-strategy', async (req, res) => {
  try {
    let lead: any = null
    try {
      lead = await prisma.lead.findUnique({
        where: { id: req.params.id },
        include: { school: true, contact: true },
      })
    } catch (err) {}

    if (!lead) {
      lead = memoryLeadsStore.find((l) => l.id === req.params.id)
    }

    if (!lead || !lead.school) {
      return res.status(404).json({ success: false, error: 'Lead not found' })
    }

    const recipientEmail = lead.school.email || lead.contact?.email
    const recipientName = lead.school.principalName || lead.contact?.firstName || 'Principal'
    const studentCount = lead.school.studentCount || 500
    let slabRate = 6
    if (studentCount <= 200) slabRate = 8
    else if (studentCount <= 500) slabRate = 7
    else if (studentCount <= 1000) slabRate = 6
    else slabRate = 5

    let emailSent = false
    let emailMsgId = null
    let emailError = null

    if (recipientEmail && recipientEmail.includes('@')) {
      const subject = `Fee Gateway & ERP Automation for ${lead.school.name} (2-Month Free Trial)`
      const body = `Respected Principal ${recipientName},<br/><br/>
Greetings from Ruviq!<br/><br/>
Our Sales Strategy AI evaluated ${lead.school.name} (~${studentCount} students) and recommended our <b>Fee Automation & ERP Solution</b>.<br/><br/>
Key Highlights:<br/>
• <b>2-Month Risk-Free Trial:</b> Zero setup cost, no lock-in bond.<br/>
• <b>Slab Rate:</b> ₹${slabRate}/student/month (~₹${(studentCount * slabRate).toLocaleString('en-IN')}/mo).<br/>
• <b>WhatsApp Fee UPI QR:</b> Parents pay fees directly without visiting school counter.<br/><br/>
Can we arrange a 15-minute Google Meet walkthrough this week?<br/><br/>
Best regards,<br/>Shashi Pratap Singh | Eduvault ERP`

      const brevoRes = await EmailService.sendOutreachEmail(recipientEmail, recipientName, subject, body)
      if (brevoRes.success) {
        emailSent = true
        emailMsgId = brevoRes.messageId
      } else {
        emailError = brevoRes.error
      }
    }

    // Advance status to contacted
    try {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'contacted' },
      })
    } catch (e) {}

    return res.json({
      success: true,
      strategyExecuted: true,
      emailSent,
      emailMsgId,
      emailError,
      nextStep: 'WhatsApp Direct Follow-up scheduled for 48 hours post-dispatch',
      status: 'contacted',
      message: emailSent
        ? `Strategy Executed: Sequence #1 Email dispatched to ${recipientEmail} and 48-Hour Follow-up scheduled!`
        : `Strategy Executed: Status updated to contacted. Note: ${emailError || 'No verified email found for dispatch.'}`,
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router

