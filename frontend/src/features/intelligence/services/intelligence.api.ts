import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export interface Competitor {
  id: string
  name: string
  category: string
  marketShare: string
  pricing: string
  strengths: string[]
  weaknesses: string[]
  winningPitch: string
  objectionHandlers?: { objection: string; counter: string }[]
}

export interface MarketAlert {
  id: string
  type: string
  title: string
  description: string
  date: string
  impact: string
}

export const intelligenceApi = {
  // Get competitor battlecards
  getCompetitors: async () => {
    const res = await axios.get(`${API_BASE}/intelligence/competitors`)
    return res.data.data as Competitor[]
  },

  // Get market radar alerts
  getMarketRadar: async () => {
    const res = await axios.get(`${API_BASE}/intelligence/market-radar`)
    return res.data.data as MarketAlert[]
  },

  // Gemini AI Battlecard Generator
  generateBattlecard: async (competitorName: string) => {
    const res = await axios.post(`${API_BASE}/intelligence/battlecard-generator`, { competitorName })
    return res.data.data
  },

  // Gemini AI Sales Coach
  askSalesCoach: async (repQuestion: string) => {
    const res = await axios.post(`${API_BASE}/intelligence/sales-coach`, { repQuestion })
    return res.data.data
  },
}
