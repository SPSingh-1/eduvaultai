import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { aiApi, AIAgent } from '@/features/ai-workforce/services/ai.api'

export function AIWorkforceTeamPage() {
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const data = await aiApi.getAgents()
      setAgents(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">groups</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              Autonomous Team Roster
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">AI Workforce Team (17 Agents)</h1>
          <p className="text-body-sm text-on-surface-variant">
            Your specialized AI agents driving school sales, marketing, intelligence, and customer success.
          </p>
        </div>

        <Link to="/ai/control-tower" className="btn-primary py-2.5 px-4 text-body-sm flex items-center gap-2">
          <span className="icon text-lg">precision_manufacturing</span>
          <span>Open Control Tower</span>
        </Link>
      </div>

      {/* Agents Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                <th className="p-4">Agent Name</th>
                <th className="p-4">Domain</th>
                <th className="p-4">AI Engine Model</th>
                <th className="p-4">Status</th>
                <th className="p-4 font-mono">Executions Today</th>
                <th className="p-4 text-right font-mono">Accuracy Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    <span className="icon text-2xl animate-spin text-primary block mb-2">sync</span>
                    Loading AI Workforce Team...
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="p-4 font-bold text-on-surface flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary">
                        <span className="icon text-lg">smart_toy</span>
                      </div>
                      <span>{agent.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="status-badge primary text-xs uppercase">{agent.domain}</span>
                    </td>
                    <td className="p-4 text-label-md font-mono text-tertiary">{agent.model}</td>
                    <td className="p-4">
                      <span className={`status-badge ${agent.status === 'active' ? 'active' : 'pending'}`}>
                        {agent.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-on-surface">{agent.executionsToday}</td>
                    <td className="p-4 text-right font-mono text-secondary font-bold">{agent.accuracy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
