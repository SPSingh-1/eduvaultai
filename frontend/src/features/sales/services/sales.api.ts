import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export interface DealPricing {
  ratePerStudentMonth: number
  tierLabel: string
  studentCount: number
  monthlySaaS: number
  annualSaaS: number
  implementationFee: number
  totalFirstYearContract: number
  freeTrialMonths: number
  freeDataMigration: boolean
  freeStaffTraining: boolean
}

export interface DealEmailStatus {
  sent: boolean
  sentCount: number
  lastSentAt?: string | null
  lastSubject?: string | null
  hasReplied: boolean
  replyCategory?: string | null
  replyCategoryLabel?: string | null
  replySentiment?: string | null
  replySnippet?: string | null
  replyReceivedAt?: string | null
}

export interface Deal {
  id: string
  schoolName: string
  contactName: string
  stage: 'discovery' | 'ai_strong' | 'outreach_sent' | 'qualification' | 'demo_scheduled' | 'proposal_sent' | 'closed_won' | string
  value: number
  pricing?: DealPricing
  currency: string
  probability: number
  expectedClose: string
  studentCount?: number
  modules?: string[]
  phone?: string
  city?: string
  email?: string
  website?: string
  leadScore?: number
  emailStatus?: DealEmailStatus
}

export interface PipelineStage {
  id: string
  name: string
  description?: string
  deals: Deal[]
}

export interface PipelineResponse {
  success: boolean
  totalValue: number
  dealCount: number
  data: PipelineStage[]
  aiIntentStages?: PipelineStage[]
}

export const salesApi = {
  // Get pipeline kanban data
  getPipeline: async (): Promise<PipelineResponse> => {
    const res = await axios.get(`${API_BASE}/sales/pipeline`)
    return res.data
  },

  // Get deal workspace detail
  getDealById: async (id: string) => {
    const res = await axios.get(`${API_BASE}/sales/deals/${id}`)
    return res.data.data as Deal
  },

  // Move deal to new stage
  updateStage: async (id: string, stage: string) => {
    const res = await axios.patch(`${API_BASE}/sales/deals/${id}/stage`, { stage })
    return res.data.data as Deal
  },

  // 1-Click Cold Email Dispatch with Duplicate Lock
  sendColdEmail: async (id: string, toEmail?: string) => {
    const res = await axios.post(`${API_BASE}/sales/deals/${id}/send-cold-email`, { toEmail })
    return res.data
  },

  // Create real new deal
  createDeal: async (dealData: {
    schoolName: string
    contactName?: string
    phone?: string
    email?: string
    city?: string
    studentCount?: number
    stage?: string
  }) => {
    const res = await axios.post(`${API_BASE}/sales/deals`, dealData)
    return res.data.data as Deal
  },

  // Delete deal
  deleteDeal: async (id: string) => {
    const res = await axios.delete(`${API_BASE}/sales/deals/${id}`)
    return res.data
  },

  // Gemini AI Sales Strategist recommendation
  getSalesStrategist: async (id: string) => {
    const res = await axios.post(`${API_BASE}/sales/deals/${id}/strategist`)
    return res.data.data
  },

  // Get sales tasks
  getTasks: async () => {
    const res = await axios.get(`${API_BASE}/sales/tasks`)
    return res.data.data
  },

  // Toggle task complete
  toggleTask: async (id: string) => {
    const res = await axios.patch(`${API_BASE}/sales/tasks/${id}/complete`)
    return res.data.data
  },
}
