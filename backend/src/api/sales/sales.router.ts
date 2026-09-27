import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { GeminiService } from '../../ai/gemini.service'
import { EmailService } from '../../services/email.service'
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
// Notice: 'qualified' (AI score >= 70) maps to 'ai_strong', NOT 'demo_scheduled'!
// 'demo_scheduled' is strictly reserved for 'meeting_scheduled' (demo requested/booked)!
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

const STAGE_PROBABILITY: Record<string, number> = {
  discovery: 30,
  ai_strong: 60,
  outreach_sent: 50,
  demo_scheduled: 80,
  proposal_sent: 90,
  closed_won: 100,
}

const STAGE_LABEL: Record<string, string> = {
  discovery: 'Discovery (30%)',
  ai_strong: 'AI High Intent (60%)',
  outreach_sent: 'Outreach Sent (50%)',
  demo_scheduled: 'Demo Scheduled (80%)',
  proposal_sent: 'Proposal Sent (90%)',
  closed_won: 'Closed Won 🎉 (100%)',
}

/**
 * EduVault AI Commercial Tiered Pricing Model:
 * 100 - 200 students: ₹8 / student / month
 * 200 - 500 students: ₹7 / student / month
 * 500 - 1000 students: ₹6 / student / month
 * 1000+ students: ₹5 / student / month
 * Launch Offer: 2 Months Free Trial, Free Data Migration, Free Staff Training, Implementation up to ₹5,000
 */
export function calculateSchoolPricing(studentCount: number = 1000) {
  let ratePerStudentMonth = 5
  let tierLabel = '1000+ Students (Enterprise Tier)'

  if (studentCount <= 200) {
    ratePerStudentMonth = 8
    tierLabel = '100–200 Students (Starter Tier)'
  } else if (studentCount <= 500) {
    ratePerStudentMonth = 7
    tierLabel = '200–500 Students (Growth Tier)'
  } else if (studentCount <= 1000) {
    ratePerStudentMonth = 6
    tierLabel = '500–1000 Students (Standard Tier)'
  } else {
    ratePerStudentMonth = 5
    tierLabel = '1000+ Students (Enterprise Tier)'
  }

  const monthlySaaS = studentCount * ratePerStudentMonth
  const annualSaaS = monthlySaaS * 12
  const implementationFee = 5000
  const totalFirstYearContract = annualSaaS + implementationFee

  return {
    ratePerStudentMonth,
    tierLabel,
    studentCount,
    monthlySaaS,
    annualSaaS,
    implementationFee,
    totalFirstYearContract,
    freeTrialMonths: 2,
    freeDataMigration: true,
    freeStaffTraining: true,
  }
}

// Convert Lead DB record to Deal UI format
function leadToDeal(lead: any, allMessages?: any[]) {
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

// Resilient in-memory deals store (Fresh CRM: starts empty, only user's real deals)
let memoryDealsStore: any[] = []

// Helper to format fallback stages
function getFallbackStages() {
  const stageOrder = ['discovery', 'ai_strong', 'outreach_sent', 'demo_scheduled', 'proposal_sent', 'closed_won']
  return stageOrder.map((stageId) => ({
    id: stageId,
    name: STAGE_LABEL[stageId],
    deals: memoryDealsStore.filter((d) => d.stage === stageId),
  }))
}

// Helper to generate AI High-Intent Pipeline from deals
function buildAiIntentPipeline(deals: any[]) {
  const highIntentDeals = deals.filter((d) => (d.leadScore || 0) >= 70 || d.stage === 'ai_strong')

  return [
    {
      id: 'ai_ready',
      name: 'Ready for Outreach (AI 70%+)',
      description: 'High purchase propensity, pending cold outreach pitch',
      deals: highIntentDeals.filter((d) => !d.emailStatus?.sent && d.stage !== 'closed_won'),
    },
    {
      id: 'ai_dispatched',
      name: 'Outreach Sent (Awaiting Reply)',
      description: 'AI-personalized pitch sent, follow-up automation active',
      deals: highIntentDeals.filter((d) => d.emailStatus?.sent && !d.emailStatus?.hasReplied && d.stage !== 'closed_won'),
    },
    {
      id: 'ai_replied',
      name: 'Inbound Replied / Demo Booked 🎯',
      description: 'School principal engaged or requested demo session',
      deals: highIntentDeals.filter((d) => (d.emailStatus?.hasReplied || d.stage === 'demo_scheduled') && d.stage !== 'closed_won'),
    },
    {
      id: 'ai_won',
      name: 'Converted / Won 🎉',
      description: 'Successfully onboarded high-intent school deals',
      deals: highIntentDeals.filter((d) => d.stage === 'closed_won'),
    },
  ]
}

// GET /api/v1/sales/pipeline — Kanban Pipeline from DB (with resilient fallback)
router.get('/pipeline', async (req, res) => {
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

    if (leads) {
      const allMessages = loadMessages()
      const allDeals = leads.map((l) => leadToDeal(l, allMessages))

      const stageOrder = ['discovery', 'ai_strong', 'outreach_sent', 'demo_scheduled', 'proposal_sent', 'closed_won']
      const stages = stageOrder.map((stageId) => {
        const stageStatuses = STAGE_TO_STATUS[stageId] || []
        const stageDeals = leads
          .filter((l) => stageStatuses.includes(l.status))
          .map((l) => leadToDeal(l, allMessages))

        return {
          id: stageId,
          name: STAGE_LABEL[stageId],
          deals: stageDeals,
        }
      })

      const aiIntentStages = buildAiIntentPipeline(allDeals)
      const totalValue = leads.reduce((acc, lead) => acc + (lead.leadScore || 50) * 5000, 0)

      return res.json({
        success: true,
        totalValue,
        dealCount: leads.length,
        data: stages,
        aiIntentStages,
      })
    }
  } catch (e) {
    console.warn('Prisma pipeline query warning (using live memory pipeline):', (e as Error).message)
  }

  // Fallback to active memory pipeline
  const stages = getFallbackStages()
  const aiIntentStages = buildAiIntentPipeline(memoryDealsStore)
  const totalValue = memoryDealsStore.reduce((acc, d) => acc + (d.value || 0), 0)

  res.json({
    success: true,
    totalValue,
    dealCount: memoryDealsStore.length,
    data: stages,
    aiIntentStages,
  })
})

