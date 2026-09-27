import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export interface Message {
  id: string
  channel: 'email' | 'whatsapp' | 'sms' | 'call'
  direction: 'inbound' | 'outbound'
  contactName: string
  contactEmail?: string
  schoolName?: string
  subject?: string
  body: string
  status: 'sent' | 'delivered' | 'received' | 'completed' | 'failed'
  sentAt: string
  category?: string
  categoryLabel?: string
  receivedAt?: string
  aiDraftReply?: string
}

export interface MessageTemplate {
  id: string
  name: string
  channel: string
  subject: string
  body: string
  variables: string[]
}

export const communicationApi = {
  // Get inbox messages
  getInbox: async (channel = 'all') => {
    const res = await axios.get(`${API_BASE}/communication/inbox`, { params: { channel } })
    return res.data
  },

  // Send email via Brevo
  sendEmail: async (data: { toEmail: string; toName?: string; schoolName?: string; subject: string; body: string }) => {
    const res = await axios.post(`${API_BASE}/communication/send`, data)
    return res.data
  },

  // Generate Gemini AI personalized email
  personalizeEmail: async (data: { schoolName: string; principalName?: string; studentCount?: number; city?: string }) => {
    const res = await axios.post(`${API_BASE}/communication/ai-personalize`, data)
    return res.data.data
  },

  // Generate Gemini AI reply suggestion
  getReplySuggestions: async (inboundMessage: string) => {
    const res = await axios.post(`${API_BASE}/communication/reply-assistant`, { inboundMessage })
    return res.data.data
  },

  // Get templates
  getTemplates: async () => {
    const res = await axios.get(`${API_BASE}/communication/templates`)
    return res.data.data as MessageTemplate[]
  },
}
