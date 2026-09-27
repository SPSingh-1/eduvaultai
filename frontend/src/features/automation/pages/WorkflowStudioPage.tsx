import { useState, useEffect } from 'react'
import { automationApi, Workflow } from '@/features/automation/services/automation.api'

export function WorkflowStudioPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState<string | null>(null)

  const fetchWorkflows = async () => {
    setLoading(true)
    try {
      const data = await automationApi.getWorkflows()
      setWorkflows(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const handleTestTrigger = async (id: string) => {
    try {
      const res = await automationApi.triggerWorkflow(id)
      setTestResult(res.message)
      setTimeout(() => setTestResult(null), 3000)
      fetchWorkflows()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">account_tree</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              Event-Driven Automation Engine
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">Workflow Automation Studio</h1>
          <p className="text-body-sm text-on-surface-variant">
            Visual workflow builder linking event triggers, logic gates, AI agents, and automated actions.
          </p>
        </div>

        {testResult && (
          <div className="px-4 py-2 rounded-xl bg-secondary/20 border border-secondary/30 text-secondary text-body-sm flex items-center gap-2 font-medium">
            <span className="icon text-lg">check_circle</span>
            <span>{testResult}</span>
          </div>
        )}
      </div>

      {/* Workflows List Container */}
      <div className="space-y-4">
        {loading ? (
          <div className="glass-panel p-8 text-center text-on-surface-variant rounded-2xl">
            <span className="icon text-2xl animate-spin text-primary block mb-2">sync</span>
            Loading visual workflow studio...
          </div>
        ) : (
          workflows.map((wf) => (
            <div key={wf.id} className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-3">
                  <span className="status-badge active">Active</span>
                  <h3 className="text-body-md font-bold text-on-surface">{wf.name}</h3>
                </div>
                <div className="flex items-center gap-3 text-label-md font-mono text-on-surface-variant">
                  <span>Runs: {wf.totalRuns}</span>
                  <button
                    onClick={() => handleTestTrigger(wf.id)}
                    className="btn-ghost py-1.5 px-3 text-xs border-primary/30 text-primary flex items-center gap-1"
                  >
                    <span className="icon text-sm">play_arrow</span>
                    <span>Test Trigger</span>
                  </button>
                </div>
              </div>

              {/* Visual Nodes: Trigger -> Condition -> Action */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                {/* Node 1: Trigger */}
                <div className="glass-card p-4 rounded-xl border border-primary/30 space-y-1">
                  <div className="text-label-sm font-semibold uppercase text-primary flex items-center gap-1">
                    <span className="icon text-base">bolt</span> Trigger Event
                  </div>
                  <div className="text-body-sm font-bold text-on-surface">{wf.trigger}</div>
                </div>

                {/* Node 2: Conditions */}
                <div className="glass-card p-4 rounded-xl border border-tertiary/30 space-y-1">
                  <div className="text-label-sm font-semibold uppercase text-tertiary flex items-center gap-1">
                    <span className="icon text-base">filter_alt</span> Logic Gates
                  </div>
                  <div className="space-y-0.5">
                    {wf.conditions.map((c, i) => (
                      <div key={i} className="text-body-sm text-on-surface-variant text-xs">• {c}</div>
                    ))}
                  </div>
                </div>

                {/* Node 3: Actions */}
                <div className="glass-card p-4 rounded-xl border border-secondary/30 space-y-1">
                  <div className="text-label-sm font-semibold uppercase text-secondary flex items-center gap-1">
                    <span className="icon text-base">play_circle</span> Automated Actions
                  </div>
                  <div className="space-y-0.5">
                    {wf.actions.map((a, i) => (
                      <div key={i} className="text-body-sm text-secondary font-medium text-xs">✓ {a}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
