import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export interface AIAgent {
  id: string
  name: string
  domain: string
  status: 'active' | 'paused' | 'idle' | 'error'
  model: string
  executionsToday: number
  accuracy: string
}

export interface ControlTowerTelemetry {
  totalAgents: number
  activeAgents: number
  totalExecutionsToday: number
  pendingApprovalsCount: number
  tokenUsageToday: string
  circuitBreakerState: 'NORMAL' | 'PAUSED'
}

export interface ApprovalItem {
  id: string
  agentName: string
  actionType: string
  target: string
  payload: any
  confidenceScore: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export const aiApi = {
  // Control tower stats
  getTelemetry: async () => {
    const res = await axios.get(`${API_BASE}/ai/control-tower`)
    return res.data.data as ControlTowerTelemetry
  },

  // Get 17 agents
  getAgents: async () => {
    const res = await axios.get(`${API_BASE}/ai/agents`)
    return res.data.data as AIAgent[]
  },

  // Toggle individual agent
  updateAgentStatus: async (id: string, status: string) => {
    const res = await axios.patch(`${API_BASE}/ai/agents/${id}/status`, { status })
    return res.data.data as AIAgent
  },

  // Emergency Circuit Breaker
  triggerCircuitBreaker: async (action: 'pause_all' | 'resume_all') => {
    const res = await axios.post(`${API_BASE}/ai/circuit-breaker`, { action })
    return res.data
  },

  // Approvals Queue
  getApprovals: async () => {
    const res = await axios.get(`${API_BASE}/ai/approvals`)
    return res.data.data as ApprovalItem[]
  },

  approveAction: async (id: string) => {
    const res = await axios.post(`${API_BASE}/ai/approvals/${id}/approve`)
    return res.data
  },

  rejectAction: async (id: string) => {
    const res = await axios.post(`${API_BASE}/ai/approvals/${id}/reject`)
    return res.data
  },
}
