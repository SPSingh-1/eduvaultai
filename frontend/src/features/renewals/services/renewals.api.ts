import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export interface RenewalItem {
  id: string
  schoolName: string
  currentArr: number
  renewalDate: string
  daysToExpiry: number
  status: 'upcoming' | 'proposal_sent' | 'renewed' | 'churned'
  renewalLikelihood: string
  upsellOpportunity: string
  potentialExpansionARR: number
}

export const renewalsApi = {
  // Get upcoming renewals list & ARR stats
  list: async () => {
    const res = await axios.get(`${API_BASE}/renewals`)
    return res.data
  },

  // Gemini AI Upsell Pitch Generator
  generateUpsellPitch: async (id: string) => {
    const res = await axios.post(`${API_BASE}/renewals/${id}/upsell-pitch`)
    return res.data.data
  },

  // Auto-generate proposal
  autoGenProposal: async (id: string) => {
    const res = await axios.post(`${API_BASE}/renewals/${id}/autogen-proposal`)
    return res.data
  },
}
