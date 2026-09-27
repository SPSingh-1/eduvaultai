import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export interface Lead {
  id: string
  organizationId: string
  schoolId: string
  contactId?: string
  assignedTo?: string
  status: 'new' | 'contacted' | 'engaged' | 'qualified' | 'meeting_scheduled' | 'proposal_sent' | 'negotiating' | 'won' | 'lost'
  leadScore: number
  scoreBreakdown?: any
  school?: any
  contact?: any
  assignee?: any
  createdAt?: string
}

export interface ICPConfig {
  targetBoards: string[]
  minStudentCount: number
  maxStudentCount: number
  targetRegions: string[]
  minAutoOutreachScore: number
  keyDecisionMakerTitles: string[]
  updatedAt?: string
}

export const leadsApi = {
  // List leads
  list: async (params?: { status?: string; minScore?: number; search?: string; page?: number }) => {
    const res = await axios.get(`${API_BASE}/leads`, { params })
    return res.data
  },

  // Get lead detail
  getById: async (id: string) => {
    const res = await axios.get(`${API_BASE}/leads/${id}`)
    return res.data.data as Lead
  },

  // Update lead pipeline status
  updateStatus: async (id: string, status: string) => {
    const res = await axios.patch(`${API_BASE}/leads/${id}/status`, { status })
    return res.data.data as Lead
  },

  // Trigger Gemini AI rescoring
  rescoreLead: async (id: string) => {
    const res = await axios.post(`${API_BASE}/leads/${id}/rescore`)
    return res.data
  },

  // Get ICP settings
  getICP: async () => {
    const res = await axios.get(`${API_BASE}/icp`)
    return res.data.data as ICPConfig
  },

  // Update ICP settings
  updateICP: async (config: Partial<ICPConfig>) => {
    const res = await axios.post(`${API_BASE}/icp`, config)
    return res.data.data as ICPConfig
  },

  // Launch personalized cold email via Brevo
  sendPersonalizedEmail: async (leadId: string, emailData?: { toEmail?: string; subject?: string; body?: string }) => {
    const res = await axios.post(`${API_BASE}/leads/${leadId}/send-email`, emailData || {})
    return res.data
  },

  // Execute AI recommended strategy
  executeStrategy: async (leadId: string) => {
    const res = await axios.post(`${API_BASE}/leads/${leadId}/execute-strategy`)
    return res.data
  },
}
