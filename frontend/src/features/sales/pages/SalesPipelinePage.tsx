import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { salesApi, PipelineStage, Deal } from '@/features/sales/services/sales.api'
import { isWhatsAppEligible, getWhatsAppUrl } from '@/utils/phone'

function formatCurrency(val: number) {
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)}L`
  }
  if (val >= 1000) {
    return `₹${(val / 1000).toFixed(1)}k`
  }
  return `₹${val.toLocaleString('en-IN')}`
}

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  discovery: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', bar: 'bg-blue-500' },
  ai_strong: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', bar: 'bg-purple-500' },
  outreach_sent: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', bar: 'bg-indigo-500' },
  qualification: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', bar: 'bg-indigo-500' },
  demo_scheduled: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', bar: 'bg-cyan-500' },
  proposal_sent: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', bar: 'bg-amber-500' },
  closed_won: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', bar: 'bg-emerald-500' },
  // AI Intent View stages
  ai_ready: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', bar: 'bg-violet-500' },
  ai_dispatched: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', bar: 'bg-indigo-500' },
  ai_replied: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', bar: 'bg-cyan-500' },
  ai_won: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', bar: 'bg-emerald-500' },
}

export function SalesPipelinePage() {
  const [pipeline, setPipeline] = useState<PipelineStage[]>([])
  const [aiIntentPipeline, setAiIntentPipeline] = useState<PipelineStage[]>([])
  const [activePipelineView, setActivePipelineView] = useState<'core' | 'ai_intent'>('core')
  const [totalValue, setTotalValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newDeal, setNewDeal] = useState({
    schoolName: '',
    contactName: '',
    phone: '',
    city: '',
    studentCount: 500,
    stage: 'discovery',
  })

  const [sendingEmailMap, setSendingEmailMap] = useState<Record<string, boolean>>({})
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null)
  const [emailModal, setEmailModal] = useState<{ open: boolean; deal: Deal | null; email: string }>({
    open: false,
    deal: null,
    email: '',
  })

  useEffect(() => {
    if (!toastMsg) return
    const timer = setTimeout(() => setToastMsg(null), 5500)
    return () => clearTimeout(timer)
  }, [toastMsg])

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollKanban = (dir: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: dir === 'left' ? -340 : 340,
        behavior: 'smooth',
      })
    }
  }

  const fetchPipeline = async () => {
    setLoading(true)
    try {
      const res = await salesApi.getPipeline()
      setPipeline(res.data || [])
      setAiIntentPipeline(res.aiIntentStages || [])
      setTotalValue(res.totalValue || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPipeline()
  }, [])

  const handleMoveStage = async (dealId: string, newStage: string) => {
    try {
      await salesApi.updateStage(dealId, newStage)
      fetchPipeline()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteDeal = async (dealId: string) => {
    if (!window.confirm('Delete this deal from your pipeline?')) return
    try {
      await salesApi.deleteDeal(dealId)
      fetchPipeline()
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDeal.schoolName.trim()) return
    setAdding(true)
    try {
      await salesApi.createDeal(newDeal)
      setIsAddModalOpen(false)
      setNewDeal({
        schoolName: '',
        contactName: '',
        phone: '',
        city: '',
        studentCount: 500,
        stage: 'discovery',
      })
      fetchPipeline()
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const handleSendColdEmail = async (deal: Deal, customEmail?: string) => {
    // 1. Strict Duplicate Check on UI
    if (deal.emailStatus?.sent) {
      setToastMsg({
        type: 'info',
        text: `Cold email already sent to ${deal.schoolName} (${deal.emailStatus.sentCount} sent). Duplicate cold emails are blocked!`,
      })
      return
    }

    // 2. Identify recipient email
    const targetEmail = (customEmail || deal.email || '').trim()
    if (!targetEmail) {
      setEmailModal({
        open: true,
        deal,
        email: '',
      })
      return
    }

    // 3. In-flight check
    if (sendingEmailMap[deal.id]) return

    setSendingEmailMap((prev) => ({ ...prev, [deal.id]: true }))
    try {
      const res = await salesApi.sendColdEmail(deal.id, targetEmail)
      if (res.success) {
        setToastMsg({
          type: 'success',
          text: res.alreadySent
            ? `Cold outreach was already sent to ${deal.schoolName}. No repeated cold email dispatched.`
            : `✅ Cold Outreach email sent to ${deal.schoolName} (${targetEmail}) with 2M Free Trial & Slab Pricing!`,
        })
        setEmailModal({ open: false, deal: null, email: '' })
        await fetchPipeline()
      } else {
        setToastMsg({
          type: 'error',
          text: res.error || 'Failed to dispatch email.',
        })
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Error dispatching cold email'
      setToastMsg({
        type: 'error',
        text: msg,
      })
    } finally {
      setSendingEmailMap((prev) => ({ ...prev, [deal.id]: false }))
    }
  }

  const getNextStage = (currentStageId: string) => {
    const stageMap: Record<string, string> = {
      discovery: 'ai_strong',
      ai_strong: 'outreach_sent',
      outreach_sent: 'demo_scheduled',
      qualification: 'demo_scheduled',
      demo_scheduled: 'proposal_sent',
      proposal_sent: 'closed_won',
      // AI Intent stages
      ai_ready: 'ai_dispatched',
      ai_dispatched: 'ai_replied',
      ai_replied: 'ai_won',
    }
    return stageMap[currentStageId] || 'closed_won'
  }

  const currentPipelineData = activePipelineView === 'core' ? pipeline : aiIntentPipeline
  const totalDealsCount = currentPipelineData.reduce((acc, stage) => acc + stage.deals.length, 0)

  // Filter deals based on search
  const filteredPipeline = currentPipelineData.map((stage) => ({
    ...stage,
    deals: stage.deals.filter((deal) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        deal.schoolName.toLowerCase().includes(q) ||
        deal.contactName.toLowerCase().includes(q) ||
        (deal.city && deal.city.toLowerCase().includes(q))
      )
    }),
  }))

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header & Telemetry Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">view_kanban</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              Autonomous Sales Engine
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">Sales Pipeline Kanban</h1>
          <p className="text-body-sm text-on-surface-variant">
            Track real school deals from discovery to deal close with AI win-probability scoring.
          </p>
        </div>

        {/* Top Telemetry KPI Badges & Add Deal Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass-card px-4 py-2.5 rounded-2xl border border-secondary/30 text-right">
            <div className="text-label-xs uppercase font-semibold text-on-surface-variant">Pipeline Forecast</div>
            <div className="text-kpi-md text-secondary font-mono font-bold">
              {totalValue >= 100000 ? `₹${(totalValue / 100000).toFixed(1)} Lakhs` : formatCurrency(totalValue)}
            </div>
          </div>

          <div className="glass-card px-4 py-2.5 rounded-2xl border border-primary/30 text-right">
            <div className="text-label-xs uppercase font-semibold text-on-surface-variant">Active Deals</div>
            <div className="text-kpi-md text-primary font-mono font-bold">
              {totalDealsCount} Schools
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary py-2.5 px-4 text-body-sm flex items-center gap-1.5 shadow-md"
          >
            <span className="icon text-lg">add_circle</span>
            <span>+ Add School Deal</span>
          </button>
        </div>
      </div>

      {/* Pipeline View Switcher Tabs: Core Pipeline vs AI High-Intent Pipeline */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
        <div className="flex items-center gap-2 p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant/30">
          <button
            onClick={() => setActivePipelineView('core')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-body-sm font-semibold transition-all ${
              activePipelineView === 'core'
                ? 'bg-primary text-on-primary shadow-md'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="icon text-lg">view_kanban</span>
            <span>💼 Core Sales Pipeline</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activePipelineView === 'core' ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container text-on-surface-variant'
            }`}>
              {pipeline.reduce((acc, s) => acc + s.deals.length, 0)}
            </span>
          </button>

          <button
            onClick={() => setActivePipelineView('ai_intent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-body-sm font-semibold transition-all ${
              activePipelineView === 'ai_intent'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="icon text-lg">bolt</span>
            <span>⚡ AI High-Intent Pipeline (70%+)</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activePipelineView === 'ai_intent' ? 'bg-white/20 text-white' : 'bg-surface-container text-on-surface-variant'
            }`}>
              {aiIntentPipeline.reduce((acc, s) => acc + s.deals.length, 0)}
            </span>
          </button>
        </div>

        {activePipelineView === 'ai_intent' ? (
          <div className="flex items-center gap-2 text-label-sm text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3.5 py-1.5 rounded-xl">
            <span className="icon text-purple-400 text-base">auto_awesome</span>
            <span>Fast-track cohort: Schools predicted with high purchase intent by Gemini AI.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-label-sm text-on-surface-variant bg-surface-container-low px-3.5 py-1.5 rounded-xl border border-outline-variant/30">
            <span className="icon text-primary text-base">info</span>
            <span>Demo Scheduled is only unlocked after lead replies or meeting is booked.</span>
          </div>
        )}
      </div>

      {/* Fresh/Empty CRM Pipeline Alert Banner */}
      {totalDealsCount === 0 && !loading && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/10 via-surface-container-low to-secondary/10 border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0">
              <span className="icon text-2xl">verified</span>
            </div>
            <div>
              <div className="text-body-md font-bold text-on-surface flex items-center gap-2">
                <span>CRM Pipeline Is Fresh & Clean (Demo Data Cleared)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Ready for Real Schools
                </span>
              </div>
              <div className="text-body-sm text-on-surface-variant mt-0.5">
                अब आप सिर्फ अपने असली स्कूलों को जोड़ सकते हैं। नए स्कूल को सीधे "+ Add School Deal" से जोड़ें या "School Discovery" से खोजें।
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary py-2 px-3.5 text-body-sm flex items-center gap-1.5 shadow-sm"
            >
              <span className="icon text-base">add</span>
              <span>+ Add Real Deal</span>
            </button>
            <Link
              to="/discovery"
              className="py-2 px-3.5 rounded-xl text-body-sm font-semibold bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface flex items-center gap-1.5 transition-all"
            >
              <span className="icon text-base text-primary">travel_explore</span>
              <span>Discover Schools</span>
            </Link>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest/60 p-3 rounded-2xl border border-outline-variant/30">
        <div className="relative w-full sm:w-80">
          <span className="icon absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter deals by school or city..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-body-sm placeholder:text-on-surface-variant/50 focus:border-primary/60 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs"
            >
              clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-label-sm text-on-surface-variant font-mono">
            Showing {filteredPipeline.reduce((a, s) => a + s.deals.length, 0)} of {totalDealsCount} Deals
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollKanban('left')}
              className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-all flex items-center justify-center"
              title="Scroll Kanban Left"
            >
              <span className="icon text-base">chevron_left</span>
            </button>
            <button
              onClick={() => scrollKanban('right')}
              className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-all flex items-center justify-center"
              title="Scroll Kanban Right"
            >
              <span className="icon text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[45vh] gap-3">
          <span className="icon text-3xl animate-spin text-primary">sync</span>
          <span className="text-body-sm text-on-surface-variant">Loading Sales Kanban Board...</span>
        </div>
      ) : (
        <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scroll-smooth">
          {filteredPipeline.map((stage) => {
            const color = STAGE_COLORS[stage.id] || STAGE_COLORS.discovery
            const stageValue = stage.deals.reduce((acc, d) => acc + d.value, 0)

            return (
              <div
                key={stage.id}
                className="w-[285px] min-w-[275px] shrink-0 glass-panel p-3.5 rounded-2xl border border-outline-variant/30 flex flex-col justify-start min-h-[520px] bg-surface-container-lowest/50"
              >
                {/* Column Stage Header */}
                <div className="pb-3 border-b border-outline-variant/20 mb-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-label-sm font-bold uppercase tracking-wider text-on-surface truncate">
                      {stage.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${color.bg} ${color.text} border ${color.border}`}>
                      {stage.deals.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-label-xs font-mono text-on-surface-variant/70">
                    <span>Stage Value</span>
                    <span className="font-semibold text-secondary">{formatCurrency(stageValue)}</span>
                  </div>
                  <div className={`h-1 w-full rounded-full ${color.bar} opacity-60`} />
                </div>

                {/* Deal Cards in Column */}
                <div className="space-y-3">
                  {stage.deals.length === 0 ? (
                    <div className="p-6 text-center rounded-xl border border-dashed border-outline-variant/20 text-on-surface-variant/50 text-label-sm space-y-2">
                      <span className="icon text-2xl text-on-surface-variant/40 block">inbox</span>
                      <div>No active deals in this stage</div>
                      <button
                        onClick={() => {
                          setNewDeal((prev) => ({ ...prev, stage: stage.id }))
                          setIsAddModalOpen(true)
                        }}
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        + Add deal here
                      </button>
                    </div>
                  ) : (
                    stage.deals.map((deal: Deal) => {
                      const winColor =
                        deal.probability >= 90
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : deal.probability >= 70
                          ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                          : deal.probability >= 50
                          ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'

                      return (
                        <div
                          key={deal.id}
                          className="glass-card p-3.5 rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-all space-y-2.5 relative group shadow-sm hover:shadow-glow-primary/10 overflow-hidden"
                        >
                          {/* Top Row: Win Probability, Delete Button & Deal Amount */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${winColor}`}>
                                {deal.probability}% Win
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleDeleteDeal(deal.id)
                                }}
                                title="Delete Deal"
                                className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all p-0.5"
                              >
                                <span className="icon text-xs">delete</span>
                              </button>
                            </div>
                            <span className="font-mono text-body-sm font-bold text-secondary">
                              {formatCurrency(deal.value)}
                            </span>
                          </div>

                          {/* School Name & Contact Person */}
                          <div>
                            <Link
                              to={`/sales/deals/${deal.id}`}
                              className="text-body-sm font-bold text-on-surface hover:text-primary transition-colors line-clamp-2 block leading-snug"
                              title={deal.schoolName}
                            >
                              {deal.schoolName}
                            </Link>
                            <div className="text-label-sm text-on-surface-variant mt-1 flex items-center justify-between gap-1 truncate">
                              <div className="flex items-center gap-1 truncate">
                                <span className="icon text-xs text-primary">person</span>
                                <span className="truncate">{deal.contactName || 'Principal'}</span>
                              </div>
                              {deal.city && (
                                <span className="text-[10px] text-on-surface-variant/70 shrink-0 font-mono">
                                  📍 {deal.city}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Email Outreach & Reply Status Telemetry Badges */}
                          <div className="space-y-1.5 pt-0.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {deal.emailStatus?.sent ? (
                                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                  <span className="icon text-xs">mark_email_read</span>
                                  <span>Mail Sent ({deal.emailStatus.sentCount})</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleSendColdEmail(deal)
                                  }}
                                  disabled={sendingEmailMap[deal.id]}
                                  title="Click to send initial cold pitch email (2M Free Trial + Slab Pricing). Locked against duplicates!"
                                  className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/35 active:bg-amber-500/40 text-amber-300 border border-amber-500/40 flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-60 shadow-sm"
                                >
                                  <span className="icon text-xs">{sendingEmailMap[deal.id] ? 'sync' : 'mail'}</span>
                                  <span>{sendingEmailMap[deal.id] ? 'Sending...' : 'No Mail Sent'}</span>
                                </button>
                              )}

                              {deal.emailStatus?.hasReplied ? (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 flex items-center gap-1 shadow-sm">
                                  <span className="icon text-xs text-cyan-400 animate-pulse">reply</span>
                                  <span>{deal.emailStatus.replyCategoryLabel || 'Replied!'}</span>
                                </span>
                              ) : deal.emailStatus?.sent ? (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant/80 border border-outline-variant/30 flex items-center gap-1">
                                  <span className="icon text-xs">hourglass_empty</span>
                                  <span>Awaiting Reply</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-container-high/60 text-on-surface-variant/60 border border-outline-variant/20 flex items-center gap-1">
                                  <span className="icon text-xs">schedule</span>
                                  <span>Uncontacted</span>
                                </span>
                              )}
                            </div>

                            {/* Inbound School Reply Snippet */}
                            {deal.emailStatus?.hasReplied && deal.emailStatus.replySnippet && (
                              <div className="text-[11px] bg-cyan-950/40 border border-cyan-500/30 rounded-lg p-2 text-cyan-200 leading-snug flex items-start gap-1.5">
                                <span className="icon text-xs text-cyan-400 shrink-0 mt-0.5">chat_bubble</span>
                                <span className="line-clamp-2 italic">"{deal.emailStatus.replySnippet}"</span>
                              </div>
                            )}
                          </div>

                          {/* Metadata Badges: AI Propensity, Students Strength, Rate Slab & Trial */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {deal.leadScore !== undefined && (
                              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${
                                deal.leadScore >= 70
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                  : 'bg-surface-container-high text-on-surface-variant border-outline-variant/30'
                              }`}>
                                <span className="icon text-[11px]">bolt</span>
                                <span>{deal.leadScore}/100 AI</span>
                              </span>
                            )}
                            {deal.studentCount && (
                              <>
                                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                                  🎓 {deal.studentCount.toLocaleString()}
                                </span>
                                <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25">
                                  ₹{deal.pricing?.ratePerStudentMonth || (deal.studentCount <= 200 ? 8 : deal.studentCount <= 500 ? 7 : deal.studentCount <= 1000 ? 6 : 5)}/mo
                                </span>
                              </>
                            )}
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              🎁 2M Trial
                            </span>
                          </div>

                          {/* Action Footer: 3-Column Action Grid (Email, WhatsApp, Advance) */}
                          <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-outline-variant/20 w-full">
                            {/* Email Action: Pitch (if cold) vs Email (if already sent) */}
                            {!deal.emailStatus?.sent ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleSendColdEmail(deal)
                                }}
                                disabled={sendingEmailMap[deal.id]}
                                title="Send Initial Cold Pitch Email (2M Free Trial + Slab Pricing). Locked against duplicates!"
                                className="w-full justify-center py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all truncate bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/35 text-amber-300 border border-amber-500/30 cursor-pointer disabled:opacity-60"
                              >
                                <span className="icon text-sm">{sendingEmailMap[deal.id] ? 'sync' : 'mail'}</span>
                                <span className="truncate">{sendingEmailMap[deal.id] ? 'Sending...' : 'Pitch'}</span>
                              </button>
                            ) : (
                              <Link
                                to={`/communication?compose=true&email=${encodeURIComponent(deal.email || '')}&school=${encodeURIComponent(deal.schoolName)}`}
                                title="View message thread in Communications"
                                className="w-full justify-center py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all truncate bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25"
                              >
                                <span className="icon text-sm">mail</span>
                                <span className="truncate">Email</span>
                              </Link>
                            )}

                            {/* WhatsApp Direct Button (or Call) */}
                            {isWhatsAppEligible(deal.phone) ? (
                              <a
                                href={(() => {
                                  const rate = deal.pricing?.ratePerStudentMonth || (deal.studentCount && deal.studentCount <= 200 ? 8 : deal.studentCount && deal.studentCount <= 500 ? 7 : deal.studentCount && deal.studentCount <= 1000 ? 6 : 5)
                                  const msg = `Respected ${deal.contactName || 'Principal'} (${deal.schoolName}),\n\nGreetings from EduVault AI.\n\nModernize your school fee collection with 100% Zero Risk:\n\n🛡️ 2 Months Free Trial — 2 महीने चलाकर देखें, पसंद न आए तो ₹0 चार्ज, कोई बॉन्ड नहीं!\n🔄 100% Free Data Migration & Staff Training\n💼 Special Pricing: Just ₹${rate}/student/month.\n\nCan we show you a quick 2-minute live demo?\n\nWarm regards,\nEduVault AI Team`
                                  return getWhatsAppUrl(deal.phone, msg)
                                })()}
                                target="_blank"
                                rel="noreferrer"
                                title="Send 1-Click AI WhatsApp Pitch with 2M Free Trial"
                                className="w-full justify-center py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center gap-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all truncate"
                              >
                                <span className="icon text-sm">chat</span>
                                <span className="truncate">WhatsApp</span>
                              </a>
                            ) : deal.phone ? (
                              <a
                                href={`tel:${deal.phone}`}
                                title={`Landline Phone: ${deal.phone} (No WhatsApp)`}
                                className="w-full justify-center py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center gap-1 bg-surface-variant/40 hover:bg-surface-variant/60 text-on-surface-variant border border-outline-variant/30 transition-all truncate"
                              >
                                <span className="icon text-sm">call</span>
                                <span className="truncate">Call</span>
                              </a>
                            ) : (
                              <span className="w-full justify-center py-1.5 px-1 rounded-lg text-xs text-on-surface-variant/50 border border-outline-variant/15 flex items-center gap-1 truncate opacity-60">
                                <span className="icon text-xs">phone_disabled</span>
                                <span className="truncate">No Phone</span>
                              </span>
                            )}

                            {/* Advance Button (or Won Tag) */}
                            {stage.id !== 'closed_won' && stage.id !== 'ai_won' ? (
                              <button
                                onClick={() => handleMoveStage(deal.id, getNextStage(stage.id))}
                                title="Advance Deal to Next Stage"
                                className="w-full justify-center py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center gap-0.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-all truncate"
                              >
                                <span>Advance</span>
                                <span className="icon text-xs">arrow_forward</span>
                              </button>
                            ) : (
                              <span className="w-full justify-center py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center gap-1 bg-secondary/15 text-secondary border border-secondary/30 truncate">
                                <span>Won 🎉</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: + Add School Deal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-outline-variant/40 space-y-5 animate-scale-in bg-surface-container-lowest">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="icon text-primary text-2xl">add_business</span>
                <h3 className="text-headline-sm font-bold text-on-surface">Add Real School Deal</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="icon text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div>
                <label className="text-body-sm font-semibold text-on-surface block mb-1">
                  School Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDeal.schoolName}
                  onChange={(e) => setNewDeal({ ...newDeal, schoolName: e.target.value })}
                  placeholder="e.g. Delhi Public School"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-body-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-body-sm font-semibold text-on-surface block mb-1">
                    Contact / Principal Name
                  </label>
                  <input
                    type="text"
                    value={newDeal.contactName}
                    onChange={(e) => setNewDeal({ ...newDeal, contactName: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-body-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-body-sm font-semibold text-on-surface block mb-1">
                    WhatsApp / Phone
                  </label>
                  <input
                    type="text"
                    value={newDeal.phone}
                    onChange={(e) => setNewDeal({ ...newDeal, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-body-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-body-sm font-semibold text-on-surface block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newDeal.city}
                    onChange={(e) => setNewDeal({ ...newDeal, city: e.target.value })}
                    placeholder="e.g. Jaipur, Pune, Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-body-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-body-sm font-semibold text-on-surface block mb-1">
                    Student Strength
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={newDeal.studentCount}
                    onChange={(e) => setNewDeal({ ...newDeal, studentCount: parseInt(e.target.value) || 100 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-body-sm outline-none focus:border-primary font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-body-sm font-semibold text-on-surface block mb-1">
                  Pipeline Stage
                </label>
                <select
                  value={newDeal.stage}
                  onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-body-sm outline-none focus:border-primary"
                >
                  <option value="discovery">Discovery (30%)</option>
                  <option value="qualification">Qualification (50%)</option>
                  <option value="demo_scheduled">Demo Scheduled (80%)</option>
                  <option value="proposal_sent">Proposal Sent (90%)</option>
                  <option value="closed_won">Closed Won 🎉 (100%)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-body-sm font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="btn-primary py-2.5 px-5 text-body-sm flex items-center gap-2 shadow-md"
                >
                  <span className="icon text-base">{adding ? 'sync' : 'add'}</span>
                  <span>{adding ? 'Adding...' : 'Add to Pipeline'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enter Missing School Email for Pitch */}
      {emailModal.open && emailModal.deal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-amber-500/40 space-y-4 bg-surface-container-lowest animate-scale-in">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="icon text-amber-400 text-2xl">mark_email_unread</span>
                <h3 className="text-headline-sm font-bold text-on-surface">Send Cold Pitch Email</h3>
              </div>
              <button
                onClick={() => setEmailModal({ open: false, deal: null, email: '' })}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="icon text-xl">close</span>
              </button>
            </div>

            <p className="text-body-sm text-on-surface-variant">
              Target school <b className="text-on-surface">{emailModal.deal.schoolName}</b> does not have an email address on file. Please enter the school or principal email:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (emailModal.deal && emailModal.email.trim()) {
                  handleSendColdEmail(emailModal.deal, emailModal.email.trim())
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-label-sm font-semibold text-on-surface block mb-1">
                  School / Principal Email Address <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="principal@school.edu.in"
                  value={emailModal.email}
                  onChange={(e) => setEmailModal((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-body-sm outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 space-y-1">
                <div className="font-semibold flex items-center gap-1 text-amber-300">
                  <span className="icon text-xs">verified</span>
                  <span>100% Duplicate Send Guard Active</span>
                </div>
                <div>Will dispatch 2-Month Free Trial Offer + Slab Pricing (₹5-₹8) and save email to school. Even if clicked 100 times, duplicate cold emails will never be re-sent.</div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEmailModal({ open: false, deal: null, email: '' })}
                  className="py-2 px-4 rounded-xl text-body-sm font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmailMap[emailModal.deal.id]}
                  className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-body-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span className="icon text-base">{sendingEmailMap[emailModal.deal.id] ? 'sync' : 'send'}</span>
                  <span>{sendingEmailMap[emailModal.deal.id] ? 'Sending...' : 'Send Pitch Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 animate-fade-in max-w-md ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/50'
              : toastMsg.type === 'error'
              ? 'bg-red-950/95 text-red-200 border-red-500/50'
              : 'bg-surface-container-high/95 text-on-surface border-outline-variant/60'
          }`}
        >
          <span className="icon text-xl shrink-0">
            {toastMsg.type === 'success' ? 'check_circle' : toastMsg.type === 'error' ? 'error' : 'info'}
          </span>
          <span className="text-body-sm leading-snug">{toastMsg.text}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="text-on-surface-variant hover:text-on-surface ml-auto shrink-0 p-1"
          >
            <span className="icon text-base">close</span>
          </button>
        </div>
      )}
    </div>
  )
}
