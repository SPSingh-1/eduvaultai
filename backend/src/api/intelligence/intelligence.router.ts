import { Router } from 'express'
import { GeminiService } from '../../ai/gemini.service'

const router = Router()

// In-memory competitor battlecards catalog (Blank initial state - No dummy data)
let battlecardsStore: any[] = []
let marketAlertsStore: any[] = []

// GET /api/v1/intelligence/competitors — List competitor battlecards
router.get('/competitors', (req, res) => {
  res.json({ success: true, data: battlecardsStore })
})

// GET /api/v1/intelligence/market-radar — Get market radar alerts
router.get('/market-radar', (req, res) => {
  res.json({ success: true, data: marketAlertsStore })
})

// POST /api/v1/intelligence/battlecard-generator — Gemini 1.5 Flash Battlecard Generator
router.post('/battlecard-generator', async (req, res) => {
  try {
    const { competitorName = 'SkoolBeep' } = req.body

    const prompt = `You are the Competitor Intelligence Agent for EduVault AI.
Competitor: ${competitorName} (School Management Software)

Generate a competitive battlecard in strict JSON format:
{
  "name": "${competitorName}",
  "category": "Software category",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "winningPitch": "How EduVault AI wins against ${competitorName}",
  "keyObjectionHandler": "How to answer 'Why choose EduVault AI over ${competitorName}?'"
}`

    const responseText = await GeminiService.generateIntelligence(prompt)
    let parsed: any
    try {
      parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim())
    } catch {
      parsed = {
        name: competitorName,
        category: 'School SaaS ERP',
        strengths: ['Basic communication app', 'Low pricing'],
        weaknesses: ['Lacks AI sales automation', 'No WhatsApp fee gateway integration'],
        winningPitch: `Demonstrate EduVault AI 17 autonomous agents and automated WhatsApp fee collection.`,
        keyObjectionHandler: `EduVault AI replaces manual follow-ups with AI agents, saving administrators 15 hours per week.`,
      }
    }

    // Save generated battlecard to store
    battlecardsStore.unshift({
      id: `comp_${Date.now()}`,
      name: parsed.name || competitorName,
      category: parsed.category || 'SaaS ERP',
      marketShare: 'Analyzed via AI',
      pricing: 'Custom SaaS',
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      winningPitch: parsed.winningPitch,
      objectionHandlers: [{ objection: 'Competitor comparison', counter: parsed.keyObjectionHandler }],
    })

    res.json({ success: true, data: parsed })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// POST /api/v1/intelligence/sales-coach — Gemini 1.5 Flash Sales Coach
router.post('/sales-coach', async (req, res) => {
  try {
    const { repQuestion = 'How do I handle price objections from private school trustees?' } = req.body

    const prompt = `You are the AI Sales Coach for EduVault AI sales reps.
Answer the rep's question on sales execution:
"${repQuestion}"

Provide response in strict JSON:
{
  "coachingAdvice": "Actionable sales coaching framework",
  "keyTakeaway": "1 sentence core rule for sales call"
}`

    const responseText = await GeminiService.generateIntelligence(prompt)
    let parsed: any
    try {
      parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim())
    } catch {
      parsed = {
        coachingAdvice: 'Focus on ROI rather than software cost. Show the trustee how EduVault AI WhatsApp Fee Gateway reduces uncollected school fees by 35% in the first quarter, covering the full cost of the software.',
        keyTakeaway: 'Always reframe price objections around uncollected fee recovery and administrative hours saved.',
      }
    }

    res.json({ success: true, data: parsed })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

export default router
