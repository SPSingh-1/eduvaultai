import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export interface School {
  id: string
  name: string
  type: string
  city?: string
  state?: string
  address?: string
  website?: string
  phone?: string
  email?: string
  studentCount?: number
  principalName?: string
  source?: string
  confidence?: number
  websiteData?: any
  contacts?: any[]
  leads?: any[]
  createdAt?: string
}

export const schoolsApi = {
  // Fetch list of schools
  list: async (params?: { search?: string; city?: string; type?: string; page?: number; limit?: number }) => {
    const res = await axios.get(`${API_BASE}/schools`, { params })
    return res.data
  },

  // Get school 360 degree detail
  getById: async (id: string) => {
    const res = await axios.get(`${API_BASE}/schools/${id}`)
    return res.data.data as School
  },

  // Create school record
  create: async (data: Partial<School>) => {
    const res = await axios.post(`${API_BASE}/schools`, data)
    return res.data.data
  },

  // Bulk CSV import
  bulkImport: async (schools: Partial<School>[]) => {
    const res = await axios.post(`${API_BASE}/schools/import`, { schools })
    return res.data
  },

  // Live Google Places & Search School Discovery
  discoverByCity: async (params: string | { city: string; area?: string; schoolType?: string }) => {
    const payload = typeof params === 'string' ? { city: params } : params
    const res = await axios.post(`${API_BASE}/discovery/search`, payload)
    return res.data
  },

  // Run 4-stage Autonomous AI Agent Workflow
  runAutoPilot: async (params: { city: string; area?: string; schoolType?: string }) => {
    const res = await axios.post(`${API_BASE}/discovery/auto-pilot`, params)
    return res.data
  },

  // Get targeted counts by city & locality
  getTargetedStats: async () => {
    const res = await axios.get(`${API_BASE}/discovery/targeted-stats`)
    return res.data as {
      success: boolean
      totalTargeted: number
      cities: Record<string, number>
      areas: Record<string, number>
    }
  },

  // Save discovered school as qualified lead
  saveDiscovered: async (schoolData: Partial<School> & { area?: string }) => {
    const res = await axios.post(`${API_BASE}/discovery/save`, schoolData)
    return res.data
  },

  // Run Gemini Website Vision AI research
  runWebsiteResearch: async (id: string) => {
    const res = await axios.post(`${API_BASE}/schools/${id}/website-research`)
    return res.data
  },

  // Autonomous Cold Email Dispatcher
  autoOutreach: async (params?: { schoolIds?: string[]; schools?: any[]; limit?: number }) => {
    const res = await axios.post(`${API_BASE}/communication/auto-outreach`, params || {})
    return res.data
  },

  // Inbound Client Response Alerts
  getAlerts: async (unreadOnly = false) => {
    const res = await axios.get(`${API_BASE}/communication/alerts${unreadOnly ? '?unread=true' : ''}`)
    return res.data
  },

  markAlertRead: async (alertId: string) => {
    const res = await axios.patch(`${API_BASE}/communication/alerts/${alertId}/read`)
    return res.data
  },

  sendAlertReply: async (alertId: string, customReply?: string) => {
    const res = await axios.post(`${API_BASE}/communication/alerts/${alertId}/send-reply`, { customReply })
    return res.data
  },

  simulateReply: async (type: 'demo' | 'pricing' | 'query' | 'reject', schoolName?: string) => {
    const res = await axios.post(`${API_BASE}/communication/simulate-reply`, { type, schoolName })
    return res.data
  },
}

