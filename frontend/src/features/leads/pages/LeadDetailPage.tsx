import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { leadsApi, Lead } from '@/features/leads/services/leads.api'
import { isWhatsAppEligible, getWhatsAppUrl } from '@/utils/phone'

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [rescoring, setRescoring] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [strategyExecuting, setStrategyExecuting] = useState(false)
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null)

  const fetchLeadDetail = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await leadsApi.getById(id)
      setLead(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeadDetail()
  }, [id])

  const handleRescore = async () => {
    if (!id) return
    setRescoring(true)
    try {
      const res = await leadsApi.rescoreLead(id)
      if (res.data) setLead(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setRescoring(false)
    }
  }

  const handleSendPersonalizedEmail = async () => {
    if (!lead) return
    setEmailSending(true)
    setActionMessage(null)
    try {
      const res = await leadsApi.sendPersonalizedEmail(lead.id)
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `🚀 Personalized email dispatched via Brevo to ${res.sentTo}! (Status updated to Contacted)`,
        })
        setLead((prev) => (prev ? { ...prev, status: 'contacted' } : null))
      } else {
        setActionMessage({
          type: 'error',
          text: `⚠️ ${res.error || 'Failed to dispatch email.'}`,
        })
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: `❌ ${err.response?.data?.error || err.message || 'Error sending email.'}`,
      })
    } finally {
      setEmailSending(false)
    }
  }

  const handleExecuteStrategy = async () => {
    if (!lead) return
    setStrategyExecuting(true)
    setActionMessage(null)
    try {
      const res = await leadsApi.executeStrategy(lead.id)
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `✨ ${res.message}`,
        })
        setLead((prev) => (prev ? { ...prev, status: 'contacted' } : null))
      } else {
        setActionMessage({
          type: 'error',
          text: `⚠️ ${res.error || 'Failed to execute strategy.'}`,
        })
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: `❌ ${err.response?.data?.error || err.message || 'Error executing strategy.'}`,
      })
    } finally {
      setStrategyExecuting(false)
    }
  }

  const handleStatusChange = async (newStatus: any) => {
    if (!id) return
    try {
      const updated = await leadsApi.updateStatus(id, newStatus)
      setLead(updated)
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <span className="icon text-3xl animate-spin text-primary">sync</span>
        <span className="text-body-sm text-on-surface-variant">Loading Lead Intelligence Profile...</span>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="glass-panel p-8 text-center rounded-2xl max-w-md mx-auto my-12">
        <span className="icon text-4xl text-error mb-2 block">error</span>
        <h2 className="text-headline-sm font-bold text-on-surface mb-2">Lead Record Not Found</h2>
        <Link to="/leads" className="btn-ghost text-xs">Back to Lead Database</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/leads" className="text-label-md text-on-surface-variant hover:text-primary flex items-center gap-1">
          <span className="icon text-sm">arrow_back</span>
          <span>Back to Lead Database</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRescore}
            disabled={rescoring}
            className="btn-ghost text-body-sm flex items-center gap-2 border-tertiary/40 text-tertiary"
          >
            <span className={`icon text-lg ${rescoring ? 'animate-spin' : ''}`}>psychology</span>
            <span>{rescoring ? 'Hermes 3 Rescoring...' : 'Rescore Lead (Hermes 3 AI)'}</span>
          </button>

          {(() => {
            const rawPhone = lead.school?.phone || lead.contact?.phone
            if (isWhatsAppEligible(rawPhone)) {
              const school = lead.school?.name || 'School'
              const students = lead.school?.studentCount || 1000
              const contact = lead.contact?.firstName ? `${lead.contact.firstName} ${lead.contact.lastName || ''}`.trim() : 'Principal'
              const rate = students <= 200 ? 8 : students <= 500 ? 7 : students <= 1000 ? 6 : 5
              const msg = `Respected ${contact} (${school}),\n\nGreetings from EduVault AI.\n\nModernize ${school}'s fee collections and ERP with 100% Zero Risk:\n\n🛡️ 2 Months Free Trial — 2 महीने चलाकर देखें, पसंद न आए तो ₹0 चार्ज, कोई बॉन्ड नहीं!\n🔄 100% Free Data Migration & Staff Training\n💼 Special Pricing: Just ₹${rate}/student/month (~₹${(students * rate).toLocaleString('en-IN')}/mo).\n\nCan we share a 2-minute live demo with your administration team?\n\nWarm regards,\nEduVault AI Team`
              return (
                <a
                  href={getWhatsAppUrl(rawPhone, msg)}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-4 rounded-xl text-body-sm font-bold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
                  title="Launch 1-Click WhatsApp Pitch"
                >
                  <span className="icon text-lg">chat</span>
                  <span>Send AI WhatsApp Pitch</span>
                </a>
              )
            } else if (rawPhone) {
              return (
                <a
                  href={`tel:${rawPhone}`}
                  className="py-2 px-4 rounded-xl text-body-sm font-semibold flex items-center gap-2 bg-surface-variant hover:bg-surface-variant/80 text-on-surface transition-all border border-outline-variant/30"
                  title={`Call Landline: ${rawPhone} (No WhatsApp)`}
                >
                  <span className="icon text-lg">call</span>
                  <span>Call School</span>
                </a>
              )
            }
            return null
          })()}

          <button
            onClick={handleSendPersonalizedEmail}
            disabled={emailSending}
            className="btn-primary py-2 px-4 text-body-sm flex items-center gap-2 shadow-lg"
          >
            <span className={`icon text-lg ${emailSending ? 'animate-spin' : ''}`}>
              {emailSending ? 'autorenew' : 'mail'}
            </span>
            <span>{emailSending ? 'Dispatching Email...' : 'Launch Personalized Email'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Action Notification Banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-body-sm animate-fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="icon text-lg">
              {actionMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="hover:opacity-70 text-xs px-2.5 py-1 rounded-lg border border-white/20 transition-all"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-outline-variant/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`status-badge font-bold ${
                lead.leadScore >= 80 ? 'active' : 'primary'
              }`}>
                Score: {lead.leadScore} / 100
              </span>
              <span className="status-badge uppercase">{lead.status}</span>
            </div>
            <h1 className="text-display-md font-bold text-on-surface mb-1">
              {lead.school?.name || 'Target School'}
            </h1>
            <p className="text-body-sm text-on-surface-variant flex items-center gap-2">
              <span className="icon text-base">place</span>
              <span>{lead.school?.city || 'Pune'}, Maharashtra, India</span>
              <span>•</span>
              <span className="icon text-base">groups</span>
              <span>{lead.school?.studentCount || 1500} Students</span>
            </p>
          </div>

          {/* Quick Status Picker */}
          <div className="glass-card p-3 rounded-2xl border border-outline-variant/30 text-right">
            <div className="text-label-md uppercase font-semibold text-on-surface-variant mb-1">Pipeline Stage</div>
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="glass-input h-10 px-3 font-semibold text-body-sm bg-surface-container text-primary"
            >
              <option value="new">New Lead</option>
              <option value="qualified">Qualified Lead</option>
              <option value="contacted">Contacted</option>
              <option value="engaged">Engaged</option>
              <option value="meeting_scheduled">Meeting Scheduled</option>
              <option value="proposal_sent">Proposal Sent</option>
              <option value="won">Won Deal 🎉</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: AI Score Breakdown + Recommended Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols — AI Lead Score Factor Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-secondary text-xl">insights</span>
            <span>AI Lead Score Breakdown (Gemini 1.5 Flash Engine)</span>
          </h2>

          <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-5">
            {/* Factor 1 */}
            <div>
              <div className="flex justify-between items-center text-body-sm mb-1.5">
                <span className="text-on-surface font-medium">School Scale & Student Count (&gt;1,000 students)</span>
                <span className="font-mono text-secondary font-bold">30 / 30 pts</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div className="h-full bg-secondary w-full rounded-full"></div>
              </div>
            </div>

            {/* Factor 2 */}
            <div>
              <div className="flex justify-between items-center text-body-sm mb-1.5">
                <span className="text-on-surface font-medium">Digital Maturity & Website Quality</span>
                <span className="font-mono text-primary font-bold">25 / 25 pts</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div className="h-full bg-primary w-full rounded-full"></div>
              </div>
            </div>

            {/* Factor 3 */}
            <div>
              <div className="flex justify-between items-center text-body-sm mb-1.5">
                <span className="text-on-surface font-medium">Verified Principal / Decision Maker Contact</span>
                <span className="font-mono text-tertiary font-bold">20 / 25 pts</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div className="h-full bg-tertiary w-4/5 rounded-full"></div>
              </div>
            </div>

            {/* Factor 4 */}
            <div>
              <div className="flex justify-between items-center text-body-sm mb-1.5">
                <span className="text-on-surface font-medium">Ideal Customer Profile (ICP) Fit</span>
                <span className="font-mono text-secondary font-bold">17 / 20 pts</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div className="h-full bg-secondary w-5/6 rounded-full"></div>
              </div>
            </div>

            {/* AI Reasoning Box */}
            <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 pt-3">
              <div className="text-label-sm font-semibold uppercase text-secondary mb-1">AI Qualification Reasoning</div>
              <p className="text-body-sm text-on-surface">
                {lead.scoreBreakdown?.reasoning || 'High-fit CBSE/ICSE K-12 school with strong student enrollment and verified decision-maker principal.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right 5 Cols — Decision Maker & Next Best Action */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-primary text-xl">bolt</span>
            <span>AI Recommended Next Action</span>
          </h2>

          <div className="glass-card p-6 rounded-2xl border border-primary/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
                <span className="icon text-xl">smart_toy</span>
              </div>
              <div>
                <div className="text-body-md font-bold text-on-surface">Sales Strategy Agent</div>
                <div className="text-label-md text-on-surface-variant font-mono">Recommended Action</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/30 text-body-sm text-on-surface space-y-2">
              <div className="font-semibold text-primary">1. Execute Email Sequence #1</div>
              <p className="text-on-surface-variant text-xs">
                Send hyper-personalized email focusing on Fee Gateway Automation to {lead.school?.principalName ? `Principal ${lead.school.principalName}` : 'School Management'}.
              </p>

            </div>

            <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/30 text-body-sm text-on-surface space-y-2">
              <div className="font-semibold text-secondary">2. WhatsApp Direct Follow-up</div>
              <p className="text-on-surface-variant text-xs">
                Schedule WhatsApp text 48 hours after email delivery.
              </p>
            </div>

            <button
              onClick={handleExecuteStrategy}
              disabled={strategyExecuting}
              className="btn-ai w-full py-3 text-body-sm font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <span className={`icon text-lg ${strategyExecuting ? 'animate-spin' : ''}`}>
                {strategyExecuting ? 'autorenew' : 'auto_awesome'}
              </span>
              <span>
                {strategyExecuting ? 'Executing Strategy Flow...' : 'Execute Recommended Strategy'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
