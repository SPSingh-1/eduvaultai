import { Router } from 'express'

const router = Router()

// Default in-memory / org ICP parameters
let currentICP = {
  targetBoards: ['CBSE', 'ICSE', 'International'],
  minStudentCount: 800,
  maxStudentCount: 5000,
  targetRegions: ['Maharashtra', 'Karnataka', 'Delhi NCR', 'Telangana'],
  minAutoOutreachScore: 80,
  keyDecisionMakerTitles: ['Principal', 'Vice Principal', 'Trustee', 'IT Director'],
  updatedAt: new Date().toISOString(),
}

// GET /api/v1/icp — Get ICP settings
router.get('/', (req, res) => {
  res.json({ success: true, data: currentICP })
})

// POST /api/v1/icp — Save/update ICP settings
router.post('/', (req, res) => {
  const { targetBoards, minStudentCount, maxStudentCount, targetRegions, minAutoOutreachScore, keyDecisionMakerTitles } = req.body

  currentICP = {
    ...currentICP,
    targetBoards: targetBoards || currentICP.targetBoards,
    minStudentCount: minStudentCount ? parseInt(minStudentCount) : currentICP.minStudentCount,
    maxStudentCount: maxStudentCount ? parseInt(maxStudentCount) : currentICP.maxStudentCount,
    targetRegions: targetRegions || currentICP.targetRegions,
    minAutoOutreachScore: minAutoOutreachScore ? parseInt(minAutoOutreachScore) : currentICP.minAutoOutreachScore,
    keyDecisionMakerTitles: keyDecisionMakerTitles || currentICP.keyDecisionMakerTitles,
    updatedAt: new Date().toISOString(),
  }

  res.json({ success: true, data: currentICP })
})

export default router
