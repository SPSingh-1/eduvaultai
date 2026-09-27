import { useState, useEffect } from 'react'
import { analyticsApi, ExecutiveMetrics, TerritoryHeatmapItem } from '@/features/analytics/services/analytics.api'

export function AnalyticsPage() {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null)
  const [heatmap, setHeatmap] = useState<TerritoryHeatmapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [executiveSummary, setExecutiveSummary] = useState<any>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [mData, hData] = await Promise.all([
        analyticsApi.getExecutive(),
        analyticsApi.getTerritoryHeatmap(),
      ])
      setMetrics(mData)
      setHeatmap(hData || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleGenerateSummary = async () => {
    setGenerating(true)
    try {
      const data = await analyticsApi.generateExecutiveSummary()
      setExecutiveSummary(data)
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  if (loading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <span className="icon text-3xl animate-spin text-primary">sync</span>
        <span className="text-body-sm text-on-surface-variant">Loading Executive Growth Analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">analytics</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              Revenue Intelligence & Forecasting
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">Executive Growth Analytics</h1>
          <p className="text-body-sm text-on-surface-variant">
            Full visibility into ARR pipeline, territory revenue heatmaps, and AI-driven growth forecasting.
          </p>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={generating}
          className="btn-ai py-2.5 px-4 text-body-sm flex items-center gap-2"
        >
          <span className={`icon text-lg ${generating ? 'animate-spin' : ''}`}>auto_awesome</span>
          <span>{generating ? 'Generating Briefing...' : 'Generate Executive AI Briefing'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card ambient-card-blue">
          <span className="grid-header">Total Pipeline ARR</span>
          <div className="text-kpi-xl text-on-surface font-mono font-bold my-1">
            ₹{(metrics.totalPipelineARR / 10000000).toFixed(2)}Cr
          </div>
          <span className="text-label-md text-secondary font-mono">Live System Tracking</span>
        </div>

        <div className="kpi-card ambient-card-emerald">
          <span className="grid-header">Closed Won ARR</span>
          <div className="text-kpi-xl text-secondary font-mono font-bold my-1">
            ₹{(metrics.closedWonARR / 100000).toFixed(1)}L
          </div>
          <span className="text-label-md text-secondary font-mono">Contracted Revenue</span>
        </div>

        <div className="kpi-card ambient-card-purple">
          <span className="grid-header">Pipeline Win Rate</span>
          <div className="text-kpi-xl text-tertiary font-mono font-bold my-1">
            {metrics.winRate}
          </div>
          <span className="text-label-md text-tertiary font-mono">Avg Cycle: {metrics.salesCycleDays} Days</span>
        </div>

        <div className="kpi-card">
          <span className="grid-header">CAC Savings with AI</span>
          <div className="text-kpi-xl text-warning font-mono font-bold my-1">
            {metrics.cacSavingsWithAI}
          </div>
          <span className="text-label-md text-warning font-mono">vs Traditional Sourcing</span>
        </div>
      </div>

      {/* Territory Revenue Heatmap */}
      <div className="space-y-4">
        <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
          <span className="icon text-primary text-xl">map</span>
          <span>Territory Revenue Heatmap (State Breakdown)</span>
        </h2>

        {heatmap.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl text-on-surface-variant space-y-2">
            <span className="icon text-3xl text-primary block">map</span>
            <div className="text-body-md font-bold text-on-surface">No Territory Revenue Data Logged Yet</div>
            <p className="text-body-sm max-w-sm mx-auto">
              Territory revenue heatmaps will populate automatically as deals move through sales pipeline stages.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {heatmap.map((item, idx) => (
              <div key={idx} className="glass-card p-5 rounded-2xl border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="status-badge primary font-bold">{item.state}</span>
                  <span className="text-label-md font-mono text-secondary font-bold">{item.growth} Growth</span>
                </div>

                <div>
                  <div className="text-label-md uppercase text-on-surface-variant font-semibold">Territory ARR</div>
                  <div className="text-kpi-md text-on-surface font-mono font-bold">
                    ₹{(item.arr / 100000).toFixed(1)} Lakhs
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/20 flex justify-between text-label-md text-on-surface-variant font-mono">
                  <span>{item.activeSchools} Target Schools</span>
                  <span>{item.cities.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gemini AI Executive Briefing Output */}
      {executiveSummary && (
        <div className="glass-panel p-6 rounded-3xl border border-tertiary/30 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <h3 className="text-body-md font-bold text-on-surface flex items-center gap-2">
              <span className="icon text-tertiary text-xl">auto_awesome</span>
              <span>Google Gemini 1.5 Flash Executive Growth Briefing</span>
            </h3>
            <span className="text-label-md font-mono text-secondary font-bold">
              Forecast: {executiveSummary.q4RevenueForecast}
            </span>
          </div>

          <h2 className="text-headline-sm font-extrabold text-on-surface">{executiveSummary.growthHeadline}</h2>

          <div>
            <div className="text-label-sm font-semibold uppercase text-primary mb-1">Key Growth Drivers</div>
            <ul className="space-y-1 text-body-sm text-on-surface">
              {(executiveSummary.keyDrivers || []).map((driver: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="icon text-secondary text-sm">check_circle</span>
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-tertiary-container/10 border border-tertiary/20">
            <div className="text-label-sm font-semibold uppercase text-tertiary mb-1">Strategic Expansion Recommendation</div>
            <p className="text-body-sm text-on-surface font-medium">{executiveSummary.strategicRecommendation}</p>
          </div>
        </div>
      )}
    </div>
  )
}
