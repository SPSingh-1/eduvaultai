import { useState, useEffect } from 'react'
import { leadsApi, ICPConfig } from '@/features/leads/services/leads.api'

export function ICPBuilderPage() {
  const [icp, setIcp] = useState<ICPConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const fetchICP = async () => {
    setLoading(true)
    try {
      const data = await leadsApi.getICP()
      setIcp(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchICP()
  }, [])

  const handleSaveICP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!icp) return
    setSaving(true)
    try {
      const updated = await leadsApi.updateICP(icp)
      setIcp(updated)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !icp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <span className="icon text-3xl animate-spin text-primary">sync</span>
        <span className="text-body-sm text-on-surface-variant">Loading ICP Configuration...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">tune</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              AI Qualification Rules
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">Ideal Customer Profile (ICP) Builder</h1>
          <p className="text-body-sm text-on-surface-variant">
            Define target criteria used by Gemini 1.5 Flash AI to score discovered school leads.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-secondary/20 border border-secondary/30 text-secondary text-body-sm flex items-center gap-2 font-medium">
            <span className="icon text-lg">check_circle</span>
            <span>ICP Saved!</span>
          </div>
        )}
      </div>

      {/* ICP Configuration Form */}
      <form onSubmit={handleSaveICP} className="space-y-6">
        {/* Section 1: Target Boards */}
        <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-3">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-primary text-xl">school</span>
            <span>Target Board Affiliations</span>
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Select boards that match your software's curriculum and fee management modules.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {['CBSE', 'ICSE', 'International', 'State Board'].map((board) => {
              const isSelected = icp.targetBoards.includes(board)
              return (
                <button
                  type="button"
                  key={board}
                  onClick={() => {
                    const newBoards = isSelected
                      ? icp.targetBoards.filter((b) => b !== board)
                      : [...icp.targetBoards, board]
                    setIcp({ ...icp, targetBoards: newBoards })
                  }}
                  className={`p-3 rounded-xl border text-body-sm font-semibold transition-all text-center ${
                    isSelected
                      ? 'bg-primary-container/20 border-primary text-primary shadow-glow-primary'
                      : 'glass-card border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {board}
                </button>
              )
            })}
          </div>
        </div>

        {/* Section 2: Student Size Range */}
        <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-secondary text-xl">groups</span>
            <span>Target Student Size Range</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-md font-medium text-on-surface-variant block mb-1.5">
                Minimum Student Count: <span className="font-mono text-secondary font-bold">{icp.minStudentCount}</span>
              </label>
              <input
                type="number"
                value={icp.minStudentCount}
                onChange={(e) => setIcp({ ...icp, minStudentCount: parseInt(e.target.value) || 0 })}
                className="glass-input w-full"
              />
            </div>

            <div>
              <label className="text-label-md font-medium text-on-surface-variant block mb-1.5">
                Maximum Student Count: <span className="font-mono text-secondary font-bold">{icp.maxStudentCount}</span>
              </label>
              <input
                type="number"
                value={icp.maxStudentCount}
                onChange={(e) => setIcp({ ...icp, maxStudentCount: parseInt(e.target.value) || 0 })}
                className="glass-input w-full"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Target Regions */}
        <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-3">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-tertiary text-xl">map</span>
            <span>Priority Geographic Regions</span>
          </h2>

          <div className="flex flex-wrap gap-2 pt-2">
            {icp.targetRegions.map((region, idx) => (
              <span key={idx} className="status-badge purple text-body-sm py-1.5 px-3">
                {region}
              </span>
            ))}
          </div>
        </div>

        {/* Section 4: Auto Outreach Threshold */}
        <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-warning text-xl">bolt</span>
            <span>Autonomous Outreach Threshold</span>
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            Leads with AI score above this threshold will automatically trigger personalized email outreach sequences.
          </p>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={icp.minAutoOutreachScore}
              onChange={(e) => setIcp({ ...icp, minAutoOutreachScore: parseInt(e.target.value) })}
              className="accent-warning cursor-pointer flex-1"
            />
            <span className="font-mono text-headline-sm text-warning font-bold w-16 text-right">
              {icp.minAutoOutreachScore}+
            </span>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary py-3 px-8 text-body-md font-semibold flex items-center gap-2">
            <span className={`icon text-lg ${saving ? 'animate-spin' : ''}`}>save</span>
            <span>{saving ? 'Saving Rules...' : 'Save & Update AI Qualification Engine'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
