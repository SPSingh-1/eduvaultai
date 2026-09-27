import { Router } from 'express'

const router = Router()

// Settings store
let settingsStore = {
  orgName: 'EduVault India',
  plan: '100% Free Stack Tier',
  timezone: 'Asia/Kolkata (IST)',
  language: 'English (India)',
  autoAiScoringEnabled: true,
  autoEmailOutreachEnabled: true,
}

let apiKeysStore = [
  { provider: 'Google AI Studio (Gemini 1.5 Flash)', envVar: 'GOOGLE_AI_API_KEY', status: 'connected', freeQuota: '1,000,000 Tokens/day FREE' },
  { provider: 'Groq Cloud (Llama 3.3 70B)', envVar: 'GROQ_API_KEY', status: 'connected', freeQuota: '500 Requests/day FREE' },
  { provider: 'Supabase PostgreSQL & Storage', envVar: 'SUPABASE_URL', status: 'connected', freeQuota: '500MB DB + 1GB Storage FREE' },
  { provider: 'Upstash Redis Cache', envVar: 'UPSTASH_REDIS_REST_URL', status: 'connected', freeQuota: '10,000 Commands/day FREE' },
  { provider: 'Brevo Transactional Email', envVar: 'BREVO_API_KEY', status: 'connected', freeQuota: '300 Emails/day FREE' },
  { provider: 'Serper.dev Web Search', envVar: 'SERPER_API_KEY', status: 'connected', freeQuota: '2,500 Searches FREE' },
  { provider: 'OpenStreetMap Overpass API', envVar: 'OVERPASS_API', status: 'connected', freeQuota: '100% Unlimited FREE (No Key Needed)' },
  { provider: 'Sentry Error Tracking', envVar: 'SENTRY_DSN', status: 'connected', freeQuota: '5,000 Errors/month FREE' },
]

let teamStore = [
  { id: 'usr_01', name: 'Shashi Sales Architect', email: 'architect@eduvault.ai', role: 'Owner / Lead Architect', status: 'active' },
]

let integrationsStore = [
  { name: 'Supabase PostgreSQL', category: 'Database', status: 'healthy', latencyMs: 38 },
  { name: 'Upstash Redis', category: 'Cache / Queue', status: 'healthy', latencyMs: 24 },
  { name: 'Google Gemini AI', category: 'LLM Engine', status: 'healthy', latencyMs: 320 },
  { name: 'Brevo Email API', category: 'Email Delivery', status: 'healthy', latencyMs: 140 },
  { name: 'OpenStreetMap Overpass', category: 'School Discovery', status: 'healthy', latencyMs: 410 },
  { name: 'Render Cloud Host', category: 'Hosting Platform', status: 'healthy', latencyMs: 15 },
]

// GET /api/v1/settings
router.get('/', (req, res) => {
  res.json({ success: true, data: settingsStore })
})

// GET /api/v1/settings/keys
router.get('/keys', (req, res) => {
  res.json({ success: true, data: apiKeysStore })
})

// GET /api/v1/settings/team
router.get('/team', (req, res) => {
  res.json({ success: true, data: teamStore })
})

// POST /api/v1/settings/team/invite — Invite team member
router.post('/team/invite', (req, res) => {
  const { name, email, role } = req.body
  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    role: role || 'Sales Representative',
    status: 'active',
  }
  teamStore.push(newUser)
  res.status(201).json({ success: true, data: newUser })
})

// GET /api/v1/settings/integrations
router.get('/integrations', (req, res) => {
  res.json({ success: true, data: integrationsStore })
})

export default router
