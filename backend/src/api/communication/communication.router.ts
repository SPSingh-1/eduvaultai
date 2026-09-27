import { Router } from 'express'
import { EmailService } from '../../services/email.service'
import { GeminiService } from '../../ai/gemini.service'

import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// ============================================================
// SENDER & COMPANY CONFIGURATION (Ruviq | Eduvault ERP)
// ============================================================
const SENDER_CONFIG = {
  companyName: 'Ruviq',
  productName: 'Eduvault ERP',
  tagline: 'Education with Security',
  senderName: 'Shashi Pratap Singh',
  senderTitle: 'Founder, Ruviq',
  senderEmail: process.env.EMAIL_FROM || 'connectwitheduvault@gmail.com',
  linkedinUrl: 'https://linkedin.com/in/shashipratapsingh',
  websiteUrl: 'https://eduvault-web.onrender.com',
}

// Persistent storage helpers for Messages and Alerts
const DATA_DIR = path.resolve(__dirname, '../../../data')
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json')
const ALERTS_FILE = path.join(DATA_DIR, 'alerts.json')

function loadJson<T>(file: string, fallback: T): T {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'))
    }
  } catch (err) {
    console.warn(`Failed to read ${file}:`, (err as Error).message)
  }
  return fallback
}

function saveJson<T>(file: string, data: T): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.warn(`Failed to write ${file}:`, (err as Error).message)
  }
}

let messagesStore: any[] = loadJson(MESSAGES_FILE, [])
let alertsStore: any[] = loadJson(ALERTS_FILE, [])
let templatesStore: any[] = []

// POST /api/v1/communication/clear-all — Purge all messages and alerts (Data-less reset)
router.post('/clear-all', (req, res) => {
  messagesStore = []
  alertsStore = []
  saveJson(MESSAGES_FILE, [])
  saveJson(ALERTS_FILE, [])
  res.json({ success: true, message: 'All messages and alerts purged' })
})

// GET /api/v1/communication/inbox — Get unified messages feed
router.get('/inbox', (req, res) => {

  const { channel } = req.query as { channel?: string }
  let filtered = messagesStore
  if (channel && channel !== 'all') {
    filtered = messagesStore.filter((m) => m.channel === channel)
  }
  res.json({ success: true, count: filtered.length, data: filtered })
})

// POST /api/v1/communication/send — Send email via Brevo & save message
router.post('/send', async (req, res) => {
  try {
    const { toEmail, toName, schoolName, subject, body } = req.body

    const brevoResult = await EmailService.sendOutreachEmail(
      toEmail,
      toName || 'Principal',
      subject,
      body.replace(/\n/g, '<br/>')
    )

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      channel: 'email',
      direction: 'outbound',
      contactName: toName || 'Principal',
      contactEmail: toEmail,
      schoolName: schoolName || 'Target School',
      subject,
      body,
      status: brevoResult.success ? 'sent' : 'failed',
      sentAt: new Date().toISOString(),
    }

    messagesStore.unshift(newMessage)
    saveJson(MESSAGES_FILE, messagesStore)

    res.status(201).json({ success: true, message: newMessage, brevoResult })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})


