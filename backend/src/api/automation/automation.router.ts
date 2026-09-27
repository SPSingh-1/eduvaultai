import { Router } from 'express'

const router = Router()

// In-memory workflow automation store (Blank initial state - No dummy data)
let workflowsStore: any[] = []

// GET /api/v1/automation/workflows — List workflows
router.get('/workflows', (req, res) => {
  res.json({ success: true, data: workflowsStore })
})

// POST /api/v1/automation/workflows — Create workflow
router.post('/workflows', (req, res) => {
  const { name, trigger, conditions, actions } = req.body
  const newWf = {
    id: `wf_${Date.now()}`,
    name,
    status: 'active',
    trigger: trigger || 'New Lead Created',
    conditions: conditions || [],
    actions: actions || ['Send Outreach Email'],
    totalRuns: 0,
    lastRunAt: new Date().toISOString(),
  }
  workflowsStore.unshift(newWf)
  res.status(201).json({ success: true, data: newWf })
})

// POST /api/v1/automation/workflows/:id/trigger — Test run workflow
router.post('/workflows/:id/trigger', (req, res) => {
  const wf = workflowsStore.find((w) => w.id === req.params.id)
  if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' })

  wf.totalRuns += 1
  wf.lastRunAt = new Date().toISOString()
  res.json({ success: true, message: `Workflow "${wf.name}" triggered successfully!`, data: wf })
})

export default router
