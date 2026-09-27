import fs from 'fs'
import path from 'path'
import { FULL_SCHOOL_REGISTRY } from './discovery.service'

const DATA_DIR = path.resolve(__dirname, '../../data')
const DEALS_FILE = path.join(DATA_DIR, 'deals.json')
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json')

export const STAGE_PROBABILITY: Record<string, number> = {
  discovery: 30,
  ai_strong: 60,
  outreach_sent: 50,
  demo_scheduled: 80,
  proposal_sent: 90,
  closed_won: 100,
}

export const STAGE_LABEL: Record<string, string> = {
  discovery: 'Discovery (30%)',
  ai_strong: 'AI High Intent (60%)',
  outreach_sent: 'Outreach Sent (50%)',
  demo_scheduled: 'Demo Scheduled (80%)',
  proposal_sent: 'Proposal Sent (90%)',
  closed_won: 'Closed Won 🎉 (100%)',
}

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

function loadMessages(): any[] {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'))
    }
  } catch {}
  return []
}

export interface Deal {
  id: string
  schoolName: string
  contactName: string
  stage: 'discovery' | 'ai_strong' | 'outreach_sent' | 'demo_scheduled' | 'proposal_sent' | 'closed_won' | string
  value: number
  pricing: any
  currency: string
  probability: number
  expectedClose: string
  studentCount: number
  modules: string[]
  leadScore: number
  city: string
  phone: string
  email?: string
  website?: string
  scoreBreakdown?: any
  emailStatus?: {
    sent: boolean
    sentCount: number
    lastSentAt: string | null
    lastSubject: string | null
    hasReplied: boolean
    replyCategory: string | null
    replyCategoryLabel: string | null
    replySentiment: string | null
    replySnippet: string | null
    replyReceivedAt: string | null
  }
  stageEnteredAt?: string | null
  createdAt?: string | null
  updatedAt?: string
}

function syncDealEmailStatus(deal: Deal, allMessages: any[]): Deal {
  const schoolNameLower = (deal.schoolName || '').toLowerCase().trim()
  const schoolEmailLower = (deal.email || '').toLowerCase().trim()

  const matchMessage = (m: any) => {
    const mSchool = (m.schoolName || '').toLowerCase().trim()
    const mEmail = (m.contactEmail || '').toLowerCase().trim()
    if (schoolEmailLower && mEmail && schoolEmailLower === mEmail) return true
    if (schoolNameLower && mSchool && (schoolNameLower.includes(mSchool) || mSchool.includes(schoolNameLower))) return true
    return false
  }

  const outboundMsgs = allMessages.filter((m: any) => m.direction === 'outbound' && m.status === 'sent' && matchMessage(m))
  const inboundMsgs = allMessages.filter((m: any) => m.direction === 'inbound' && matchMessage(m))

  const isContacted = outboundMsgs.length > 0
  const lastOutbound = outboundMsgs[0] || null
  const lastInbound = inboundMsgs[0] || null

  // Only advance stages based on actual sent and inbound messages
  let stage = deal.stage
  let stageEnteredAt = deal.stageEnteredAt || deal.updatedAt || deal.createdAt || null

  if (inboundMsgs.length > 0) {
    if (['discovery', 'ai_strong', 'outreach_sent'].includes(stage)) {
      stage = 'demo_scheduled'
      stageEnteredAt = lastInbound?.receivedAt || new Date().toISOString()
    }
  } else if (outboundMsgs.length > 0) {
    if (['discovery', 'ai_strong'].includes(stage)) {
      stage = 'outreach_sent'
      stageEnteredAt = lastOutbound?.sentAt || new Date().toISOString()
    }
  } else {
    // If no real outbound or inbound messages exist, revert mock stages back to AI High Intent
    if (stage === 'outreach_sent' || stage === 'demo_scheduled') {
      stage = (deal.studentCount || 1000) >= 500 ? 'ai_strong' : 'discovery'
      stageEnteredAt = deal.createdAt || deal.updatedAt || new Date().toISOString()
    }
  }

  return {
    ...deal,
    stage,
    stageEnteredAt,
    probability: STAGE_PROBABILITY[stage] || deal.probability || 60,
    emailStatus: {
      sent: isContacted,
      sentCount: outboundMsgs.length,
      lastSentAt: lastOutbound?.sentAt || null,
      lastSubject: lastOutbound?.subject || null,
      hasReplied: inboundMsgs.length > 0,
      replyCategory: lastInbound?.category || null,
      replyCategoryLabel: lastInbound?.categoryLabel || null,
      replySentiment: lastInbound?.sentiment || null,
      replySnippet: lastInbound?.body ? (lastInbound.body.length > 100 ? lastInbound.body.substring(0, 100) + '...' : lastInbound.body) : null,
      replyReceivedAt: lastInbound?.receivedAt || null,
    },
  }
}

