import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { GeminiService } from '../../ai/gemini.service'
import { EmailService } from '../../services/email.service'
import {
  DealsService,
  STAGE_LABEL,
  STAGE_PROBABILITY,
  calculateSchoolPricing,
  Deal,
} from '../../services/deals.service'
import fs from 'fs'
import path from 'path'

const router = Router()
const prisma = new PrismaClient()

const DATA_DIR = path.resolve(__dirname, '../../../data')
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json')

function loadMessages(): any[] {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'))
    }
  } catch {}
  return []
}

// Stage mapping: Kanban stage <-> Lead status in DB
// 'qualified' (AI score >= 70) maps to 'ai_strong'
const STAGE_TO_STATUS: Record<string, string[]> = {
  discovery: ['new'],
  ai_strong: ['qualified'],
  outreach_sent: ['contacted', 'engaged'],
  demo_scheduled: ['meeting_scheduled'],
  proposal_sent: ['proposal_sent', 'negotiating'],
  closed_won: ['won'],
}

const STATUS_TO_STAGE: Record<string, string> = {
  new: 'discovery',
  qualified: 'ai_strong',
  contacted: 'outreach_sent',
  engaged: 'outreach_sent',
  meeting_scheduled: 'demo_scheduled',
  proposal_sent: 'proposal_sent',
  negotiating: 'proposal_sent',
  won: 'closed_won',
  lost: 'closed_won',
  disqualified: 'closed_won',
}

export { calculateSchoolPricing }

// Convert Lead DB record to Deal UI format
function leadToDeal(lead: any, allMessages?: any[]): Deal {
  const stage = STATUS_TO_STAGE[lead.status] || 'discovery'
  const probability = STAGE_PROBABILITY[stage] || 30
  const studentCount = lead.school?.studentCount || 1000
  const pricing = calculateSchoolPricing(studentCount)
  const contactName =
    lead.contact
      ? `${lead.contact.firstName || ''} ${lead.contact.lastName || ''}`.trim() || lead.contact.designation || 'Principal'
      : lead.school?.principalName || 'Principal'

  // Match messages for email & reply tracking
  const msgs = allMessages || loadMessages()
  const schoolNameLower = (lead.school?.name || '').toLowerCase().trim()
  const schoolEmailLower = (lead.school?.email || '').toLowerCase().trim()
  const contactEmailLower = (lead.contact?.email || '').toLowerCase().trim()

  const matchMessage = (m: any) => {
    const mSchool = (m.schoolName || '').toLowerCase().trim()
    const mEmail = (m.contactEmail || '').toLowerCase().trim()
    if (schoolEmailLower && mEmail && schoolEmailLower === mEmail) return true
    if (contactEmailLower && mEmail && contactEmailLower === mEmail) return true
    if (schoolNameLower && mSchool && (schoolNameLower.includes(mSchool) || mSchool.includes(schoolNameLower))) return true
    return false
  }

  const outboundMsgs = msgs.filter((m: any) => m.direction === 'outbound' && matchMessage(m))
  const inboundMsgs = msgs.filter((m: any) => m.direction === 'inbound' && matchMessage(m))

  const isContacted = outboundMsgs.length > 0 || ['contacted', 'engaged', 'meeting_scheduled', 'proposal_sent', 'won'].includes(lead.status)
  const lastOutbound = outboundMsgs[0] || null
  const lastInbound = inboundMsgs[0] || null

  const emailStatus = {
    sent: isContacted,
    sentCount: outboundMsgs.length > 0 ? outboundMsgs.length : (isContacted ? 1 : 0),
    lastSentAt: lastOutbound?.sentAt || (isContacted ? lead.updatedAt : null),
    lastSubject: lastOutbound?.subject || null,
    hasReplied: inboundMsgs.length > 0,
    replyCategory: lastInbound?.category || null,
    replyCategoryLabel: lastInbound?.categoryLabel || null,
    replySentiment: lastInbound?.sentiment || null,
    replySnippet: lastInbound?.body ? (lastInbound.body.length > 100 ? lastInbound.body.substring(0, 100) + '...' : lastInbound.body) : null,
    replyReceivedAt: lastInbound?.receivedAt || null,
  }

  return {
    id: lead.id,
    schoolName: lead.school?.name || 'Unknown School',
    contactName,
    stage,
    value: pricing.annualSaaS,
    pricing,
    currency: 'INR',
    probability,
    expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
    studentCount,
    modules: ['School ERP', 'Fee Management', 'Parent App'],
    leadScore: lead.leadScore || 50,
    city: lead.school?.city || '',
    phone: lead.school?.phone || lead.contact?.phone || '',
    email: lead.school?.email || lead.contact?.email || '',
    website: lead.school?.website || '',
    scoreBreakdown: lead.scoreBreakdown,
    emailStatus,
  }
}

