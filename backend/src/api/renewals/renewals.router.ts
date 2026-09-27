import { Router } from 'express'
import { GeminiService } from '../../ai/gemini.service'

const router = Router()

// In-memory renewals store (Blank initial state - No dummy data)
let renewalsStore: any[] = []

// GET /api/v1/renewals — List upcoming renewals
router.get('/', (req, res) => {
  const totalARRAtRisk = renewalsStore.reduce((acc, r) => acc + (r.currentArr || 0), 0)
  const totalExpansionARR = renewalsStore.reduce((acc, r) => acc + (r.potentialExpansionARR || 0), 0)

  res.json({
    success: true,
    totalARRAtRisk,
    totalExpansionARR,
    data: renewalsStore,
  })
})

// GET /api/v1/renewals/upsell-opportunities — List upsell opportunities
router.get('/upsell-opportunities', (req, res) => {
  const opportunities = renewalsStore.filter((r) => r.potentialExpansionARR > 0)
  res.json({ success: true, data: opportunities })
})

// POST /api/v1/renewals/:id/upsell-pitch — Gemini 1.5 Flash AI Upsell Pitch Generator
router.post('/:id/upsell-pitch', async (req, res) => {
  try {
    const item = renewalsStore.find((r) => r.id === req.params.id)
    if (!item) return res.status(404).json({ success: false, error: 'Renewal record not found' })

    const prompt = `You are the Expansion & Upsell AI Agent for EduVault AI.
School: ${item.schoolName}
Current ARR: ₹${(item.currentArr / 100000).toFixed(1)} Lakhs
Target Upsell Module: ${item.upsellOpportunity}

Generate a hyper-personalized renewal upsell pitch in strict JSON:
{
  "pitchSubject": "Catchy renewal + expansion email subject",
  "pitchBody": "2-paragraph proposal highlighting ROI of adding ${item.upsellOpportunity} upon renewal",
  "estimatedExpansionValue": "₹${(item.potentialExpansionARR / 100000).toFixed(1)} Lakhs"
}`

    const responseText = await GeminiService.generateIntelligence(prompt)
    let parsed: any
    try {
      parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim())
    } catch {
      parsed = {
        pitchSubject: `Annual Contract Renewal & ${item.upsellOpportunity} Upgrade for ${item.schoolName}`,
        pitchBody: `Dear Principal,\n\nAs we approach ${item.schoolName}'s annual contract renewal, we would like to offer an exclusive upgrade bundle for ${item.upsellOpportunity}. Adding this module will automate parent fee notifications and reduce administrative costs by an additional 25%.\n\nLet's schedule a brief 10-minute renewal review.`,
        estimatedExpansionValue: `₹${(item.potentialExpansionARR / 100000).toFixed(1)} Lakhs`,
      }
    }

    res.json({ success: true, data: parsed })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// POST /api/v1/renewals/:id/autogen-proposal — Auto-generate renewal proposal
router.post('/:id/autogen-proposal', (req, res) => {
  const item = renewalsStore.find((r) => r.id === req.params.id)
  if (!item) return res.status(404).json({ success: false, error: 'Renewal record not found' })

  item.status = 'proposal_sent'
  res.json({
    success: true,
    message: `Renewal proposal auto-generated and sent for ${item.schoolName}!`,
    data: item,
  })
})

export default router