export class DealsService {
  /**
   * Load all deals from persistent JSON file with automatic sync against messages.
   * If deals.json is empty, seeds with top verified schools so the pipeline is never blank.
   */
  static loadDeals(): Deal[] {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }

      let deals: Deal[] = []
      if (fs.existsSync(DEALS_FILE)) {
        try {
          const raw = fs.readFileSync(DEALS_FILE, 'utf-8')
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            deals = parsed
          }
        } catch (e) {
          console.warn('Error reading deals.json, will reinitialize:', (e as Error).message)
        }
      }

      // Seed if completely empty
      if (deals.length === 0) {
        deals = this.generateInitialDeals()
        this.saveDeals(deals)
      }

      // Synchronize with messages for live email tracking
      const allMessages = loadMessages()
      return deals.map((d) => syncDealEmailStatus(d, allMessages))
    } catch (err) {
      console.warn('Failed to load deals:', (err as Error).message)
      return []
    }
  }

  /**
   * Save deals to data/deals.json
   */
  static saveDeals(deals: Deal[]): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }
      fs.writeFileSync(DEALS_FILE, JSON.stringify(deals, null, 2), 'utf-8')
    } catch (err) {
      console.warn('Failed to save deals.json:', (err as Error).message)
    }
  }

  /**
   * Upsert a deal by id or normalized school name
   */
  static upsertDeal(dealInput: Partial<Deal> & { schoolName: string }): Deal {
    const deals = this.loadDeals()
    const cleanName = dealInput.schoolName.toLowerCase().trim()
    const studentCount = dealInput.studentCount ? parseInt(String(dealInput.studentCount)) : 1000
    const pricing = calculateSchoolPricing(studentCount)
    const stage = dealInput.stage || 'ai_strong'

    const existingIdx = deals.findIndex(
      (d) => (dealInput.id && d.id === dealInput.id) || d.schoolName.toLowerCase().trim() === cleanName
    )

    let finalDeal: Deal

    if (existingIdx !== -1) {
      const existing = deals[existingIdx]
      const stageChanged = dealInput.stage && dealInput.stage !== existing.stage
      finalDeal = {
        ...existing,
        ...dealInput,
        pricing,
        value: dealInput.value || pricing.annualSaaS,
        studentCount,
        stage: dealInput.stage || existing.stage,
        probability: STAGE_PROBABILITY[dealInput.stage || existing.stage] || existing.probability,
        stageEnteredAt: stageChanged
          ? new Date().toISOString()
          : existing.stageEnteredAt || existing.updatedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      deals[existingIdx] = finalDeal
    } else {
      const dealId = dealInput.id || `deal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      const now = new Date().toISOString()
      finalDeal = {
        id: dealId,
        schoolName: dealInput.schoolName,
        contactName: dealInput.contactName || 'Principal',
        stage,
        stageEnteredAt: now,
        createdAt: now,
        value: dealInput.value || pricing.annualSaaS,
        pricing,
        currency: 'INR',
        probability: STAGE_PROBABILITY[stage] || 60,
        expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
        studentCount,
        modules: dealInput.modules || ['School ERP', 'WhatsApp Fees', 'Parent Mobile App'],
        leadScore: dealInput.leadScore || 85,
        city: dealInput.city || 'Jaipur',
        phone: dealInput.phone || '',
        email: dealInput.email || '',
        website: dealInput.website || '',
        scoreBreakdown: dealInput.scoreBreakdown || {
          reasoning: `AI High Intent Fit: ${studentCount} students with verified contact channels`,
          qualified: true,
        },
        emailStatus: dealInput.emailStatus || {
          sent: false,
          sentCount: 0,
          lastSentAt: null,
          lastSubject: null,
          hasReplied: false,
          replyCategory: null,
          replyCategoryLabel: null,
          replySentiment: null,
          replySnippet: null,
          replyReceivedAt: null,
        },
        updatedAt: now,
      }
      deals.unshift(finalDeal)
    }

    this.saveDeals(deals)
    return finalDeal
  }

  /**
   * Save a school directly as a qualified deal from Discovery
   */
  static saveSchoolAsDeal(school: {
    name: string
    city?: string
    area?: string
    website?: string
    phone?: string
    email?: string
    type?: string
    studentCount?: number | string
    principalName?: string
    leadScore?: number
    stage?: string
  }): Deal {
    const studentCount = school.studentCount ? parseInt(String(school.studentCount)) : 500
    const leadScore = school.leadScore || (studentCount >= 1000 ? 94 : studentCount >= 500 ? 86 : 76)
    // Default stage for user qualifying a school is 'ai_strong' (AI High Intent 60%)
    const stage = school.stage || (leadScore >= 70 ? 'ai_strong' : 'discovery')

    return this.upsertDeal({
      schoolName: school.name,
      contactName: school.principalName || 'Principal',
      stage,
      studentCount,
      city: school.city || (school.area ? `${school.area}` : 'Jaipur'),
      phone: school.phone || '',
      email: school.email || '',
      website: school.website || '',
      leadScore,
      scoreBreakdown: {
        reasoning: `Directly Qualified by User: ${studentCount} students, ${school.type || 'K-12'} curriculum`,
        qualified: true,
      },
    })
  }

  /**
   * Update stage of a deal (e.g. Kanban drag/drop or dropdown)
   */
  static updateDealStage(id: string, stage: string): Deal | null {
    const deals = this.loadDeals()
    const deal = deals.find((d) => d.id === id)
    if (!deal) return null

    if (deal.stage !== stage) {
      deal.stage = stage
      deal.stageEnteredAt = new Date().toISOString()
    }
    deal.probability = STAGE_PROBABILITY[stage] || 50
    deal.updatedAt = new Date().toISOString()
    this.saveDeals(deals)
    return deal
  }

  /**
   * Delete deal
   */
  static deleteDeal(id: string): boolean {
    const deals = this.loadDeals()
    const idx = deals.findIndex((d) => d.id === id)
    if (idx === -1) return false
    deals.splice(idx, 1)
    this.saveDeals(deals)
    return true
  }

  /**
   * Generate initial realistic deals from FULL_SCHOOL_REGISTRY
   */
  private static generateInitialDeals(): Deal[] {
    const initialCandidates = FULL_SCHOOL_REGISTRY.slice(0, 10)

    const now = new Date().toISOString()
    return initialCandidates.map((sch, i) => {
      const studentCount = sch.students || 1000
      const pricing = calculateSchoolPricing(studentCount)
      const stage: Deal['stage'] = studentCount >= 500 ? 'ai_strong' : 'discovery'

      return {
        id: `deal_init_${i + 1}`,
        schoolName: sch.name,
        contactName: 'Principal',
        stage,
        stageEnteredAt: now,
        createdAt: now,
        value: pricing.annualSaaS,
        pricing,
        currency: 'INR',
        probability: STAGE_PROBABILITY[stage] || 60,
        expectedClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * (20 + i * 2)).toISOString().split('T')[0],
        studentCount,
        modules: ['School ERP', 'WhatsApp Fees', 'Parent Mobile App'],
        leadScore: studentCount >= 3000 ? 96 : studentCount >= 2000 ? 92 : studentCount >= 1000 ? 88 : 80,
        city: 'Jaipur',
        phone: sch.phone || '',
        email: sch.email || '',
        website: sch.website || '',
        scoreBreakdown: {
          reasoning: `AI ICP Verified: ${studentCount} students, ${sch.type} curriculum with verified contacts.`,
          locality: sch.area,
          qualified: true,
        },
        emailStatus: {
          sent: false,
          sentCount: 0,
          lastSentAt: null,
          lastSubject: null,
          hasReplied: false,
          replyCategory: null,
          replyCategoryLabel: null,
          replySentiment: null,
          replySnippet: null,
          replyReceivedAt: null,
        },
        updatedAt: now,
      }
    })
  }

  /**
   * Helper to build AI High-Intent Pipeline
   */
  static buildAiIntentPipeline(deals: Deal[]) {
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
}