// GET /api/v1/sales/deals/:id — Get deal workspace from DB
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

  const memoryDeal = memoryDealsStore.find((d) => d.id === req.params.id)
  if (memoryDeal) return res.json({ success: true, data: memoryDeal })

  res.status(404).json({ success: false, error: 'Deal not found' })
})

// POST /api/v1/sales/deals — Create new deal (creates Lead + School if needed)
router.post('/deals', async (req, res) => {
  const { schoolName, contactName, stage = 'discovery', value, studentCount, modules, city, phone, email } = req.body
  const count = studentCount ? parseInt(studentCount) : 1000
  const pricing = calculateSchoolPricing(count)
  const dealValue = value ? parseInt(value) : pricing.annualSaaS

  const memoryDeal = {
    id: `deal_${Date.now()}`,
    schoolName: schoolName || 'New Target School',
    contactName: contactName || 'Principal',
    stage: stage || 'discovery',
    studentCount: count,
    value: dealValue,
    pricing,
    currency: 'INR',
    probability: STAGE_PROBABILITY[stage] || 30,
    expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
    modules: modules || ['School ERP', 'WhatsApp Fees'],
    leadScore: 85,
    city: city || '',
    phone: phone || '',
    email: email || '',
  }

  try {
    let org = await prisma.organization.findFirst()
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'EduVault Enterprise', slug: 'eduvault-enterprise' },
      })
    }

    // Upsert school record
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

    const lead = await prisma.lead.create({
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
      include: { school: true, contact: true },
    })

    const createdDeal = leadToDeal(lead)
    memoryDealsStore.unshift(createdDeal)
    return res.status(201).json({ success: true, data: createdDeal })
  } catch (e) {
    console.warn('Prisma create deal warning (persisted to live memory store):', (e as Error).message)
  }

  memoryDealsStore.unshift(memoryDeal)
  res.status(201).json({ success: true, data: memoryDeal })
})

// DELETE /api/v1/sales/deals/:id — Remove deal
router.delete('/deals/:id', async (req, res) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } })
  } catch (e) {
    // ignore prisma error
  }
  const idx = memoryDealsStore.findIndex((d) => d.id === req.params.id)
  if (idx !== -1) memoryDealsStore.splice(idx, 1)
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
      const lead = await prisma.lead.update({
        where: { id: req.params.id },
        data: { status: newStatus as any },
        include: { school: true, contact: true },
      })
      return res.json({ success: true, data: leadToDeal(lead) })
    } catch (e) {
      console.warn('Prisma deal stage update warning:', (e as Error).message)
    }

    const memoryDeal = memoryDealsStore.find((d) => d.id === req.params.id)
    if (memoryDeal) {
      memoryDeal.stage = stage
      memoryDeal.probability = STAGE_PROBABILITY[stage] || 30
      return res.json({ success: true, data: memoryDeal })
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
      lead = memoryDealsStore.find((d) => d.id === req.params.id)
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
    else slabRate = 5

    const monthlyEst = studentCount * slabRate
    const recipientName = lead.school?.principalName || lead.contact?.firstName || lead.contactName || 'Principal'

    const subject = `Eduvault ERP for ${schoolName}: 2 Months Free Trial (No Bond) + Automated WhatsApp Fee Alerts`
    const emailBody = `Respected Principal ${recipientName},<br/><br/>
Greetings from Ruviq!<br/><br/>
We are delighted to introduce <b>Eduvault ERP (Education with Security)</b> for ${schoolName}.<br/><br/>
🌟 <b>100% Risk-Free Commercial Assurance for ${schoolName}:</b><br/>
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
    const memIdx = memoryDealsStore.findIndex((d) => d.id === req.params.id)
    if (memIdx !== -1) {
      memoryDealsStore[memIdx] = dealData
    }

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
      deal = memoryDealsStore.find((d) => d.id === req.params.id)
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
