import { Router } from 'express'
import { GeminiService } from '../../ai/gemini.service'

const router = Router()

// In-memory campaign store (Blank initial state - No dummy data)
let campaignsStore: any[] = []

// GET /api/v1/campaigns — List campaigns
router.get('/', (req, res) => {
  res.json({ success: true, data: campaignsStore })
})

// POST /api/v1/campaigns — Create campaign
router.post('/', (req, res) => {
  const { name, type, goal, targetSegment } = req.body
  const newCmp = {
    id: `cmp_${Date.now()}`,
    name,
    type: type || 'email',
    status: 'draft',
    goal: goal || 'Lead Qualification',
    targetSegment: targetSegment || 'K-12 Target Schools',
    totalEnrolled: 0,
    emailsSent: 0,
    openRate: '0%',
    replyRate: '0%',
    createdAt: new Date().toISOString(),
  }
  campaignsStore.unshift(newCmp)
  res.status(201).json({ success: true, data: newCmp })
})

// POST /api/v1/campaigns/:id/start — Start campaign
router.post('/:id/start', (req, res) => {
  const cmp = campaignsStore.find((c) => c.id === req.params.id)
  if (!cmp) return res.status(404).json({ success: false, error: 'Campaign not found' })

  cmp.status = 'active'
  res.json({ success: true, data: cmp })
})

// POST /api/v1/campaigns/strategy-generator — Gemini 1.5 Flash Campaign Strategy Generator
router.post('/strategy-generator', async (req, res) => {
  try {
    const { targetSegment = 'CBSE Schools in Maharashtra', goal = 'Book 30 ERP Demos' } = req.body

    const prompt = `You are the AI Campaign Strategy Generator for EduVault AI.
Target Segment: ${targetSegment}
Campaign Goal: ${goal}

Generate a multi-touch outreach blueprint in strict JSON format:
{
  "campaignTitle": "Catchy Campaign Name",
  "recommendedSequence": [
    { "step": 1, "channel": "Email", "delayDays": 0, "subject": "Sample email subject", "angle": "Focus on Fee Collection pain" },
    { "step": 2, "channel": "WhatsApp", "delayDays": 3, "angle": "Short video preview link" },
    { "step": 3, "channel": "Email", "delayDays": 7, "subject": "Case Study: How DPS Pune saved 15h/week", "angle": "Social proof & ROI" }
  ],
  "estimatedOpenRate": "45%",
  "estimatedReplyRate": "14%"
}`

    const responseText = await GeminiService.generateIntelligence(prompt)
    let parsed: any
    try {
      parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim())
    } catch {
      parsed = {
        campaignTitle: `Automated Fee Blitz — ${targetSegment}`,
        recommendedSequence: [
          { step: 1, channel: 'Email', delayDays: 0, subject: 'Automating Fee Collection & Attendance', angle: 'Pain point focus' },
          { step: 2, channel: 'WhatsApp', delayDays: 3, angle: '2-min video demo link' },
          { step: 3, channel: 'Email', delayDays: 7, subject: 'Case Study: 40% Admin Time Saved', angle: 'Social proof' },
        ],
        estimatedOpenRate: '46%',
        estimatedReplyRate: '15%',
      }
    }

    res.json({ success: true, data: parsed })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

export default router