// GET /api/v1/sales/pipeline — Kanban Pipeline (Dual: Prisma DB + Persistent Deals File Store)
router.get('/pipeline', async (req, res) => {
  let allDeals: Deal[] = []

  try {
    const leads = await prisma.lead.findMany({
      where: {
        status: { notIn: ['disqualified'] },
      },
      orderBy: [{ leadScore: 'desc' }, { createdAt: 'desc' }],
      include: {
        school: true,
        contact: true,
        assignee: true,
      },
    })

    if (leads && leads.length > 0) {
      const allMessages = loadMessages()
      allDeals = leads.map((l) => leadToDeal(l, allMessages))
    }
  } catch (e) {
    console.warn('Prisma pipeline query warning (falling back to persistent deals store):', (e as Error).message)
  }

  // Always blend with or fallback to persistent deals.json file store
  const fileDeals = DealsService.loadDeals()

  if (allDeals.length === 0) {
    allDeals = fileDeals
  } else {
    // Merge any file deals not already in allDeals
    const existingNames = new Set(allDeals.map((d) => (d.schoolName || '').toLowerCase().trim()))
    for (const fd of fileDeals) {
      const fdName = (fd.schoolName || '').toLowerCase().trim()
      if (fdName && !existingNames.has(fdName)) {
        allDeals.push(fd)
        existingNames.add(fdName)
      }
    }
  }

  const stageOrder = ['discovery', 'ai_strong', 'outreach_sent', 'demo_scheduled', 'proposal_sent', 'closed_won']
  const stages = stageOrder.map((stageId) => ({
    id: stageId,
    name: STAGE_LABEL[stageId] || stageId,
    deals: allDeals.filter((d) => d.stage === stageId),
  }))

  const aiIntentStages = DealsService.buildAiIntentPipeline(allDeals)
  const totalValue = allDeals.reduce((acc, d) => acc + (d.value || 0), 0)

  res.json({
    success: true,
    totalValue,
    dealCount: allDeals.length,
    data: stages,
    aiIntentStages,
  })
})

// GET /api/v1/sales/deals/:id — Get deal workspace (Prisma DB or DealsService file store)
router.get('/deals/:id', async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: { school: true, contact: true, assignee: true },
    })
    if (lead) return res.json({ success: true, data: leadToDeal(lead) })
  } catch (e) {
    console.warn('Prisma deal query warning:', (e as Error).message)
  }

  const deals = DealsService.loadDeals()
  const deal = deals.find((d) => d.id === req.params.id)
  if (deal) return res.json({ success: true, data: deal })

  res.status(404).json({ success: false, error: 'Deal not found' })
})

// POST /api/v1/sales/deals — Create new deal (Persisted to DealsService + DB if active)
router.post('/deals', async (req, res) => {
  const { schoolName, contactName, stage = 'discovery', value, studentCount, modules, city, phone, email } = req.body
  const count = studentCount ? parseInt(String(studentCount)) : 1000
  const pricing = calculateSchoolPricing(count)
  const dealValue = value ? parseInt(String(value)) : pricing.annualSaaS

  const savedDeal = DealsService.upsertDeal({
    schoolName: schoolName || 'New Target School',
    contactName: contactName || 'Principal',
    stage: stage || 'discovery',
    studentCount: count,
    value: dealValue,
    modules: modules || ['School ERP', 'WhatsApp Fees'],
    leadScore: 85,
    city: city || 'Jaipur',
    phone: phone || '',
    email: email || '',
  })

  // Also sync to Prisma DB in background if available
  try {
    let org = await prisma.organization.findFirst()
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'EduVault Enterprise', slug: 'eduvault-enterprise' },
      })
    }

    let school = await prisma.school.findFirst({ where: { name: schoolName, organizationId: org.id } })
    if (!school) {
      school = await prisma.school.create({
        data: {
          organizationId: org.id,
          name: schoolName,
          city: city || 'India',
          state: 'India',
          type: 'cbse',
          studentCount: count,
          phone: phone || null,
          email: email || null,
          source: 'manual_entry',
          confidence: 0.80,
        },
      })
    }

    const statusMap: Record<string, string> = {
      discovery: 'new',
      ai_strong: 'qualified',
      outreach_sent: 'contacted',
      qualification: 'contacted',
      demo_scheduled: 'meeting_scheduled',
      proposal_sent: 'proposal_sent',
      closed_won: 'won',
    }

    await prisma.lead.create({
      data: {
        organizationId: org.id,
        schoolId: school.id,
        status: (statusMap[stage] || 'new') as any,
        leadScore: 85,
        scoreBreakdown: {
          modules: modules || ['School ERP'],
          manualEntry: true,
          contactName,
        },
      },
    })
  } catch (e) {
    console.warn('Prisma create deal warning (persisted to deals.json):', (e as Error).message)
  }

  res.status(201).json({ success: true, data: savedDeal })
})

