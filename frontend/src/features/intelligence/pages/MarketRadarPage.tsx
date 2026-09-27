import { useState, useEffect } from 'react'
import { intelligenceApi, MarketAlert } from '@/features/intelligence/services/intelligence.api'

export function MarketRadarPage() {
  const [alerts, setAlerts] = useState<MarketAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [coachQuestion, setCoachQuestion] = useState('')
  const [coachAnswer, setCoachAnswer] = useState<any>(null)
  const [askingCoach, setAskingCoach] = useState(false)

  const fetchRadar = async () => {
    setLoading(true)
    try {
      const data = await intelligenceApi.getMarketRadar()
      setAlerts(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRadar()
  }, [])

  const handleAskCoach = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coachQuestion.trim()) return
    setAskingCoach(true)
    try {
      const res = await intelligenceApi.askSalesCoach(coachQuestion)
      setCoachAnswer(res)
    } catch (e) {
      console.error(e)
    } finally {
      setAskingCoach(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">sensors</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              Market Intelligence Radar
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">Market Radar & AI Sales Coach</h1>
          <p className="text-body-sm text-on-surface-variant">
            Live tender alerts, competitor news, and on-demand AI sales coaching for your reps.
          </p>
        </div>
      </div>

      {/* Grid: Market Radar Alerts + AI Sales Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols — Market Alerts */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-secondary text-xl">radar</span>
            <span>Market Radar Alerts</span>
          </h2>

          <div className="space-y-3">
            {loading ? (
              <div className="glass-panel p-8 text-center text-on-surface-variant rounded-2xl">
                <span className="icon text-2xl animate-spin text-primary block mb-2">sync</span>
                Scanning market radar...
              </div>
            ) : alerts.length === 0 ? (
              <div className="glass-panel p-10 text-center rounded-2xl text-on-surface-variant space-y-2">
                <span className="icon text-3xl text-secondary block">sensors_off</span>
                <div className="text-body-md font-bold text-on-surface">No Market Tender Alerts Logged</div>
                <p className="text-body-sm">
                  Radar is active. Incoming school RFPs & competitor price updates will appear here.
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="status-badge primary text-xs uppercase">{alert.type.replace('_', ' ')}</span>
                    <span className="text-label-md font-mono text-secondary font-bold">{alert.impact} IMPACT</span>
                  </div>
                  <h3 className="text-body-md font-bold text-on-surface">{alert.title}</h3>
                  <p className="text-body-sm text-on-surface-variant">{alert.description}</p>
                  <div className="text-label-md font-mono text-on-surface-variant/60 pt-1">{alert.date}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 6 Cols — AI Sales Coach */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-tertiary text-xl">psychology</span>
            <span>AI Sales Coach (Google Gemini 1.5 Flash)</span>
          </h2>

          <form onSubmit={handleAskCoach} className="glass-panel p-6 rounded-2xl border border-tertiary/30 space-y-4">
            <div>
              <label className="text-label-md font-medium text-on-surface-variant block mb-1">Ask AI Sales Coach</label>
              <textarea
                rows={3}
                required
                value={coachQuestion}
                onChange={(e) => setCoachQuestion(e.target.value)}
                placeholder="e.g. How do I handle price objections from private school trustees?"
                className="glass-input w-full h-auto p-3 text-body-sm resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={askingCoach}
              className="btn-ai w-full py-2.5 font-semibold text-body-sm flex items-center justify-center gap-2"
            >
              <span className={`icon text-lg ${askingCoach ? 'animate-spin' : ''}`}>auto_awesome</span>
              <span>{askingCoach ? 'Coaching...' : 'Get AI Sales Coaching'}</span>
            </button>
          </form>

          {coachAnswer && (
            <div className="glass-panel p-5 rounded-2xl border border-tertiary/30 space-y-3 animate-fade-in">
              <div className="text-label-sm font-semibold uppercase text-tertiary">Coaching Strategy</div>
              <p className="text-body-sm text-on-surface leading-relaxed">{coachAnswer.coachingAdvice}</p>

              <div className="p-3 rounded-xl bg-secondary-container/10 border border-secondary/20">
                <div className="text-label-sm font-semibold uppercase text-secondary mb-0.5">Key Takeaway</div>
                <div className="text-body-sm font-medium text-on-surface">{coachAnswer.keyTakeaway}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