// POST /api/v1/communication/ai-personalize — AI Email Personalization using the 3 Formats
router.post('/ai-personalize', async (req, res) => {
  try {
    const {
      schoolName = 'Your School',
      principalName = 'Principal',
      studentCount = 1000,
      city = '',
      isDigitalized = undefined, // boolean or undefined
      formatType = 'auto', // 'manual', 'upgrade', 'general', or 'auto'
    } = req.body

    const cfg = SENDER_CONFIG

    const prompt = `You are an expert B2B Sales Email Writer for ${cfg.productName} (${cfg.tagline}) by ${cfg.companyName}.
Sender: ${cfg.senderName} (${cfg.senderEmail}, ${cfg.websiteUrl}).

Target Recipient:
- Principal/Decision Maker: ${principalName}
- School Name: ${schoolName}${city ? ` in ${city}` : ''}
- Student Count: ${studentCount}

Requested Format Strategy: "${formatType}"

Choose the appropriate strategy:
1. FORMAT 1 (Manual to Digital): If school is not yet digital, focus on simplicity, moving from registers to digital, zero technical training, clean UI, instant WhatsApp reminders & automated receipts.
2. FORMAT 2 (Upgrading/Switching): If school already uses software, focus on upgrading from clunky/disjointed tools, lightning-fast UI, live WhatsApp automation, advanced fee reconciliation, side-by-side comparison.
3. FORMAT 3 (General Approach): Balanced approach on enhancing parent engagement, admin efficiency, clean UI, real-time WhatsApp alerts, role-based dashboards (Admin, Teacher, Student).

Sign-off MUST strictly match:
Best regards,

${cfg.senderName}
${cfg.senderName} | ${cfg.linkedinUrl}
📧 ${cfg.senderEmail} | 🌐 ${cfg.websiteUrl}

Return ONLY valid JSON (no markdown):
{
  "subject": "exact compelling subject line matching the chosen format",
  "body": "full email body with \\n for line breaks"
}`

    const responseText = await GeminiService.generateIntelligence(prompt)
    let parsed: any

    try {
      const cleaned = responseText.replace(/```json|```/g, '').trim()
      const match = cleaned.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(match ? match[0] : cleaned)
    } catch {
      // Fallback Format 3 General
      parsed = {
        subject: `Enhancing Parent Engagement & Administration at ${schoolName}`,
        body: `Dear Principal ${principalName},

Managing a growing school like ${schoolName} requires a balance between academic focus and administrative efficiency. I am writing from ${cfg.companyName} to see how your team is currently handling fee collection, attendance, and parent communication.

We provide ${cfg.productName} (${cfg.tagline}), an all-in-one school management system featuring an ultra-simple UI designed to minimize manual overhead. Whether you are already using a digital system or managing things manually, our platform integrates easily to provide:

Clean & Easy-to-Use UI: No technical skills required; your entire staff can learn it in minutes.

Real-time WhatsApp Alerts: Automated, instant updates for parents when fees are deposited or attendance is marked.

Flexible Fee Management: Track collections, dues, and record transactions across multiple payment modes effortlessly.

Role-Based Dashboards: Dedicated access for Admin, Teachers, and Students to keep information transparent.

Effortless Reporting: Generate fee, exam, and attendance reports in seconds, not hours.

I would love to learn more about your current processes and share how ${cfg.productName} could potentially save your staff hours of work every day. Would you have 15 minutes for a quick conversation later this week?

Best regards,

${cfg.senderName}

${cfg.senderTitle} | ${cfg.linkedinUrl}

📧 ${cfg.senderEmail} | 🌐 ${cfg.websiteUrl}`,
      }
    }

    res.json({ success: true, data: parsed })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// GET /api/v1/communication/product-info — Return sender & product details
router.get('/product-info', (req, res) => {
  res.json({ success: true, data: SENDER_CONFIG })
})

// POST /api/v1/communication/reply-assistant — AI Reply Assistant
router.post('/reply-assistant', async (req, res) => {
  try {
    const { inboundMessage } = req.body
    const cfg = SENDER_CONFIG

    const prompt = `You are the AI Reply Assistant for ${cfg.senderName} at ${cfg.companyName} selling ${cfg.productName}.
The school decision maker sent:
"${inboundMessage}"

Generate 2 distinct professional reply suggestions in strict JSON (no markdown):
{
  "suggestion1": "Direct answer & demo booking confirmation for 15-min call",
  "suggestion2": "Answers questions + offers side-by-side software comparison / brochure"
}`

    const responseText = await GeminiService.generateIntelligence(prompt)
    let parsed: any
    try {
      const cleaned = responseText.replace(/```json|```/g, '').trim()
      const match = cleaned.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(match ? match[0] : cleaned)
    } catch {
      parsed = {
        suggestion1: `Thank you for your response! ${cfg.productName} features a clean UI with live WhatsApp automation for fees and attendance. Would you have 15 minutes for a quick demo this Tuesday or Wednesday?`,
        suggestion2: `Hi, I'd be happy to share a quick comparison of ${cfg.productName} with standard tools along with our feature overview. What day this week works best for a brief 15-minute call?`,
      }
    }

    res.json({ success: true, data: parsed })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// GET & POST /api/v1/communication/templates
router.get('/templates', (req, res) => {
  const cfg = SENDER_CONFIG

  // Always supply the 3 Exact High-Converting Formats
  const exactTemplates = [
    {
      id: 'tpl_format1_manual',
      name: '📑 Format 1: Manual to Digital Transition (For Non-Digital / Register-Based Schools)',
      channel: 'email',
      subject: 'Digitalizing {{schoolName}}: 2 Months Free Trial (No Bond) with Eduvault ERP',
      body: `Respected Principal {{principalName}},

Greetings from ${cfg.companyName}!

Managing a school manually—from paper registers to fee ledgers and report cards—takes up hours of your staff's valuable teaching time. At ${cfg.companyName}, we have built ${cfg.productName} (${cfg.tagline}) specifically to eliminate administrative chaos with zero learning curve.

🌟 100% Risk-Free Assurance for {{schoolName}}:
• 2 Months Free Trial: "2 महीने चलाकर देखें — पसंद न आए तो ₹0 चार्ज, कोई बॉन्ड नहीं!"
• Affordable Pricing: Just ₹5 to ₹8 per student/month (No hidden charges).
• 100% Free Data Migration: Our engineering team transfers all your past student records and fee data within 48 hours at ₹0 cost.
• One-time Setup Fee (₹5,000): 100% Waived for your institution.

Why Schools Love Eduvault ERP:
1. Instant WhatsApp Updates: Automatic fee payment receipts and attendance alerts sent straight to parents' WhatsApp.
2. Clean & Simple UI: Teachers and staff can operate it on Day 1 without technical training.
3. Multi-Mode Fee Management: Effortlessly record UPI, Cash, Cheque, and Bank transfers with instant auto-reconciliation.
4. CBSE/ICSE Report Cards: Auto-calculated grading and 1-click marksheet generation.

Would you be available for a brief 15-minute live screen walkthrough this Tuesday or Wednesday at your convenience?

Best regards,

${cfg.senderName}
${cfg.senderTitle} | ${cfg.linkedinUrl}
📧 ${cfg.senderEmail} | 🌐 ${cfg.websiteUrl}`,
      variables: ['schoolName', 'principalName'],
    },
    {
      id: 'tpl_format2_upgrade',
      name: '⚡ Format 2: Software Upgrade / Switch (For Schools Frustrated with Existing ERP)',
      channel: 'email',
      subject: "Upgrading {{schoolName}}'s Tech Stack: Switch to Eduvault ERP (2 Months Free Trial)",
      body: `Respected Principal {{principalName}},

I understand that {{schoolName}} is already using digital software for administration. However, many principals and school trustees share that existing tools are slow, clunky, and lack direct parent communication.

I am reaching out from ${cfg.companyName} to introduce ${cfg.productName} (${cfg.tagline}) — engineered for speed, clean UX, and automated WhatsApp integration.

🌟 Zero-Disruption Switch Guarantee:
• 2 Months Free Trial: "2 महीने चलाकर देखें — पसंद न आए तो ₹0 चार्ज, कोई बॉन्ड नहीं!"
• Complete Free Migration: Our team extracts and imports 100% of your current software data within 48 hours without disrupting daily classes.
• Transparent Tiered Pricing:
  - 100 - 200 Students: ₹8 / student / month
  - 200 - 500 Students: ₹7 / student / month
  - 500 - 1000 Students: ₹6 / student / month
  - 1000+ Students: ₹5 / student / month
• Implementation Fee (₹5,000): 100% Waived.

What Sets Eduvault Apart:
• Automated WhatsApp Fee Receipts: Cut fee defaulters by 40% with instant automated reminders.
• Lightning-Fast Dashboards: Dedicated role-based access for Admin, Teachers, and Parents.
• Real-time Fee Reconciliation: Know exact collections and dues in 1 click.

Could we schedule a quick 15-minute comparison walkthrough this week to show you how Eduvault outperforms standard software?

Best regards,

${cfg.senderName}
${cfg.senderTitle} | ${cfg.linkedinUrl}
📧 ${cfg.senderEmail} | 🌐 ${cfg.websiteUrl}`,
      variables: ['schoolName', 'principalName'],
    },
    {
      id: 'tpl_format3_general',
      name: '🎯 Format 3: Universal Executive Approach (Modern ERP Proposal)',
      channel: 'email',
      subject: 'Enhancing Administration & Parent Trust at {{schoolName}} with Eduvault ERP',
      body: `Respected Principal {{principalName}},

Managing daily operations, fee recovery, and parent trust at a growing school like {{schoolName}} requires a modern, reliable system.

At ${cfg.companyName}, we developed ${cfg.productName} (${cfg.tagline}) to bring enterprise-grade school management at an affordable cost for Indian K-12 institutions.

🌟 Our Unconditional Guarantee for {{schoolName}}:
• 2 Months Free Trial: "2 महीने चलाकर देखें — पसंद न आए तो ₹0 चार्ज, कोई बॉन्ड नहीं!"
• Transparent Student Pricing: ₹5 to ₹8 per student per month based on student count.
• Zero Migration Effort: Our dedicated engineers migrate all student and fee history within 48 hours for free.
• ₹5,000 Setup Fee: 100% Waived.

Core Capabilities:
1. Automated Parent WhatsApp Alerts for fee receipts, homework, and attendance.
2. Complete Digital Fee Collection across UPI, Netbanking, Cards & Cash.
3. Exam, Attendance & CBSE/ICSE Compliant Report Card Generation in seconds.
4. Dedicated Mobile & Web Portals for Teachers, Admin, and Parents.

Would you be open to a 15-minute screen walkthrough this week? We would be delighted to demonstrate how simple and effective this will be for your institution.

Best regards,

${cfg.senderName}
${cfg.senderTitle} | ${cfg.linkedinUrl}
📧 ${cfg.senderEmail} | 🌐 ${cfg.websiteUrl}`,
      variables: ['schoolName', 'principalName'],
    },
  ]


  res.json({ success: true, data: exactTemplates })
})

router.post('/templates', (req, res) => {
  const { name, channel, subject, body, variables } = req.body
  const newTpl = {
    id: `tpl_${Date.now()}`,
    name,
    channel: channel || 'email',
    subject,
    body,
    variables: variables || [],
  }
  templatesStore.push(newTpl)
  res.status(201).json({ success: true, data: newTpl })
})

// ============================================================
// 1. AUTONOMOUS COLD EMAIL OUTREACH DISPATCHER
// ============================================================
router.post('/auto-outreach', async (req, res) => {
  try {
    const { schoolIds, schools: customSchools, limit = 10 } = req.body
    const cfg = SENDER_CONFIG

    let targetSchools: any[] = []

    if (customSchools && Array.isArray(customSchools) && customSchools.length > 0) {
      targetSchools = customSchools.filter((s) => s.email && s.email.includes('@'))
    } else if (schoolIds && Array.isArray(schoolIds) && schoolIds.length > 0) {
      try {
        targetSchools = await prisma.school.findMany({
          where: { id: { in: schoolIds }, email: { not: null } },
        })
      } catch (err) {
        console.warn('Prisma school query fallback:', (err as Error).message)
      }
    } else {
      // Find all schools in DB that have an email address
      try {
        targetSchools = await prisma.school.findMany({
          where: { email: { not: null } },
          take: limit,
          orderBy: { createdAt: 'desc' },
        })
      } catch (err) {
        console.warn('Prisma school query fallback:', (err as Error).message)
      }
    }

    if (targetSchools.length === 0) {
      return res.json({
        success: true,
        sentCount: 0,
        skippedCount: 0,
        message: 'No schools with verified email IDs found for automated dispatch.',
        results: [],
      })
    }

    // Cold Email Deduplication Guard: Do not send first cold email repeatedly to the same school!
    const eligibleSchools: any[] = []
    let skippedCount = 0

    for (const school of targetSchools) {
      const email = school.email
      const schoolName = school.name

      const alreadySent = EmailService.hasOutreachBeenSent(email, schoolName)
      if (alreadySent) {
        skippedCount++
        continue
      }
      eligibleSchools.push(school)
    }

    if (eligibleSchools.length === 0) {
      return res.json({
        success: true,
        sentCount: 0,
        skippedCount,
        message: skippedCount > 0
          ? `All ${skippedCount} school(s) have already received their initial cold outreach. Skipped repeated cold emails!`
          : 'No schools with verified email IDs found for automated dispatch.',
        results: [],
      })
    }

    const results: any[] = []

    for (const school of eligibleSchools) {
      const recipientEmail = school.email
      const recipientName = school.principalName || 'Principal'
      const studentCount = school.studentCount || 500

      // Calculate the transparent pricing per student
      let slabRate = 6
      if (studentCount <= 200) slabRate = 8
      else if (studentCount <= 500) slabRate = 7
      else if (studentCount <= 1000) slabRate = 6
      else slabRate = 5

      const subject = `Eduvault ERP for ${school.name}: 2 Months Free Trial (No Bond) + Live WhatsApp Automation`
      const emailBody = `Respected Principal ${recipientName},

Greetings from ${cfg.companyName}!

Managing a prestigious institution like ${school.name} requires seamless daily coordination. We are delighted to introduce ${cfg.productName} (${cfg.tagline}) — the next-generation school management system with zero operational headache.

🌟 Special Risk-Free Assurance for ${school.name}:
• 2 Months Free Trial: "2 महीने चलाकर देखें — पसंद न आए तो ₹0 चार्ज, कोई बॉन्ड नहीं!"
• Ultra-Affordable Pricing: Just ₹${slabRate}/month per student (${studentCount} students).
• 100% Free Data Migration: Our engineering team transfers your complete past data within 48 hours for ₹0.
• One-time Setup Fee (₹5,000): 100% Waivable for schools onboarding this month.

Key Advantages:
1. Instant WhatsApp Updates: Automated attendance and fee receipts sent directly to parents' WhatsApp.
2. Clean & Intuitive UI: Staff and teachers can use it on Day 1 with zero technical training.
3. Multi-Mode Fee Management: Real-time fee collection, instant digital receipts & automated dues reconciliation.
4. CBSE/ICSE Compliant Report Cards: Automated grading and 1-click report generation.

Would you be available for a brief 15-minute live screen-share walkthrough this week?

Best regards,

${cfg.senderName}
${cfg.senderTitle} | ${cfg.linkedinUrl}
📧 ${cfg.senderEmail} | 🌐 ${cfg.websiteUrl}`

      let sentStatus = 'sent'
      let brevoRes = null

      try {
        brevoRes = await EmailService.sendOutreachEmail(
          recipientEmail,
          recipientName,
          subject,
          emailBody.replace(/\n/g, '<br/>')
        )
        if (!brevoRes.success) sentStatus = 'failed'
      } catch (sendErr) {
        sentStatus = 'failed'
        console.warn(`Outreach email failed for ${recipientEmail}:`, (sendErr as Error).message)
      }

      const msgRecord = {
        id: `msg_out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        channel: 'email',
        direction: 'outbound',
        contactName: recipientName,
        contactEmail: recipientEmail,
        schoolName: school.name,
        subject,
        body: emailBody,
        status: sentStatus,
        sentAt: new Date().toISOString(),
      }

      messagesStore.unshift(msgRecord)

      // Advance lead status to contacted in CRM
      if (sentStatus === 'sent') {
        try {
          await prisma.lead.updateMany({
            where: {
              school: {
                OR: [
                  { email: recipientEmail },
                  { name: school.name },
                ],
              },
              status: { in: ['new', 'qualified'] },
            },
            data: { status: 'contacted' },
          })
        } catch {}
      }

      results.push({
        schoolName: school.name,
        email: recipientEmail,
        status: sentStatus,
        error: brevoRes?.error,
        id: msgRecord.id,
      })
    }

    saveJson(MESSAGES_FILE, messagesStore)

    const sentCount = results.filter((r) => r.status === 'sent').length
    const firstError = results.find((r) => r.error)?.error

    res.json({
      success: sentCount > 0 || skippedCount > 0,
      sentCount,
      skippedCount,
      totalTargets: targetSchools.length,
      message:
        sentCount === 0 && firstError
          ? `Email dispatch failed: ${firstError}`
          : sentCount === 0 && skippedCount > 0
          ? `All ${skippedCount} school(s) were already contacted previously. No duplicate cold emails sent!`
          : sentCount === 0
          ? 'No emails could be delivered.'
          : `Dispatched cold emails to ${sentCount} new school(s).${skippedCount > 0 ? ` (Skipped ${skippedCount} previously contacted school(s))` : ''}`,
      results,
    })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// ============================================================
// 2. SMART INBOUND REPLY DETECTION & CATEGORIZATION (Hermes 3 AI)
// ============================================================
router.post('/inbound-reply', async (req, res) => {
  try {
    const {
      fromEmail = 'principal@school.edu.in',
      fromName = 'Principal',
      schoolName = 'Partner School',
      subject = 'Re: Eduvault ERP Demo & Pricing',
      replyText,
    } = req.body

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ success: false, error: 'replyText is required' })
    }

    const cfg = SENDER_CONFIG

    // AI Classification & Draft Prompt
    const prompt = `You are the Lead Intelligence AI for ${cfg.productName} by ${cfg.companyName}.
A school principal / decision maker sent this reply to our cold outreach:
"""
${replyText}
"""

Analyze this reply carefully and perform 2 tasks:
Task 1: Classify intent category into exactly ONE of:
- "demo_requested" (The school wants to see a demo, asks when we can meet/call, asks for a walkthrough)
- "pricing_inquiry" (The school asks about cost, discounts, per-student slabs, setup fees, payment terms)
- "query_received" (The school asks technical questions about features, WhatsApp alerts, data migration, CBSE compliance, security)
- "not_interested" (The school declines, says they don't need it or are satisfied with current software)

Task 2: Draft a polite, highly persuasive, context-aware reply from ${cfg.senderName} (${cfg.senderEmail}) addressing their exact points:
- If demo_requested: Confirm and offer two flexible time slots (e.g., Tomorrow at 11 AM or 3 PM) for a 15-minute live screen-share or in-person visit. Emphasize zero obligation.
- If pricing_inquiry: Clearly explain the transparent ₹5-₹8 student pricing slab (100-200: ₹8, 200-500: ₹7, 500-1000: ₹6, 1000+: ₹5/mo), mention the 2-Month Free Trial with No-Bond guarantee, and offer to waive the ₹5,000 setup fee.
- If query_received: Answer their questions clearly (e.g. 100% free data migration by our team in 48 hours, instant WhatsApp alerts, complete parent portal).
- If not_interested: Be extremely gracious, thank them for their time, and leave the door open for future needs.

Return ONLY valid JSON (no markdown ticks):
{
  "category": "demo_requested" | "pricing_inquiry" | "query_received" | "not_interested",
  "categoryLabel": "🎯 Demo Request" | "💰 Pricing Inquiry" | "❓ Feature Query" | "🛑 Not Interested",
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": 0.95,
  "summary": "1-sentence summary of client response",
  "aiDraftReply": "Full drafted email reply with line breaks"
}`

    let aiResult: any = null
    try {
      const rawAi = await GeminiService.generateIntelligence(prompt)
      const cleaned = rawAi.replace(/```json|```/g, '').trim()
      const match = cleaned.match(/\{[\s\S]*\}/)
      aiResult = JSON.parse(match ? match[0] : cleaned)
    } catch (aiErr) {
      console.warn('AI analysis fallback:', (aiErr as Error).message)
      // Smart Rule-Based Fallback
      const lower = replyText.toLowerCase()
      if (lower.includes('demo') || lower.includes('meet') || lower.includes('call') || lower.includes('time') || lower.includes('dikh') || lower.includes('dekh')) {
        aiResult = {
          category: 'demo_requested',
          categoryLabel: '🎯 Demo Request',
          sentiment: 'positive',
          confidence: 0.92,
          summary: 'School requested a live product demonstration / meeting.',
          aiDraftReply: `Dear Principal ${fromName},\n\nThank you for your interest! We would be delighted to arrange a live 15-minute walkthrough of Eduvault ERP for ${schoolName}.\n\nWould tomorrow at 11:30 AM or 3:00 PM work for a quick Google Meet or in-person session? You will see our live WhatsApp fee alerts and one-click report cards in action.\n\nBest regards,\n${cfg.senderName}\n${cfg.companyName} | ${cfg.senderEmail}`,
        }
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('charge') || lower.includes('paisa') || lower.includes('rate') || lower.includes('discount')) {
        aiResult = {
          category: 'pricing_inquiry',
          categoryLabel: '💰 Pricing Inquiry',
          sentiment: 'positive',
          confidence: 0.90,
          summary: 'School inquired about student pricing slabs and commercials.',
          aiDraftReply: `Dear Principal ${fromName},\n\nThank you for reaching out regarding Eduvault ERP pricing!\n\nOur pricing is completely transparent and tiered by student count:\n• 100 - 200 Students: ₹8 / student / month\n• 200 - 500 Students: ₹7 / student / month\n• 500 - 1,000 Students: ₹6 / student / month\n• 1,000+ Students: ₹5 / student / month\n\n🛡️ Risk-Free Guarantee: You get a full 2-Month Free Trial with "2 महीने चलाकर देखें — पसंद न आए तो ₹0 चार्ज, कोई बॉन्ड नहीं!". Furthermore, our ₹5,000 one-time setup and 100% data migration fee is completely waivable for your institution.\n\nCould we schedule a quick 10-minute call to provide an exact quote for ${schoolName}?\n\nBest regards,\n${cfg.senderName}\n${cfg.companyName} | ${cfg.senderEmail}`,
        }
      } else if (lower.includes('not interested') || lower.includes('nahi') || lower.includes('already have') || lower.includes('stop')) {
        aiResult = {
          category: 'not_interested',
          categoryLabel: '🛑 Not Interested',
          sentiment: 'negative',
          confidence: 0.88,
          summary: 'School indicated they are not looking for an ERP currently.',
          aiDraftReply: `Dear Principal ${fromName},\n\nThank you for letting us know. We completely understand and appreciate your time. If your administrative needs evolve in the future or you ever need WhatsApp fee automation, please feel free to reach out anytime.\n\nWishing ${schoolName} continued success!\n\nBest regards,\n${cfg.senderName}\n${cfg.companyName} | ${cfg.senderEmail}`,
        }
      } else {
        aiResult = {
          category: 'query_received',
          categoryLabel: '❓ Feature Query',
          sentiment: 'neutral',
          confidence: 0.85,
          summary: 'School asked a feature / operational query.',
          aiDraftReply: `Dear Principal ${fromName},\n\nThank you for your question! To answer directly: Eduvault ERP includes automated WhatsApp fee receipts, live attendance sync, and our team handles 100% of data migration from your previous registers or software within 48 hours at ₹0 cost.\n\nAdditionally, you get a full 2-Month Free Trial to verify everything with zero risk. Would you like a quick 15-minute screen walkthrough this week?\n\nBest regards,\n${cfg.senderName}\n${cfg.companyName} | ${cfg.senderEmail}`,
        }
      }
    }

    // Save inbound message to store
    const inboundMessage = {
      id: `msg_in_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      channel: 'email',
      direction: 'inbound',
      contactName: fromName,
      contactEmail: fromEmail,
      schoolName,
      subject,
      body: replyText,
      category: aiResult.category,
      categoryLabel: aiResult.categoryLabel,
      sentiment: aiResult.sentiment,
      aiDraftReply: aiResult.aiDraftReply,
      status: 'received',
      receivedAt: new Date().toISOString(),
    }

    messagesStore.unshift(inboundMessage)
    saveJson(MESSAGES_FILE, messagesStore)

    // ============================================================
    // AUTOMATIC CRM LEAD STAGE ADVANCEMENT
    // ============================================================
    let crmStageAdvanced: string | null = null
    try {
      const matchedSchool = await prisma.school.findFirst({
        where: {
          OR: [
            { name: { contains: schoolName, mode: 'insensitive' } },
            { email: { equals: fromEmail, mode: 'insensitive' } },
          ],
        },
        include: { leads: true },
      })

      if (matchedSchool && matchedSchool.leads && matchedSchool.leads.length > 0) {
        const lead = matchedSchool.leads[0]
        let newStatus: any = 'engaged'
        if (aiResult.category === 'demo_requested') {
          newStatus = 'meeting_scheduled'
        } else if (aiResult.category === 'pricing_inquiry') {
          newStatus = 'proposal_sent'
        } else if (aiResult.category === 'not_interested') {
          newStatus = 'lost'
        } else {
          newStatus = 'engaged'
        }

        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: newStatus },
        })
        crmStageAdvanced = newStatus
      }
    } catch (crmErr) {
      console.warn('CRM stage auto-advancement warning:', (crmErr as Error).message)
    }

    // Create real-time Alert
    const alertId = `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const newAlert = {
      id: alertId,
      type: 'client_reply',
      category: aiResult.category,
      categoryLabel: aiResult.categoryLabel,
      title: `${aiResult.categoryLabel}: ${schoolName}`,
      crmStageAdvanced,
      schoolName,
      fromName,
      fromEmail,
      originalSubject: subject,
      preview: replyText.length > 120 ? replyText.substring(0, 120) + '...' : replyText,
      fullMessage: replyText,
      aiDraftReply: aiResult.aiDraftReply,
      status: 'unread',
      createdAt: new Date().toISOString(),
    }

    alertsStore.unshift(newAlert)
    saveJson(ALERTS_FILE, alertsStore)

    res.status(201).json({
      success: true,
      inboundMessage,
      crmStageAdvanced,
      alert: newAlert,
      aiResult,
    })

  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// ============================================================
// 3. IN-APP ALERTS & CLIENT RESPONSE NOTIFICATIONS
// ============================================================
router.get('/alerts', (req, res) => {
  const unreadOnly = req.query.unread === 'true'
  let results = alertsStore
  if (unreadOnly) {
    results = alertsStore.filter((a) => a.status === 'unread')
  }
  res.json({
    success: true,
    total: alertsStore.length,
    unreadCount: alertsStore.filter((a) => a.status === 'unread').length,
    data: results,
  })
})

router.patch('/alerts/:id/read', (req, res) => {
  const alert = alertsStore.find((a) => a.id === req.params.id)
  if (alert) {
    alert.status = 'read'
    saveJson(ALERTS_FILE, alertsStore)
    return res.json({ success: true, alert })
  }
  res.status(404).json({ success: false, error: 'Alert not found' })
})

router.post('/alerts/:id/send-reply', async (req, res) => {
  try {
    const alert = alertsStore.find((a) => a.id === req.params.id)
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' })
    }

    const { customReply } = req.body
    const finalReply = customReply || alert.aiDraftReply
    const subject = `Re: ${alert.originalSubject || 'Eduvault ERP Consultation'}`

    const brevoRes = await EmailService.sendOutreachEmail(
      alert.fromEmail,
      alert.fromName,
      subject,
      finalReply.replace(/\n/g, '<br/>')
    )

    alert.status = 'replied'
    alert.repliedAt = new Date().toISOString()
    saveJson(ALERTS_FILE, alertsStore)

    const outMsg = {
      id: `msg_rep_${Date.now()}`,
      channel: 'email',
      direction: 'outbound',
      contactName: alert.fromName,
      contactEmail: alert.fromEmail,
      schoolName: alert.schoolName,
      subject,
      body: finalReply,
      status: brevoRes.success ? 'sent' : 'failed',
      sentAt: new Date().toISOString(),
    }
    messagesStore.unshift(outMsg)
    saveJson(MESSAGES_FILE, messagesStore)

    res.json({ success: true, message: 'AI Reply sent successfully!', alert, brevoRes })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// ============================================================
// 4. TEST / SIMULATE CLIENT RESPONSE ENDPOINT
// ============================================================
router.post('/simulate-reply', async (req, res) => {
  try {
    const { type = 'demo', schoolName = 'Delhi Public School', fromEmail = 'principal@dps.edu.in' } = req.body

    let replyText = ''
    if (type === 'demo') {
      replyText = `Hello Shashi, we received your email regarding Eduvault ERP. We are currently reviewing our administrative systems. Can you arrange a live demo this Thursday at 2 PM for our management committee?`
    } else if (type === 'pricing') {
      replyText = `Dear Shashi, please send us the detailed fee breakdown for 750 students. Does the monthly fee include WhatsApp integration and is there any setup charge?`
    } else if (type === 'query') {
      replyText = `Hi, we currently use an old software with 1,200 student records. How does data migration work, and how long does it take without disrupting our school operations?`
    } else {
      replyText = `Thank you for reaching out, but we are satisfied with our current system and not looking to make any changes this academic session.`
    }

    // Forward to inbound-reply handler
    req.body = {
      fromEmail,
      fromName: 'Dr. R. K. Sharma',
      schoolName,
      subject: `Re: Eduvault ERP for ${schoolName}`,
      replyText,
    }

    // Call internal logic
    const cfg = SENDER_CONFIG
    let aiResult: any = {
      category: type === 'demo' ? 'demo_requested' : type === 'pricing' ? 'pricing_inquiry' : type === 'query' ? 'query_received' : 'not_interested',
      categoryLabel: type === 'demo' ? '🎯 Demo Request' : type === 'pricing' ? '💰 Pricing Inquiry' : type === 'query' ? '❓ Feature Query' : '🛑 Not Interested',
      sentiment: type === 'not_interested' ? 'negative' : 'positive',
      confidence: 0.95,
      summary: type === 'demo' ? 'Requested live demonstration on Thursday at 2 PM' : 'Inquired about pricing and commercials',
      aiDraftReply: type === 'demo'
        ? `Dear Dr. Sharma,\n\nThank you for your response! We would be delighted to present a live walkthrough for your management committee this Thursday at 2:00 PM.\n\nWe will showcase our 1-click attendance, instant WhatsApp fee receipts, and CBSE report generation. I will send over a calendar invite shortly.\n\nBest regards,\n${cfg.senderName}\n${cfg.companyName}`
        : `Dear Dr. Sharma,\n\nFor 750 students, your rate is just ₹6 / student / month, which includes full WhatsApp automation. Plus, your 2-Month Free Trial comes with our "2 महीने चलाकर देखें — पसंद न आए तो ₹0 चार्ज, कोई बॉन्ड नहीं!" guarantee, and the ₹5,000 setup fee is 100% waived!\n\nBest regards,\n${cfg.senderName}`,
    }

    const newAlert = {
      id: `alt_${Date.now()}_sim`,
      type: 'client_reply',
      category: aiResult.category,
      categoryLabel: aiResult.categoryLabel,
      title: `${aiResult.categoryLabel}: ${schoolName}`,
      schoolName,
      fromName: 'Dr. R. K. Sharma',
      fromEmail,
      originalSubject: `Re: Eduvault ERP for ${schoolName}`,
      preview: replyText.substring(0, 120),
      fullMessage: replyText,
      aiDraftReply: aiResult.aiDraftReply,
      status: 'unread',
      createdAt: new Date().toISOString(),
    }

    alertsStore.unshift(newAlert)
    saveJson(ALERTS_FILE, alertsStore)

    const inboundMessage = {
      id: `msg_sim_${Date.now()}`,
      channel: 'email',
      direction: 'inbound',
      contactName: 'Dr. R. K. Sharma',
      contactEmail: fromEmail,
      schoolName,
      subject: `Re: Eduvault ERP for ${schoolName}`,
      body: replyText,
      category: aiResult.category,
      categoryLabel: aiResult.categoryLabel,
      status: 'received',
      receivedAt: new Date().toISOString(),
    }
    messagesStore.unshift(inboundMessage)
    saveJson(MESSAGES_FILE, messagesStore)

    res.json({ success: true, alert: newAlert, inboundMessage })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

export default router