// DELETE /api/v1/sales/deals/:id — Remove deal
router.delete('/deals/:id', async (req, res) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } })
  } catch (e) {
    // ignore prisma error
  }
  DealsService.deleteDeal(req.params.id)
  res.json({ success: true, message: 'Deal deleted' })
})

// PATCH /api/v1/sales/deals/:id/stage — Move deal to new pipeline stage
router.patch('/deals/:id/stage', async (req, res) => {
  try {
    const { stage } = req.body
    if (!stage) return res.status(400).json({ success: false, error: 'Stage is required' })

    const statusMap: Record<string, string> = {
      discovery: 'new',
      ai_strong: 'qualified',
      outreach_sent: 'contacted',
      qualification: 'contacted',
      demo_scheduled: 'meeting_scheduled',
      proposal_sent: 'proposal_sent',
      closed_won: 'won',
    }

    const newStatus = statusMap[stage] || 'new'

    try {
      await prisma.lead.update({
        where: { id: req.params.id },
        data: { status: newStatus as any },
      })
    } catch (e) {
      console.warn('Prisma deal stage update warning:', (e as Error).message)
    }

    const updated = DealsService.updateDealStage(req.params.id, stage)
    if (updated) {
      return res.json({ success: true, data: updated })
    }

    res.status(404).json({ success: false, error: 'Deal not found' })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// POST /api/v1/sales/deals/:id/send-cold-email — 1-Click Cold Email Dispatch with Duplicate Lock
router.post('/deals/:id/send-cold-email', async (req, res) => {
  try {
    const { toEmail } = req.body

    let lead: any = null
    try {
      lead = await prisma.lead.findUnique({
        where: { id: req.params.id },
        include: { school: true, contact: true },
      })
    } catch (e) {}

    if (!lead) {
      const deals = DealsService.loadDeals()
      lead = deals.find((d) => d.id === req.params.id)
    }

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Deal not found' })
    }

    const recipientEmail = (toEmail || lead.school?.email || lead.contact?.email || lead.email || '').trim()
    const schoolName = lead.school?.name || lead.schoolName || 'Target School'

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        needsEmail: true,
        error: `No email address found for ${schoolName}. Please enter a valid email address.`,
      })
    }

    // STRICT DUPLICATE GUARD: If already sent, block repeated dispatch even if clicked 100 times!
    const alreadySent = EmailService.hasOutreachBeenSent(recipientEmail, schoolName)
    if (alreadySent) {
      if (lead.id && lead.status !== 'contacted') {
        try {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { status: 'contacted' },
          })
        } catch {}
      }
      return res.json({
        success: true,
        alreadySent: true,
        message: `Initial cold outreach email was already dispatched to ${recipientEmail} (${schoolName}). Duplicate cold emails are blocked!`,
        data: leadToDeal(lead),
      })
    }

    // Dynamic tiered pricing calculation
    const studentCount = lead.school?.studentCount || lead.studentCount || 500
    let slabRate = 6
    if (studentCount <= 200) slabRate = 8
    else if (studentCount <= 500) slabRate = 7
    else if (studentCount <= 1000) slabRate = 6
    const recipientName = lead.school?.principalName || lead.contact?.firstName || lead.contactName || 'Principal'

    const subject = `AI Lesson Planner & WhatsApp Automation for ${schoolName}`
    const emailBody = `Respected Principal ${recipientName},<br/><br/>
I hope this email finds you well.<br/><br/>
I am reaching out from Eduvault AI (Ruviq). We have developed practical school automation specifically tailored for leading K-12 institutions, designed to save leadership and faculty valuable hours every week:<br/><br/>
• <b>AI Academic & Lesson Planner:</b> Automatically generates weekly syllabus pacing, creative lesson notes, and custom practice worksheets for teachers in minutes.<br/>
• <b>Automated WhatsApp Parent Communication:</b> Real-time daily attendance updates, automated fee alerts with instant UPI QR links, and official circulars sent straight to parents' WhatsApp (98% read rate).<br/>
• <b>Smart Security & Clutter-Free ERP:</b> Single secure dashboard for student records, CBSE/ICSE report cards, and exams without any complex staff training required.<br/><br/>
Would you be open for a brief 10–15 minute screen-sharing walkthrough this Wednesday or Thursday to see how this works in real-time for ${schoolName}?<br/><br/>
Warm regards,<br/>
<b>Shashi Pratap Singh</b><br/>
Founder, Eduvault AI<br/>
connectwitheduvault@gmail.com`

    const brevoRes = await EmailService.sendOutreachEmail(
      recipientEmail,
      recipientName,
      subject,
      emailBody
    )

    if (!brevoRes.success) {
      return res.status(500).json({
        success: false,
        error: brevoRes.error || 'Failed to dispatch email via Brevo.',
      })
    }

    // If new email was supplied, persist to school record
    if (lead.school?.id && (!lead.school.email || toEmail)) {
      try {
        await prisma.school.update({
          where: { id: lead.school.id },
          data: { email: recipientEmail },
        })
      } catch {}
    }

    // Advance Lead status to 'contacted'
    let updatedLead: any = lead
    try {
      updatedLead = await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'contacted' },
        include: { school: true, contact: true },
      })
    } catch {}

    // Log message to messages.json
    const msgRecord = {
      id: `msg_out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      channel: 'email',
      direction: 'outbound',
      contactName: recipientName,
      contactEmail: recipientEmail,
      schoolName,
      subject,
      body: emailBody.replace(/<br\/>/g, '\n').replace(/<[^>]*>/g, ''),
      status: 'sent',
      sentAt: new Date().toISOString(),
    }
    const messages = loadMessages()
    messages.unshift(msgRecord)
    try {
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8')
    } catch {}

    const dealData = leadToDeal(updatedLead || lead, messages)
    dealData.stage = 'outreach_sent'
    if (dealData.emailStatus) {
      dealData.emailStatus.sent = true
      dealData.emailStatus.sentCount = (dealData.emailStatus.sentCount || 0) + 1
      dealData.emailStatus.lastSentAt = msgRecord.sentAt
      dealData.emailStatus.lastSubject = subject
    }
    DealsService.upsertDeal(dealData)

    return res.json({
      success: true,
      message: `Initial cold outreach email successfully dispatched to ${recipientEmail}!`,
      data: dealData,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message })
  }
})

// POST /api/v1/sales/deals/:id/strategist — AI Sales Strategist powered by Hermes / Groq
router.post('/deals/:id/strategist', async (req, res) => {
  try {
    let deal: any = null
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: req.params.id },
        include: { school: true, contact: true },
      })
      if (lead) deal = leadToDeal(lead)
    } catch (e) {
      console.warn('Prisma strategist deal lookup warning:', (e as Error).message)
    }

    if (!deal) {
      const deals = DealsService.loadDeals()
      deal = deals.find((d) => d.id === req.params.id)
    }

    if (!deal) return res.status(404).json({ success: false, error: 'Deal not found' })

    const prompt = `You are the AI Sales Strategist for EduVault AI.
Analyze deal for "${deal.schoolName}" (Score: ${deal.leadScore}/100, Current Stage: ${deal.stage}, Students: ${deal.studentCount}, City: ${deal.city}).
Commercial model:
- 100-200 students: ₹8 / student / mo
- 200-500 students: ₹7 / student / mo
- 500-1000 students: ₹6 / student / mo
- 1000+ students: ₹5 / student / mo
- Launch Hooks: 2 Months 100% Free Trial, Free Data Migration, Free Staff Training, Implementation Fee up to ₹5,000.

Provide closing strategy in strict JSON format (no markdown):
{
  "winProbability": number (0-100),
  "closingBlocker": "Key risk or objection",
  "recommendedTactic": "Actionable sales recommendation in 1-2 sentences using the 2-month free trial hook",
  "discountStrategy": "Suggested waiver or incentive (e.g. ₹5,000 setup waiver) to close deal this month"
}`

    const responseText = await GeminiService.generateIntelligence(prompt)
    let parsed: any
    try {
      const cleaned = responseText.replace(/```json|```/g, '').replace(/[\r\n]+/g, ' ').trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned)
    } catch {
      parsed = {
        winProbability: deal.probability,
        closingBlocker: 'School Management Board approval required for annual budget allocation.',
        recommendedTactic: `Offer a 2-Month Free Trial with zero upfront commitment to ${deal.schoolName} so the Principal can verify fee collection uplift firsthand.`,
        discountStrategy: 'Waiver of the ₹5,000 implementation fee + free staff training if agreement signed by end of month.',
      }
    }

    res.json({ success: true, data: parsed })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// GET /api/v1/sales/tasks — Task management (simple in-memory is fine for tasks)
const tasksStore: any[] = []

router.get('/tasks', (req, res) => {
  res.json({ success: true, data: tasksStore })
})

router.post('/tasks', (req, res) => {
  const { title, dealId, dueDate, priority, type } = req.body
  const newTask = {
    id: `task_${Date.now()}`,
    dealId: dealId || null,
    title,
    dueDate: dueDate || 'Today',
    priority: priority || 'normal',
    type: type || 'call',
    completed: false,
  }
  tasksStore.unshift(newTask)
  res.status(201).json({ success: true, data: newTask })
})

router.patch('/tasks/:id/complete', (req, res) => {
  const task = tasksStore.find((t) => t.id === req.params.id)
  if (task) task.completed = !task.completed
  res.json({ success: true, data: task })
})

export default router
