import { useState, useEffect } from 'react'
import { renewalsApi, RenewalItem } from '@/features/renewals/services/renewals.api'

export function RenewalsPage() {
  const [renewals, setRenewals] = useState<RenewalItem[]>([])
  const [totalARR, setTotalARR] = useState(0)
  const [expansionARR, setExpansionARR] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedPitch, setSelectedPitch] = useState<any>(null)
  const [pitchingId, setPitchingId] = useState<string | null>(null)

  const fetchRenewals = async () => {
    setLoading(true)
    try {
      const res = await renewalsApi.list()
      setRenewals(res.data || [])
      setTotalARR(res.totalARRAtRisk || 0)
      setExpansionARR(res.totalExpansionARR || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRenewals()
  }, [])

  const handleGenerateUpsellPitch = async (id: string) => {
    setPitchingId(id)
    try {
      const pitch = await renewalsApi.generateUpsellPitch(id)
      setSelectedPitch(pitch)
    } catch (e) {
      console.error(e)
    } finally {
      setPitchingId(null)
    }
  }

  const handleSendProposal = async (id: string) => {
    try {
      await renewalsApi.autoGenProposal(id)
      fetchRenewals()
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
            <span className="icon text-primary text-xl">trending_up</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              ARR Retention & Contract Expansion
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">Renewals & Growth Intelligence</h1>
          <p className="text-body-sm text-on-surface-variant">
            Automate annual contract renewals and discover cross-sell/upsell expansion opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 rounded-2xl border border-secondary/30 text-right">
            <div className="text-label-md uppercase font-semibold text-on-surface-variant">Expansion ARR Pipeline</div>
            <div className="text-kpi-md text-secondary font-mono font-bold">
              +₹{(expansionARR / 100000).toFixed(1)} Lakhs
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card">
          <span className="grid-header">Annual Renewals ARR</span>
          <div className="text-kpi-xl text-primary font-mono font-bold my-1">
            ₹{(totalARR / 100000).toFixed(1)}L
          </div>
          <span className="text-label-md text-on-surface-variant">3 Accounts up in 90 days</span>
        </div>

        <div className="kpi-card">
          <span className="grid-header">Avg Renewal Likelihood</span>
          <div className="text-kpi-xl text-secondary font-mono font-bold my-1">
            88%
          </div>
          <span className="text-label-md text-secondary font-mono">High Retention Rate</span>
        </div>

        <div className="kpi-card">
          <span className="grid-header">Contract Expansion Target</span>
          <div className="text-kpi-xl text-tertiary font-mono font-bold my-1">
            +₹{(expansionARR / 100000).toFixed(1)}L
          </div>
          <span className="text-label-md text-tertiary font-mono">Upsell Bundles Active</span>
        </div>
      </div>

      {/* Renewals Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                <th className="p-4">School Account</th>
                <th className="p-4">Current ARR</th>
                <th className="p-4">Renewal Expiry</th>
                <th className="p-4">Renewal Odds</th>
                <th className="p-4">Upsell Opportunity</th>
                <th className="p-4">Expansion Value</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                    <span className="icon text-2xl animate-spin text-primary block mb-2">sync</span>
                    Loading renewals intelligence...
                  </td>
                </tr>
              ) : (
                renewals.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="p-4 font-bold text-on-surface">{item.schoolName}</td>
                    <td className="p-4 font-mono font-bold text-on-surface">₹{(item.currentArr / 100000).toFixed(1)}L</td>
                    <td className="p-4 font-mono text-on-surface-variant">
                      {item.renewalDate} <span className="text-xs text-error font-semibold">({item.daysToExpiry}d left)</span>
                    </td>
                    <td className="p-4 font-mono text-secondary font-bold">{item.renewalLikelihood}</td>
                    <td className="p-4 text-tertiary font-medium">{item.upsellOpportunity}</td>
                    <td className="p-4 font-mono font-bold text-secondary">+₹{(item.potentialExpansionARR / 100000).toFixed(1)}L</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleGenerateUpsellPitch(item.id)}
                          disabled={pitchingId === item.id}
                          className="btn-ai py-1.5 px-3 text-xs flex items-center gap-1"
                        >
                          <span className={`icon text-sm ${pitchingId === item.id ? 'animate-spin' : ''}`}>auto_awesome</span>
                          <span>AI Pitch</span>
                        </button>

                        <button
                          onClick={() => handleSendProposal(item.id)}
                          disabled={item.status === 'proposal_sent'}
                          className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                            item.status === 'proposal_sent'
                              ? 'bg-secondary/20 text-secondary border border-secondary/30'
                              : 'btn-primary'
                          }`}
                        >
                          <span className="icon text-sm">{item.status === 'proposal_sent' ? 'check' : 'send'}</span>
                          <span>{item.status === 'proposal_sent' ? 'Proposal Sent' : 'Send Proposal'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Upsell Pitch Modal / Output Box */}
      {selectedPitch && (
        <div className="glass-panel p-6 rounded-2xl border border-tertiary/30 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <h3 className="text-body-md font-bold text-on-surface flex items-center gap-2">
              <span className="icon text-tertiary text-xl">auto_awesome</span>
              <span>Gemini AI Renewal & Upsell Pitch</span>
            </h3>
            <span className="text-label-md font-mono text-secondary font-bold">
              Expansion Value: {selectedPitch.estimatedExpansionValue}
            </span>
          </div>

          <div className="font-semibold text-on-surface text-body-sm">
            Subject: {selectedPitch.pitchSubject}
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-body-sm text-on-surface whitespace-pre-wrap leading-relaxed">
            {selectedPitch.pitchBody}
          </div>
        </div>
      )}
    </div>
  )
}
