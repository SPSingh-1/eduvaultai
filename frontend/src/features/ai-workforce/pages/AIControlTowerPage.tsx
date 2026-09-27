import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { aiApi, ControlTowerTelemetry, AIAgent } from '@/features/ai-workforce/services/ai.api'

export function AIControlTowerPage() {
  const [telemetry, setTelemetry] = useState<ControlTowerTelemetry | null>(null)
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingAll, setTogglingAll] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tData, aData] = await Promise.all([aiApi.getTelemetry(), aiApi.getAgents()])
      setTelemetry(tData)
      setAgents(aData || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleAgent = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active'
      await aiApi.updateAgentStatus(id, newStatus)
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleCircuitBreaker = async (action: 'pause_all' | 'resume_all') => {
    setTogglingAll(true)
    try {
      await aiApi.triggerCircuitBreaker(action)
      fetchData()
    } catch (e) {
      console.error(e)
    } finally {
      setTogglingAll(false)
    }
  }

  if (loading || !telemetry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <span className="icon text-3xl animate-spin text-primary">sync</span>
        <span className="text-body-sm text-on-surface-variant">Connecting to AI Control Tower Telemetry...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner & Emergency Circuit Breaker */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="ai-dot"></span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-secondary">
              Real-Time AI Telemetry
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">AI Control Tower</h1>
          <p className="text-body-sm text-on-surface-variant">
            Governance, safety controls, and real-time execution oversight for your 17 autonomous AI agents.
          </p>
        </div>

        {/* Emergency Circuit Breaker Controls */}
        <div className="flex items-center gap-3">
          {telemetry.circuitBreakerState === 'NORMAL' ? (
            <button
              onClick={() => handleCircuitBreaker('pause_all')}
              disabled={togglingAll}
              className="px-4 py-2.5 rounded-xl bg-error-container/40 border border-error/40 text-error hover:bg-error-container/60 text-body-sm font-semibold flex items-center gap-2 transition-all shadow-lg"
            >
              <span className="icon text-lg">pause_circle</span>
              <span>Circuit Breaker: Emergency Pause All</span>
            </button>
          ) : (
            <button
              onClick={() => handleCircuitBreaker('resume_all')}
              disabled={togglingAll}
              className="btn-primary py-2.5 px-4 text-body-sm font-semibold flex items-center gap-2"
            >
              <span className="icon text-lg">play_circle</span>
              <span>Resume All 17 Agents</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <span className="grid-header">Active Agents</span>
          <div className="text-kpi-xl text-secondary font-mono font-bold my-1">
            {telemetry.activeAgents} / {telemetry.totalAgents}
          </div>
          <span className="text-label-md text-on-surface-variant font-mono">
            {telemetry.activeAgents === telemetry.totalAgents ? 'All Agents Ready' : `${telemetry.activeAgents} Active, ${telemetry.totalAgents - telemetry.activeAgents} Paused`}
          </span>
        </div>

        <div className="kpi-card">
          <span className="grid-header">Executions Today</span>
          <div className="text-kpi-xl text-primary font-mono font-bold my-1">
            {telemetry.totalExecutionsToday}
          </div>
          <span className="text-label-md text-primary font-mono">Live System Telemetry</span>
        </div>

        <div className="kpi-card">
          <span className="grid-header font-mono">Gemini Token Budget</span>
          <div className="text-body-md font-bold text-tertiary font-mono my-2 line-clamp-1">
            0 / 1,000,000 Tokens
          </div>
          <span className="text-label-md text-secondary">₹0 Cost (Free Tier Active)</span>
        </div>

        <Link to="/ai/approvals" className="kpi-card hover:border-warning/50 transition-all cursor-pointer">
          <div className="flex justify-between items-start">
            <span className="grid-header text-warning">Pending Approvals</span>
            <span className="icon text-warning text-xl">pending_actions</span>
          </div>
          <div className="text-kpi-xl text-warning font-mono font-bold my-1">
            {telemetry.pendingApprovalsCount}
          </div>
          <span className="text-label-md text-warning font-semibold hover:underline">Review Guard Queue →</span>
        </Link>
      </div>

      {/* Agents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-primary text-2xl">smart_toy</span>
            <span>17 Autonomous AI Agent Roster</span>
          </h2>

          <Link to="/ai/workforce" className="text-label-md text-primary hover:underline flex items-center gap-1">
            <span>View Workforce Team Roster</span>
            <span className="icon text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="glass-card p-5 rounded-2xl border border-outline-variant/30 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="status-badge primary text-xs uppercase">{agent.domain}</span>
                  <span className={`status-badge ${agent.status === 'active' ? 'active' : 'pending'}`}>
                    {agent.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-body-md font-bold text-on-surface mb-1">{agent.name}</h3>
                <div className="text-label-md font-mono text-on-surface-variant">Model: {agent.model}</div>
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-label-md font-mono">
                <span className="text-on-surface-variant">{agent.executionsToday} runs today</span>
                <span className={`font-semibold ${agent.status === 'active' ? 'text-secondary' : 'text-error'}`}>
                  {agent.status === 'active' ? 'Standby (Ready)' : 'Paused'}
                </span>

                <button
                  onClick={() => handleToggleAgent(agent.id, agent.status)}
                  className={`px-2.5 py-1 rounded-lg text-label-md font-medium transition-all ${
                    agent.status === 'active'
                      ? 'bg-surface-container-high text-on-surface-variant hover:text-error'
                      : 'bg-secondary/20 text-secondary border border-secondary/30'
                  }`}
                >
                  {agent.status === 'active' ? 'Pause' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
