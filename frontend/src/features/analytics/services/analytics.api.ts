import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export interface ExecutiveMetrics {
  totalPipelineARR: number
  closedWonARR: number
  avgDealSize: number
  salesCycleDays: number
  winRate: string
  cacSavingsWithAI: string
  aiAgentsContribution: string
}

export interface TerritoryHeatmapItem {
  state: string
  cities: string[]
  arr: number
  activeSchools: number
  growth: string
}

export const analyticsApi = {
  // Get executive growth KPIs
  getExecutive: async () => {
    const res = await axios.get(`${API_BASE}/analytics/executive`)
    return res.data.data as ExecutiveMetrics
  },

  // Get territory heatmap
  getTerritoryHeatmap: async () => {
    const res = await axios.get(`${API_BASE}/analytics/territory-heatmap`)
    return res.data.data as TerritoryHeatmapItem[]
  },

  // Gemini Executive Briefing Generator
  generateExecutiveSummary: async () => {
    const res = await axios.post(`${API_BASE}/analytics/executive-summary`)
    return res.data.data
  },
}
