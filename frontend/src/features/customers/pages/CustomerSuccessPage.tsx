import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { customersApi, Customer } from '@/features/customers/services/customers.api'

export function CustomerSuccessPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [atRisk, setAtRisk] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [cData, rData] = await Promise.all([customersApi.list(), customersApi.getAtRisk()])
      setCustomers(cData || [])
      setAtRisk(rData || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefreshHealth = async (id: string) => {
    try {
      await customersApi.refreshHealth(id)
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">verified_user</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              Retention & Health Intelligence
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">Customer Success Command Center</h1>
          <p className="text-body-sm text-on-surface-variant">
            Monitor customer health, predict churn risk with Gemini AI, and manage ongoing school accounts.
          </p>
        </div>

        <Link to="/customers/support" className="btn-ai py-2.5 px-4 text-body-sm flex items-center gap-2">
          <span className="icon text-lg">support_agent</span>
          <span>Open AI Support Copilot</span>
        </Link>
      </div>

      {/* At Risk Alert Radar Banner */}
      {atRisk.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-error/40 bg-error-container/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="icon text-2xl text-error">warning</span>
            <div>
              <div className="text-body-md font-bold text-on-surface">
                {atRisk.length} Customer Account(s) At Risk of Churn
              </div>
              <div className="text-body-sm text-on-surface-variant">
                {atRisk.map((c) => c.schoolName).join(', ')} require urgent CSM intervention.
              </div>
            </div>
          </div>
          <span className="status-badge error">High Priority</span>
        </div>
      )}

      {/* Customers Directory Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                <th className="p-4">School Account</th>
                <th className="p-4">Health Score (Gemini AI)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Monthly MRR</th>
                <th className="p-4">Renewal Date</th>
                <th className="p-4">Assigned CSM</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                    <span className="icon text-2xl animate-spin text-primary block mb-2">sync</span>
                    Loading customer accounts...
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="p-4 font-bold text-on-surface">
                      <Link to={`/customers/${cust.id}`} className="hover:text-primary transition-colors">
                        {cust.schoolName}
                      </Link>
                      <div className="text-label-md text-on-surface-variant font-mono">{cust.primaryContact}</div>
                    </td>

                    {/* Health Score Badge */}
                    <td className="p-4 font-mono">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-md font-bold ${
                        cust.healthScore >= 80
                          ? 'bg-secondary/15 text-secondary border border-secondary/30'
                          : cust.healthScore >= 70
                          ? 'bg-primary-container/20 text-primary border border-primary/30'
                          : 'bg-error/15 text-error border border-error/30 animate-pulse'
                      }`}>
                        <span className="icon text-sm">{cust.healthScore >= 80 ? 'favorite' : 'heart_broken'}</span>
                        <span>{cust.healthScore} / 100</span>
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`status-badge ${cust.status === 'active' ? 'active' : 'error'}`}>
                        {cust.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-bold text-secondary">
                      ₹{cust.mrr.toLocaleString('en-IN')}/mo
                    </td>

                    <td className="p-4 font-mono text-on-surface-variant">{cust.contractRenewalDate}</td>

                    <td className="p-4 text-on-surface-variant">{cust.accountManager}</td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRefreshHealth(cust.id)}
                          title="Refresh Health Score with Gemini AI"
                          className="w-8 h-8 rounded-lg glass-card flex items-center justify-center text-tertiary hover:bg-tertiary/10 transition-colors"
                        >
                          <span className="icon text-base">refresh</span>
                        </button>

                        <Link
                          to={`/customers/${cust.id}`}
                          className="btn-ghost py-1.5 px-3 text-xs inline-flex items-center gap-1"
                        >
                          <span>360° Profile</span>
                          <span className="icon text-sm">arrow_forward</span>
                        </Link>
                      </div>
                    </td>
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
