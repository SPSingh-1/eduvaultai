import { Router } from 'express'
import { GeminiService } from '../../ai/gemini.service'

const router = Router()

// In-memory customers store (Blank initial state - No dummy data)
let customersStore: any[] = []

// GET /api/v1/customers — List customers
router.get('/', (req, res) => {
  res.json({ success: true, data: customersStore })
})

// GET /api/v1/customers/at-risk — List at-risk accounts
router.get('/at-risk', (req, res) => {
  const atRisk = customersStore.filter((c) => c.status === 'at_risk' || c.healthScore < 70)
  res.json({ success: true, data: atRisk })
})

// GET /api/v1/customers/:id — Customer 360° detail
router.get('/:id', (req, res) => {
  const cust = customersStore.find((c) => c.id === req.params.id)
  if (!cust) return res.status(404).json({ success: false, error: 'Customer account not found' })
  res.json({ success: true, data: cust })
})

// POST /api/v1/customers — Add new customer account
router.post('/', (req, res) => {
  const { schoolName, primaryContact, accountManager, mrr } = req.body
  const newCust = {
    id: `cust_${Date.now()}`,
    schoolName,
    primaryContact: primaryContact || 'Principal',
    accountManager: accountManager || 'CSM Team',
    status: 'active',
    healthScore: 85,
    npsScore: 8,
    mrr: mrr ? parseInt(mrr) : 40000,
    contractRenewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString().split('T')[0],
    onboardingStatus: 'completed',
    activeModules: ['School ERP', 'WhatsApp Fees'],
    healthBreakdown: {
      userLoginFrequency: 'Normal (75%)',
      feeReconciliationRate: '90%',
      supportTickets: '0 Open',
    },
  }
  customersStore.unshift(newCust)
  res.status(201).json({ success: true, data: newCust })
})

// POST /api/v1/customers/:id/health/refresh — Gemini 1.5 Flash Health & Churn Predictor
router.post('/:id/health/refresh', async (req, res) => {
  try {
    const cust = customersStore.find((c) => c.id === req.params.id)
    if (!cust) return res.status(404).json({ success: false, error: 'Customer account not found' })

    const prompt = `You are the Churn Risk Predictor & Customer Health Agent for EduVault AI.
School: ${cust.schoolName}
Current Health Score: ${cust.healthScore}/100
Usage Metrics: ${JSON.stringify(cust.healthBreakdown)}

Calculate updated health score and churn risk analysis in strict JSON format:
{
  "updatedHealthScore": number (0-100),
  "churnRiskLevel": "LOW" | "MEDIUM" | "HIGH",
  "keyRiskFactor": "Brief description of risk factor",
  "csRecommendedAction": "Actionable customer success playbook step"
}`

    const responseText = await GeminiService.generateIntelligence(prompt)
    let parsed: any
    try {
      parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim())
    } catch {
      parsed = {
        updatedHealthScore: cust.healthScore,
        churnRiskLevel: cust.healthScore < 70 ? 'HIGH' : 'LOW',
        keyRiskFactor: cust.healthScore < 70 ? 'Low daily teacher login frequency and pending support tickets.' : 'Healthy daily usage.',
        csRecommendedAction: 'Schedule a 1-on-1 CSM review session to re-train administrative staff on fee reconciliation.',
      }
    }

    cust.healthScore = parsed.updatedHealthScore || cust.healthScore
    if (cust.healthScore < 70) cust.status = 'at_risk'

    res.json({ success: true, data: cust, aiAnalysis: parsed })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

// POST /api/v1/customers/support-copilot — Gemini 1.5 Flash Support Copilot
router.post('/support-copilot', async (req, res) => {
  try {
    const { question } = req.body
    if (!question) return res.status(400).json({ success: false, error: 'Question is required' })

    const prompt = `You are the AI Support Copilot for EduVault AI (School Management Software).
Answer the customer's support question concisely & accurately:
"${question}"

Provide response in strict JSON:
{
  "answer": "Clear step-by-step resolution",
  "relevantArticle": "Help Center Article Title"
}`

    const responseText = await GeminiService.generateIntelligence(prompt)
    let parsed: any
    try {
      parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim())
    } catch {
      parsed = {
        answer: 'To configure automated WhatsApp fee reminders, go to Settings → Communication Hub → WhatsApp Templates and toggle "Auto-Send Monthly Invoice".',
        relevantArticle: 'Configuring WhatsApp Automated Fee Reminders',
      }
    }

    res.json({ success: true, data: parsed })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error).message })
  }
})

export default router
