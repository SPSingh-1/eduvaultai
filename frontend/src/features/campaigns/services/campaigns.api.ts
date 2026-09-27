import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export interface Campaign {
  id: string
  name: string
  type: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  goal: string
  targetSegment: string
  totalEnrolled: number
  emailsSent: number
  openRate: string
  replyRate: string
  createdAt: string
}

export const campaignsApi = {
  // Get campaigns list
  list: async () => {
    const res = await axios.get(`${API_BASE}/campaigns`)
    return res.data.data as Campaign[]
  },

  // Create campaign
  create: async (data: { name: string; type?: string; goal?: string; targetSegment?: string }) => {
    const res = await axios.post(`${API_BASE}/campaigns`, data)
    return res.data.data as Campaign
  },

  // Launch campaign
  start: async (id: string) => {
    const res = await axios.post(`${API_BASE}/campaigns/${id}/start`)
    return res.data.data as Campaign
  },

  // Gemini Campaign Strategy Generator
  generateStrategy: async (data: { targetSegment: string; goal: string }) => {
    const res = await axios.post(`${API_BASE}/campaigns/strategy-generator`, data)
    return res.data.data
  },
}
