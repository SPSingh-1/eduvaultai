import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { customersApi, Customer } from '@/features/customers/services/customers.api'

export function Customer360Page() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)

  const fetchCustomer = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await customersApi.getById(id)
      setCustomer(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomer()
  }, [id])

  const handleRefreshHealth = async () => {
    if (!id) return
    setRefreshing(true)
    try {
      const res = await customersApi.refreshHealth(id)
      setCustomer(res.data)
      setAiAnalysis(res.aiAnalysis)
    } catch (e) {
      console.error(e)
    } finally {
      setRefreshing(false)
    }
  }

  if (loading || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <span className="icon text-3xl animate-spin text-primary">sync</span>
        <span className="text-body-sm text-on-surface-variant">Loading Customer 360° Profile...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/customers" className="text-label-md text-on-surface-variant hover:text-primary flex items-center gap-1">
          <span className="icon text-sm">arrow_back</span>
          <span>Back to Customer Directory</span>
        </Link>

        <button
          onClick={handleRefreshHealth}
          disabled={refreshing}
          className="btn-ai py-2 px-4 text-body-sm flex items-center gap-2"
        >
          <span className={`icon text-lg ${refreshing ? 'animate-spin' : ''}`}>psychology</span>
          <span>{refreshing ? 'Analyzing Health (Gemini AI)...' : 'Refresh Churn Risk AI (Gemini)'}</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-outline-variant/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`status-badge ${customer.healthScore >= 80 ? 'active' : 'error'}`}>
                Health Score: {customer.healthScore}/100
              </span>
              <span className="status-badge primary">NPS Score: {customer.npsScore}/10</span>
            </div>
            <h1 className="text-display-md font-bold text-on-surface mb-1">{customer.schoolName}</h1>
            <p className="text-body-sm text-on-surface-variant flex items-center gap-2">
              <span className="icon text-base">person</span>
              <span>Contact: {customer.primaryContact}</span>
              <span>•</span>
              <span className="icon text-base">support_agent</span>
              <span>CSM: {customer.accountManager}</span>
            </p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-secondary/30 text-right">
            <div className="text-label-md uppercase font-semibold text-on-surface-variant">Monthly Contract Value</div>
            <div className="text-kpi-xl text-secondary font-mono font-bold">
              ₹{customer.mrr.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Health Breakdown & AI Churn Playbook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols — Telemetry Metrics */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-primary text-xl">insights</span>
            <span>Usage & Product Health Telemetry</span>
          </h2>

          <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4">
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant font-medium">Daily Teacher Login Frequency</span>
              <span className="font-mono text-on-surface font-bold">{customer.healthBreakdown?.userLoginFrequency || '85%'}</span>
            </div>
            <div className="divider"></div>
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant font-medium">Fee Reconciliation Rate</span>
              <span className="font-mono text-secondary font-bold">{customer.healthBreakdown?.feeReconciliationRate || '94%'}</span>
            </div>
            <div className="divider"></div>
            <div className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant font-medium">Support Ticket Queue</span>
              <span className="font-mono text-tertiary font-bold">{customer.healthBreakdown?.supportTickets || '0 Open'}</span>
            </div>
          </div>
        </div>

        {/* Right 6 Cols — Gemini Churn Risk & CS Playbook */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-tertiary text-xl">smart_toy</span>
            <span>AI Churn Risk & Retention Playbook</span>
          </h2>

          {aiAnalysis ? (
            <div className="glass-panel p-6 rounded-2xl border border-tertiary/30 space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <span className="text-label-sm uppercase font-semibold text-on-surface-variant">Predicted Churn Risk</span>
                <span className={`status-badge ${aiAnalysis.churnRiskLevel === 'HIGH' ? 'error' : 'active'}`}>
                  {aiAnalysis.churnRiskLevel} RISK
                </span>
              </div>

              <div>
                <div className="text-label-sm font-semibold uppercase text-error mb-1">Detected Risk Factor</div>
                <p className="text-body-sm text-on-surface bg-error-container/10 p-3 rounded-xl border border-error/20">
                  {aiAnalysis.keyRiskFactor}
                </p>
              </div>

              <div>
                <div className="text-label-sm font-semibold uppercase text-secondary mb-1">Recommended CSM Playbook Step</div>
                <p className="text-body-sm text-on-surface bg-secondary-container/10 p-3 rounded-xl border border-secondary/20">
                  {aiAnalysis.csRecommendedAction}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 rounded-2xl text-center space-y-3">
              <span className="icon text-4xl text-tertiary block">auto_awesome</span>
              <div className="text-body-md font-semibold text-on-surface">No Live Churn Analysis Run Yet</div>
              <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
                Click "Refresh Churn Risk AI" above to run Gemini health analytics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
