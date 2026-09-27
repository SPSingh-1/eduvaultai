import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { aiApi, AIAgent, ControlTowerTelemetry } from '@/features/ai-workforce/services/ai.api'

import { schoolsApi } from '@/features/schools/services/schools.api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export function DashboardPage() {
  const navigate = useNavigate()
  const [hunterActive, setHunterActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [telemetry, setTelemetry] = useState<ControlTowerTelemetry | null>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [sendingAlertId, setSendingAlertId] = useState<string | null>(null)
  const [simulating, setSimulating] = useState(false)
  const [analytics, setAnalytics] = useState({
    discoveredSchools: 0,
    qualifiedLeads: 0,
    outreachEmailsSent: 0,
    pipelineRevenue: '₹0',
    activeAgents: 17,
    unreadAlerts: 0,
  })

  const loadAlerts = async () => {
    try {
      const res = await schoolsApi.getAlerts()
      if (res.data) setAlerts(res.data)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      try {
        const [dashRes, agentsData, telemetryData, alertsRes] = await Promise.all([
          axios.get(`${API_BASE}/analytics/dashboard`),
          aiApi.getAgents(),
          aiApi.getTelemetry(),
          schoolsApi.getAlerts().catch(() => ({ data: [] })),
        ])

        if (dashRes.data?.data) {
          setAnalytics(dashRes.data.data)
        }
        setAgents(agentsData || [])
        setTelemetry(telemetryData)
        if (alertsRes.data) setAlerts(alertsRes.data)
      } catch (e) {
        console.error('Error fetching dashboard analytics:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const handleToggleHunter = () => {
    const nextState = !hunterActive
    setHunterActive(nextState)
    if (nextState) {
      navigate('/discovery')
    }
  }

  const handleSendAlertReply = async (alertId: string) => {
    setSendingAlertId(alertId)
    try {
      await schoolsApi.sendAlertReply(alertId)
      await loadAlerts()
    } catch (err) {
      console.error('Failed to send reply:', err)
    } finally {
      setSendingAlertId(null)
    }
  }

  const handleMarkRead = async (alertId: string) => {
    try {
      await schoolsApi.markAlertRead(alertId)
      await loadAlerts()
    } catch (err) {
      console.error('Failed to mark read:', err)
    }
  }

  const handleSimulateReply = async (type: 'demo' | 'pricing' | 'query' | 'reject') => {
    setSimulating(true)
    try {
      await schoolsApi.simulateReply(type)
      await loadAlerts()
      // Refresh dashboard count
      const dashRes = await axios.get(`${API_BASE}/analytics/dashboard`)
      if (dashRes.data?.data) setAnalytics(dashRes.data.data)
    } catch (err) {
      console.error('Failed simulation:', err)
    } finally {
      setSimulating(false)
    }
  }

  const unreadAlerts = alerts.filter((a) => a.status === 'unread')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Command Center Hero */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl relative overflow-hidden border border-outline-variant/40">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/15 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="ai-dot"></span>
              <span className="text-label-md text-secondary font-semibold uppercase tracking-wider">
                Autonomous Revenue OS
              </span>
            </div>
            <h1 className="text-display-md font-bold text-on-surface tracking-tight mb-2">
              Executive Command Center
            </h1>
            <p className="text-body-sm text-on-surface-variant max-w-xl">
              17 AI agents stand ready to discover schools across India, enrich contact intelligence, and execute autonomous cold outreach.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleHunter}
              className={`px-5 py-3 rounded-xl font-semibold text-body-sm flex items-center gap-2.5 transition-all shadow-glow-primary ${
                hunterActive
                  ? 'bg-secondary text-on-secondary hover:bg-secondary/90'
                  : 'btn-ai'
              }`}
            >
              <span className="icon text-xl">{hunterActive ? 'pause_circle' : 'bolt'}</span>
              <span>{hunterActive ? 'Hunter Active — Pause' : 'Deploy AI Hunter'}</span>
            </button>

            <button
              onClick={() => navigate('/ai/control-tower')}
              className="btn-ghost flex items-center gap-2 text-body-sm"
            >
              <span className="icon text-xl">tune</span>
              <span>Agent Policy</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Inbound Client Reply Intelligence & Alerts Section */}
      <div className="glass-panel p-5 rounded-3xl border border-outline-variant/40 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary border border-secondary/30">
              <span className="icon text-lg">mark_chat_unread</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-title-md font-bold text-on-surface">
                  Client Response Intelligence & Alerts
                </h3>
                {unreadAlerts.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-secondary/20 text-secondary border border-secondary/40 animate-pulse">
                    {unreadAlerts.length} New
                  </span>
                )}
              </div>
              <p className="text-body-xs text-on-surface-variant">
                Hermes 3 AI automatically detects school replies, categorizes intent (Demo, Pricing, Query), and drafts instant contextual replies.
              </p>
            </div>
          </div>

          {/* Test Simulator Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-label-xs text-on-surface-variant font-medium mr-1">Simulate Reply:</span>
            <button
              onClick={() => handleSimulateReply('demo')}
              disabled={simulating}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
            >
              <span>🎯 Demo</span>
            </button>
            <button
              onClick={() => handleSimulateReply('pricing')}
              disabled={simulating}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all flex items-center gap-1"
            >
              <span>💰 Pricing</span>
            </button>
            <button
              onClick={() => handleSimulateReply('query')}
              disabled={simulating}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-all flex items-center gap-1"
            >
              <span>❓ Query</span>
            </button>
          </div>
        </div>

        {/* Live Alerts List */}
        {alerts.length === 0 ? (
          <div className="p-4 rounded-2xl bg-surface-container/30 border border-outline-variant/20 text-center text-body-sm text-on-surface-variant">
            No incoming school responses yet. Use the <b>Simulate Reply</b> buttons above to test live AI reply categorization & instant drafts!
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => {
              const isUnread = alert.status === 'unread'
              const isDemo = alert.category === 'demo_requested'
              const isPricing = alert.category === 'pricing_inquiry'

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUnread
                      ? 'bg-secondary/5 border-secondary/30 shadow-sm'
                      : 'bg-surface-container/20 border-outline-variant/20 opacity-80'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isDemo
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isPricing
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {alert.categoryLabel || '💬 School Reply'}
                      </span>
                      <span className="text-body-sm font-bold text-on-surface">
                        {alert.schoolName}
                      </span>
                      <span className="text-body-xs text-on-surface-variant">
                        • {alert.fromName || 'Principal'} ({alert.fromEmail})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <button
                          onClick={() => handleMarkRead(alert.id)}
                          className="text-xs text-on-surface-variant hover:text-on-surface px-2 py-1 rounded"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleSendAlertReply(alert.id)}
                        disabled={sendingAlertId === alert.id || alert.status === 'replied'}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          alert.status === 'replied'
                            ? 'bg-surface-variant text-on-surface-variant'
                            : 'bg-secondary text-on-secondary hover:bg-secondary/90'
                        }`}
                      >
                        <span className={`icon text-xs ${sendingAlertId === alert.id ? 'animate-spin' : ''}`}>
                          {alert.status === 'replied' ? 'done_all' : sendingAlertId === alert.id ? 'sync' : 'send'}
                        </span>
                        <span>{alert.status === 'replied' ? 'Reply Sent' : '⚡ Approve & Send AI Response'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Message Quote */}
                  <div className="p-2.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/20 mb-2">
                    <p className="text-body-xs text-on-surface italic">"{alert.fullMessage || alert.preview}"</p>
                  </div>

                  {/* AI Suggested Response Preview */}
                  {alert.aiDraftReply && (
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                      <div className="flex items-center gap-1.5 text-label-xs font-semibold text-primary">
                        <span className="icon text-xs">auto_awesome</span>
                        <span>AI Drafted Response (Ready to Dispatch via Brevo):</span>
                      </div>
                      <p className="text-body-xs text-on-surface-variant whitespace-pre-line leading-relaxed">
                        {alert.aiDraftReply}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>


      {/* KPI Cards Grid — Real Database Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Link to="/schools" className="kpi-card ambient-card-blue hover:border-primary/50 transition-all cursor-pointer">
          <div className="kpi-glow bg-primary"></div>
          <div className="flex justify-between items-start mb-3">
            <span className="grid-header">Target Schools</span>
            <span className="icon text-primary text-xl">school</span>
          </div>
          <div className="text-kpi-xl text-on-surface font-mono font-bold mb-1">
            {loading ? '...' : analytics.discoveredSchools.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-label-md text-secondary">
            <span className="icon text-sm">travel_explore</span>
            <span>{analytics.discoveredSchools > 0 ? `${analytics.discoveredSchools} in database` : '0 discovered yet'}</span>
          </div>
        </Link>

        {/* KPI 2 */}
        <Link to="/leads" className="kpi-card ambient-card-emerald hover:border-secondary/50 transition-all cursor-pointer">
          <div className="kpi-glow bg-secondary"></div>
          <div className="flex justify-between items-start mb-3">
            <span className="grid-header">Qualified Leads</span>
            <span className="icon text-secondary text-xl">psychology</span>
          </div>
          <div className="text-kpi-xl text-on-surface font-mono font-bold mb-1">
            {loading ? '...' : analytics.qualifiedLeads.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-label-md text-secondary">
            <span className="icon text-sm">verified</span>
            <span>{analytics.qualifiedLeads > 0 ? `${analytics.qualifiedLeads} qualified` : '0 leads qualified'}</span>
          </div>
        </Link>

        {/* KPI 3 */}
        <Link to="/communication" className="kpi-card ambient-card-purple hover:border-tertiary/50 transition-all cursor-pointer">
          <div className="kpi-glow bg-tertiary"></div>
          <div className="flex justify-between items-start mb-3">
            <span className="grid-header">Outreach Emails Sent</span>
            <span className="icon text-tertiary text-xl">mark_email_read</span>
          </div>
          <div className="text-kpi-xl text-on-surface font-mono font-bold mb-1">
            {loading ? '...' : analytics.outreachEmailsSent.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-label-md text-tertiary">
            <span className="icon text-sm">send</span>
            <span>{analytics.outreachEmailsSent > 0 ? 'Brevo active' : '0 emails sent'}</span>
          </div>
        </Link>

        {/* KPI 4 */}
        <Link to="/sales/pipeline" className="kpi-card hover:border-warning/50 transition-all cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="grid-header">Pipeline Revenue</span>
            <span className="icon text-warning text-xl">payments</span>
          </div>
          <div className="text-kpi-xl text-on-surface font-mono font-bold mb-1">
            {loading ? '...' : analytics.pipelineRevenue}
          </div>
          <div className="flex items-center gap-2 text-label-md text-warning">
            <span className="icon text-sm">view_kanban</span>
            <span>Pipeline stage view →</span>
          </div>
        </Link>
      </div>

      {/* Main Grid: AI Workforce + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols — Dynamic AI Workforce Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
              <span className="icon text-primary text-2xl">precision_manufacturing</span>
              <span>Autonomous AI Workforce Status</span>
            </h2>
            <Link to="/ai/workforce" className="text-label-md text-secondary font-mono bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-full hover:underline">
              {telemetry ? `${telemetry.activeAgents} / ${telemetry.totalAgents} Active` : '17 Agents Active'}
            </Link>
          </div>

          {!telemetry || telemetry.totalExecutionsToday === 0 ? (
            <div className="glass-panel p-8 rounded-2xl border border-outline-variant/30 text-center space-y-3 py-12">
              <span className="icon text-4xl text-primary/40 block">smart_toy</span>
              <div className="text-body-md font-bold text-on-surface">No AI Agent Executions Logged Yet</div>
              <p className="text-body-sm text-on-surface-variant max-w-md mx-auto text-xs">
                All 17 autonomous agents are standby and operational. Click <b>Deploy AI Hunter</b> or run a <b>School Discovery</b> search to trigger agent workflows.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button onClick={() => navigate('/discovery')} className="btn-primary py-1.5 px-4 text-xs font-semibold">
                  Discover Schools
                </button>
                <button onClick={() => navigate('/ai/control-tower')} className="btn-ghost py-1.5 px-4 text-xs">
                  AI Control Tower
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agents.slice(0, 4).map((agent) => (
                <div key={agent.id} className="glass-card p-4 rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="status-badge primary text-xs uppercase">{agent.domain}</span>
                      <span className={`status-badge ${agent.status === 'active' ? 'active' : 'pending'}`}>
                        {agent.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-body-md font-bold text-on-surface mb-1">{agent.name}</h3>
                    <div className="text-label-md font-mono text-on-surface-variant">Engine: {agent.model}</div>
                  </div>
                  <div className="flex justify-between items-center text-label-md font-mono text-on-surface-variant pt-3 border-t border-outline-variant/20 mt-3">
                    <span>{agent.executionsToday} runs today</span>
                    <span className="text-secondary">{agent.accuracy} accuracy</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 4 Cols — Live System Feed & Infrastructure Status */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
              <span className="icon text-secondary text-2xl">sensors</span>
              <span>Live System Feed</span>
            </h2>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 text-center py-10 space-y-2">
            <span className="icon text-3xl text-on-surface-variant/40 block">notifications_paused</span>
            <div className="text-body-md font-medium text-on-surface">No System Activity Yet</div>
            <p className="text-body-sm text-on-surface-variant text-xs max-w-xs mx-auto">
              Start by searching for schools in <b>School Discovery</b> or scoring a new lead.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/discovery')}
                className="btn-primary py-1.5 px-4 text-xs font-semibold"
              >
                Start School Discovery
              </button>
            </div>
          </div>

          {/* Infrastructure Health Box */}
          <div className="glass-card p-4 rounded-2xl border border-secondary/30 bg-secondary/5">
            <div className="text-label-sm font-semibold uppercase tracking-wider text-secondary mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>100% Free Stack Status</span>
            </div>
            <div className="space-y-1.5 text-label-md font-mono text-on-surface-variant">
              <div className="flex justify-between"><span>Supabase DB:</span><span className="text-secondary">Connected</span></div>
              <div className="flex justify-between"><span>Upstash Redis:</span><span className="text-secondary">Active</span></div>
              <div className="flex justify-between"><span>Google Gemini:</span><span className="text-secondary">1M Tokens Free</span></div>
              <div className="flex justify-between"><span>Brevo Email:</span><span className="text-secondary">300/day Free</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
