import { useState, useEffect } from 'react'
import { campaignsApi, Campaign } from '@/features/campaigns/services/campaigns.api'

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [aiBlueprint, setAiBlueprint] = useState<any>(null)
  const [segment, setSegment] = useState('CBSE & Private Schools in Rajasthan (>500 students)')
  const [goal, setGoal] = useState('Book 30 Fee Automation Demos & 2-Month Free Trials')

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const data = await campaignsApi.list()
      setCampaigns(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleGenerateBlueprint = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const targetSeg = segment.trim() || 'CBSE & Private Schools in Rajasthan (>500 students)'
    const targetGoal = goal.trim() || 'Book 30 Fee Automation Demos & 2-Month Free Trials'

    setGenerating(true)
    try {
      const data = await campaignsApi.generateStrategy({ targetSegment: targetSeg, goal: targetGoal })
      setAiBlueprint(data)
    } catch (e) {
      console.error('Error generating strategy:', e)
    } finally {
      setGenerating(false)
    }
  }

  const handleLaunchCampaign = async (id: string) => {
    try {
      await campaignsApi.start(id)
      fetchCampaigns()
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateAndLaunchBlueprint = async () => {
    if (!aiBlueprint) return
    setLaunching(true)
    try {
      const created = await campaignsApi.create({
        name: aiBlueprint.campaignTitle || `Automated Blitz — ${segment || 'K-12 Target Schools'}`,
        targetSegment: segment || 'K-12 Schools',
        goal: goal || 'Book 30 Demos',
        type: 'multi-channel',
      })
      if (created?.id) {
        await campaignsApi.start(created.id)
      }
      fetchCampaigns()
      setAiBlueprint(null)
    } catch (e) {
      console.error(e)
    } finally {
      setLaunching(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">campaign</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              Multi-Channel Outreach
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">Campaign Command Center</h1>
          <p className="text-body-sm text-on-surface-variant">
            Orchestrate multi-touch email & WhatsApp sequences with AI strategy generation.
          </p>
        </div>

        <button
          onClick={() => {
            const el = document.getElementById('generator')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
            handleGenerateBlueprint()
          }}
          disabled={generating}
          className="btn-ai py-2.5 px-4 text-body-sm flex items-center gap-2 shadow-lg"
        >
          <span className={`icon text-lg ${generating ? 'animate-spin' : ''}`}>
            {generating ? 'autorenew' : 'auto_awesome'}
          </span>
          <span>{generating ? 'Generating AI Strategy...' : 'Generate AI Campaign Strategy'}</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-secondary text-xl">send</span>
            <span>Active Outreach Campaigns ({campaigns.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="glass-panel p-8 text-center text-on-surface-variant rounded-2xl">
            <span className="icon text-2xl animate-spin text-primary block mb-2">sync</span>
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="glass-panel p-10 text-center rounded-2xl text-on-surface-variant space-y-3">
            <span className="icon text-4xl text-primary block">campaign</span>
            <div className="text-body-md font-bold text-on-surface">No Campaigns Created Yet</div>
            <p className="text-body-sm max-w-md mx-auto">
              Use the AI Strategy Generator below to build a multi-touch outreach campaign sequence.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((cmp) => (
              <div key={cmp.id} className="glass-card p-5 rounded-2xl border border-outline-variant/30 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="status-badge primary text-xs uppercase">{cmp.type}</span>
                    <span className={`status-badge ${cmp.status === 'active' ? 'active' : 'pending'}`}>
                      {cmp.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-body-md font-bold text-on-surface mb-1">{cmp.name}</h3>
                  <div className="text-body-sm text-on-surface-variant mb-2">{cmp.goal}</div>
                  <div className="text-label-md font-mono text-tertiary bg-tertiary-container/10 p-2 rounded-lg border border-tertiary/20">
                    Segment: {cmp.targetSegment}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-outline-variant/20 text-center font-mono">
                  <div>
                    <div className="text-label-md text-on-surface-variant">Enrolled</div>
                    <div className="text-body-md font-bold text-on-surface">{cmp.totalEnrolled}</div>
                  </div>
                  <div>
                    <div className="text-label-md text-on-surface-variant">Open %</div>
                    <div className="text-body-md font-bold text-secondary">{cmp.openRate}</div>
                  </div>
                  <div>
                    <div className="text-label-md text-on-surface-variant">Reply %</div>
                    <div className="text-body-md font-bold text-primary">{cmp.replyRate}</div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  {cmp.status === 'draft' ? (
                    <button
                      onClick={() => handleLaunchCampaign(cmp.id)}
                      className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-1"
                    >
                      <span className="icon text-sm">rocket_launch</span>
                      <span>Launch Campaign</span>
                    </button>
                  ) : (
                    <span className="text-label-md text-secondary font-mono flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span> Campaign Running
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gemini AI Strategy Generator Box */}
      <div id="generator" className="glass-panel p-6 rounded-3xl border border-tertiary/30 space-y-4">
        <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
          <span className="icon text-tertiary text-xl">auto_awesome</span>
          <span>AI Campaign Strategy Generator (Google Gemini 1.5 Flash)</span>
        </h2>

        <form onSubmit={handleGenerateBlueprint} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label className="text-label-md font-medium text-on-surface-variant block mb-1">Target School Segment</label>
              <input
                type="text"
                required
                placeholder="e.g. CBSE Schools in Maharashtra (>1,000 students)"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="glass-input w-full"
              />
            </div>

            <div className="md:col-span-5">
              <label className="text-label-md font-medium text-on-surface-variant block mb-1">Campaign Revenue Goal</label>
              <input
                type="text"
                required
                placeholder="e.g. Book 30 Fee Automation Demos"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="glass-input w-full"
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={generating}
                className="btn-ai w-full py-3 text-body-sm font-semibold flex items-center justify-center gap-1.5 shadow-lg"
              >
                <span className={`icon text-base ${generating ? 'animate-spin' : ''}`}>
                  {generating ? 'autorenew' : 'psychology'}
                </span>
                <span>{generating ? 'Generating...' : 'Generate'}</span>
              </button>
            </div>
          </div>

          {/* Quick Segment Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-on-surface-variant font-medium">Quick Presets:</span>
            {[
              { seg: 'CBSE & Private Schools in Rajasthan (500+ students)', g: 'Book 30 Fee Automation Demos' },
              { seg: 'Private K-12 Schools in Maharashtra', g: '2-Month Free Trial Onboarding Blitz' },
              { seg: 'Convent & ICSE Schools in Delhi NCR', g: 'Closed Won 10 Annual ERP Contracts' },
            ].map((preset, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => {
                  setSegment(preset.seg)
                  setGoal(preset.g)
                }}
                className="text-xs py-1 px-2.5 rounded-lg bg-surface-variant/40 hover:bg-surface-variant/70 text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-all"
              >
                {preset.seg.split(' ')[0]} {preset.seg.split(' ')[1]}
              </button>
            ))}
          </div>
        </form>

        {aiBlueprint && (
          <div className="p-5 rounded-2xl bg-tertiary-container/10 border border-tertiary/30 space-y-4 pt-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-tertiary font-bold">Generated AI Strategy Blueprint</span>
                <h3 className="text-body-md font-bold text-on-surface">{aiBlueprint.campaignTitle}</h3>
              </div>
              <div className="flex items-center gap-3 text-label-md font-mono">
                <span className="text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">Est. Open: {aiBlueprint.estimatedOpenRate || '48%'}</span>
                <span className="text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-md">Est. Reply: {aiBlueprint.estimatedReplyRate || '16%'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-label-sm font-semibold uppercase text-on-surface-variant">Recommended Multi-Touch Sequence</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(aiBlueprint.recommendedSequence || []).map((step: any, idx: number) => (
                  <div key={idx} className="glass-card p-3 rounded-xl border border-outline-variant/30 text-body-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="status-badge primary text-xs">Step {step.step}: {step.channel}</span>
                      <span className="text-label-md font-mono text-on-surface-variant">Day {step.delayDays}</span>
                    </div>
                    {step.subject && <div className="font-semibold text-on-surface text-xs mb-1">Subject: {step.subject}</div>}
                    <div className="text-label-md text-on-surface-variant">Angle: {step.angle}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-outline-variant/20">
              <button
                onClick={handleCreateAndLaunchBlueprint}
                disabled={launching}
                className="btn-primary py-2.5 px-5 text-body-sm font-semibold flex items-center gap-2 shadow-lg"
              >
                <span className={`icon text-base ${launching ? 'animate-spin' : ''}`}>
                  {launching ? 'autorenew' : 'rocket_launch'}
                </span>
                <span>{launching ? 'Launching Campaign...' : 'Enroll & Launch This Campaign Now'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
