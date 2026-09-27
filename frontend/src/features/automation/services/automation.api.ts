import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export interface Workflow {
  id: string
  name: string
  status: 'active' | 'paused' | 'draft'
  trigger: string
  conditions: string[]
  actions: string[]
  totalRuns: number
  lastRunAt: string
}

export const automationApi = {
  // Get workflows
  getWorkflows: async () => {
    const res = await axios.get(`${API_BASE}/automation/workflows`)
    return res.data.data as Workflow[]
  },

  // Create workflow
  createWorkflow: async (data: { name: string; trigger: string; conditions?: string[]; actions?: string[] }) => {
    const res = await axios.post(`${API_BASE}/automation/workflows`, data)
    return res.data.data as Workflow
  },

  // Test trigger workflow
  triggerWorkflow: async (id: string) => {
    const res = await axios.post(`${API_BASE}/automation/workflows/${id}/trigger`)
    return res.data
  },
}
