import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export interface APIKeyItem {
  provider: string
  envVar: string
  status: string
  freeQuota: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
}

export interface IntegrationItem {
  name: string
  category: string
  status: string
  latencyMs: number
}

export const settingsApi = {
  // Get API keys
  getKeys: async () => {
    const res = await axios.get(`${API_BASE}/settings/keys`)
    return res.data.data as APIKeyItem[]
  },

  // Get team roster
  getTeam: async () => {
    const res = await axios.get(`${API_BASE}/settings/team`)
    return res.data.data as TeamMember[]
  },

  // Invite team member
  inviteMember: async (data: { name: string; email: string; role: string }) => {
    const res = await axios.post(`${API_BASE}/settings/team/invite`, data)
    return res.data.data as TeamMember
  },

  // Get integrations health
  getIntegrations: async () => {
    const res = await axios.get(`${API_BASE}/settings/integrations`)
    return res.data.data as IntegrationItem[]
  },
}
