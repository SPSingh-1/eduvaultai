import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export interface Customer {
  id: string
  schoolName: string
  primaryContact: string
  accountManager: string
  status: 'active' | 'at_risk' | 'churning'
  healthScore: number
  npsScore: number
  mrr: number
  contractRenewalDate: string
  onboardingStatus: string
  activeModules: string[]
  healthBreakdown?: any
}

export const customersApi = {
  // List customers
  list: async () => {
    const res = await axios.get(`${API_BASE}/customers`)
    return res.data.data as Customer[]
  },

  // List at-risk accounts
  getAtRisk: async () => {
    const res = await axios.get(`${API_BASE}/customers/at-risk`)
    return res.data.data as Customer[]
  },

  // Get customer 360 detail
  getById: async (id: string) => {
    const res = await axios.get(`${API_BASE}/customers/${id}`)
    return res.data.data as Customer
  },

  // Refresh Gemini health score & churn analysis
  refreshHealth: async (id: string) => {
    const res = await axios.post(`${API_BASE}/customers/${id}/health/refresh`)
    return res.data
  },

  // Ask AI Support Copilot
  askSupportCopilot: async (question: string) => {
    const res = await axios.post(`${API_BASE}/customers/support-copilot`, { question })
    return res.data.data
  },
}
