import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { leadsApi, Lead } from '@/features/leads/services/leads.api'

export function LeadsDatabasePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [minScore, setMinScore] = useState(0)
  const [search, setSearch] = useState('')

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await leadsApi.list({ status: statusFilter, minScore: minScore > 0 ? minScore : undefined, search })
      setLeads(res.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [statusFilter, minScore, search])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await leadsApi.updateStatus(id, newStatus)
      fetchLeads()
    } catch (e) {
      console.error(e)
    }
  }

  const handleRescore = async (id: string) => {
    try {
      await leadsApi.rescoreLead(id)
      fetchLeads()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">psychology</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              AI Lead Qualification Database
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">Lead Intelligence Database</h1>
          <p className="text-body-sm text-on-surface-variant">
            Autonomous scoring, contact enrichment, and pipeline qualification for all target schools.
          </p>
        </div>

        <Link to="/leads/icp" className="btn-ghost py-2.5 px-4 flex items-center gap-2 self-start border-primary/30 text-primary">
          <span className="icon text-lg">tune</span>
          <span>Configure ICP Criteria</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-outline-variant/30 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads by school name, city..."
              className="glass-input w-full pl-10 h-10 text-body-sm"
            />
            <span className="icon text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 text-lg">search</span>
          </div>

          {/* Min Score Slider */}
          <div className="flex items-center gap-3 glass-card px-4 rounded-xl border border-outline-variant/30">
            <span className="text-label-md text-on-surface-variant whitespace-nowrap">Min Score: <span className="font-mono text-primary font-bold">{minScore}+</span></span>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              className="accent-primary cursor-pointer w-28"
            />
          </div>
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          {[
            { label: 'All Leads', value: '' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'New', value: 'new' },
            { label: 'Contacted', value: 'contacted' },
            { label: 'Engaged', value: 'engaged' },
            { label: 'Meeting Scheduled', value: 'meeting_scheduled' },
            { label: 'Proposal Sent', value: 'proposal_sent' },
            { label: 'Won', value: 'won' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setStatusFilter(item.value)}
              className={`px-3 py-1 rounded-full text-label-md whitespace-nowrap transition-all ${
                statusFilter === item.value
                  ? 'bg-primary-container text-white font-semibold shadow-glow-primary'
                  : 'glass-card text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Database Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                <th className="p-4">School & Location</th>
                <th className="p-4">AI Fit Score</th>
                <th className="p-4">Status</th>
                <th className="p-4">Decision Maker Contact</th>
                <th className="p-4">Enrichment Engine</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-body-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    <span className="icon text-2xl animate-spin text-primary block mb-2">sync</span>
                    Loading Lead Intelligence Database...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    No leads match the selected filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-surface-container-high/40 transition-colors">
                    {/* School info */}
                    <td className="p-4">
                      <Link to={`/leads/${lead.id}`} className="font-bold text-on-surface hover:text-primary transition-colors block">
                        {lead.school?.name || 'School Record'}
                      </Link>
                      <div className="text-label-md text-on-surface-variant flex items-center gap-1">
                        <span className="icon text-xs">place</span>
                        <span>{lead.school?.city || 'Pune'}, {lead.school?.state || 'Maharashtra'}</span>
                      </div>
                    </td>

                    {/* AI Score Badge */}
                    <td className="p-4 font-mono">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-md font-bold ${
                        lead.leadScore >= 80
                          ? 'bg-secondary/15 text-secondary border border-secondary/30'
                          : lead.leadScore >= 60
                          ? 'bg-primary-container/20 text-primary border border-primary/30'
                          : 'bg-warning/15 text-warning border border-warning/30'
                      }`}>
                        <span className="icon text-sm">{lead.leadScore >= 80 ? 'star' : 'bolt'}</span>
                        <span>{lead.leadScore} / 100</span>
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="glass-input h-8 px-2 py-0 text-label-md font-semibold bg-surface-container border-outline-variant/40"
                      >
                        <option value="new">New</option>
                        <option value="qualified">Qualified</option>
                        <option value="contacted">Contacted</option>
                        <option value="engaged">Engaged</option>
                        <option value="meeting_scheduled">Meeting Scheduled</option>
                        <option value="proposal_sent">Proposal Sent</option>
                        <option value="won">Won Deal 🎉</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>

                    {/* Decision Maker Contact */}
                    <td className="p-4 text-on-surface-variant">
                      <div className="text-on-surface font-semibold flex items-center gap-1.5 mb-1">
                        <span className="icon text-xs text-primary">person</span>
                        <span>
                          {lead.contact?.firstName
                            ? `${lead.contact.firstName} ${lead.contact.lastName}`
                            : lead.school?.principalName || 'Principal / Admin'}
                        </span>
                      </div>
                      <div className="space-y-0.5 font-mono text-label-sm">
                        {lead.school?.email || lead.contact?.email ? (
                          <a href={`mailto:${lead.school?.email || lead.contact?.email}`} className="text-primary hover:underline flex items-center gap-1">
                            <span className="icon text-xs">mail</span>
                            <span>{lead.school?.email || lead.contact?.email}</span>
                          </a>
                        ) : null}
                        {lead.school?.phone ? (
                          <a href={`tel:${lead.school.phone}`} className="text-secondary font-bold hover:underline flex items-center gap-1">
                            <span className="icon text-xs">call</span>
                            <span>{lead.school.phone}</span>
                          </a>
                        ) : !lead.school?.email && !lead.contact?.email ? (
                          <span className="text-on-surface-variant/50 flex items-center gap-1">
                            <span className="icon text-xs">phone_disabled</span>
                            <span>Contact Unlisted</span>
                          </span>
                        ) : null}
                      </div>
                    </td>



                    {/* AI Engine badge */}
                    <td className="p-4 text-label-md font-mono text-tertiary">
                      Google Gemini 1.5
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRescore(lead.id)}
                          title="Rescore with Gemini AI"
                          className="w-8 h-8 rounded-lg glass-card flex items-center justify-center text-tertiary hover:bg-tertiary/10 transition-colors"
                        >
                          <span className="icon text-base">refresh</span>
                        </button>

                        <Link
                          to={`/leads/${lead.id}`}
                          className="btn-ghost py-1.5 px-3 text-xs inline-flex items-center gap-1"
                        >
                          <span>Intelligence</span>
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
