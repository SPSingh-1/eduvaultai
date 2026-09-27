import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { salesApi, Deal } from '@/features/sales/services/sales.api'
import { isWhatsAppEligible, getWhatsAppUrl } from '@/utils/phone'

function getTierDetails(students: number) {
  if (students <= 200) {
    return { rate: 8, label: 'Starter Tier (100–200 Students)', badge: '₹8 / student / mo' }
  } else if (students <= 500) {
    return { rate: 7, label: 'Growth Tier (200–500 Students)', badge: '₹7 / student / mo' }
  } else if (students <= 1000) {
    return { rate: 6, label: 'Standard Tier (500–1000 Students)', badge: '₹6 / student / mo' }
  } else {
    return { rate: 5, label: 'Enterprise Tier (1000+ Students)', badge: '₹5 / student / mo' }
  }
}

export function DealWorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiStrategy, setAiStrategy] = useState<any>(null)
  const [students, setStudents] = useState<number>(1000)
  const [waiveSetupFee, setWaiveSetupFee] = useState<boolean>(false)
  const [billingMode, setBillingMode] = useState<'actual' | 'slab'>('actual')

  const fetchDeal = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await salesApi.getDealById(id)
      setDeal(data)
      if (data.studentCount) {
        setStudents(data.studentCount)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeal()
  }, [id])

  const pricing = useMemo(() => {
    const { rate, label } = getTierDetails(students)
    const slabLimit = students <= 200 ? 200 : students <= 500 ? 500 : students <= 1000 ? 1000 : students
    const billedStudents = billingMode === 'slab' ? slabLimit : students
    const monthlySaaS = billedStudents * rate
    const annualSaaS = monthlySaaS * 12
    const setupFee = waiveSetupFee ? 0 : 5000
    const totalFirstYear = annualSaaS + setupFee

    return {
      rate,
      tierLabel: label,
      slabLimit,
      billedStudents,
      monthlySaaS,
      annualSaaS,
      setupFee,
      totalFirstYear,
    }
  }, [students, waiveSetupFee, billingMode])

  const handleRunAIStrategist = async () => {
    if (!id) return
    setAnalyzing(true)
    try {
      const res = await salesApi.getSalesStrategist(id)
      setAiStrategy(res)
    } catch (e) {
      console.error(e)
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading || !deal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <span className="icon text-3xl animate-spin text-primary">sync</span>
        <span className="text-body-sm text-on-surface-variant">Loading Deal Intelligence Workspace...</span>
      </div>
    )
  }

  // Generate dynamic 1-Click WhatsApp pitch with exact commercial offer and 100% No-Bond Guarantee
  const dynamicWhatsAppUrl = (() => {
    const phone = deal.phone || ''
    let clean = phone.replace(/[^0-9]/g, '')
    if (clean.startsWith('0')) clean = clean.replace(/^0+/, '')
    if (clean.length === 10) clean = `91${clean}`
    if (!clean) clean = '919876543210'

    const msg = `Respected ${deal.contactName || 'Principal'} (${deal.schoolName}),\n\nGreetings from EduVault AI.\n\nModernize ${deal.schoolName}'s fee collections and ERP without financial risk:\n\n🛡️ 2 Months 100% Free Trial — 2 महीने इस्तेमाल करके देखें, अगर अच्छा न लगे तो ₹0 चार्ज, कोई बॉन्ड नहीं!\n🔄 100% Free Data Migration (Old registers/Excel to ERP)\n👨‍🏫 100% Free Staff & Teacher Training\n\n💼 Special Pricing: Just ₹${pricing.rate}/student/month (~₹${pricing.monthlySaaS.toLocaleString('en-IN')}/mo).\n\nCan we schedule a 10-minute live demo this Wednesday to show our automated WhatsApp fee collection?\n\nWarm regards,\nEduVault AI Team`
    return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`
  })()

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Breadcrumb & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Link to="/sales/pipeline" className="text-label-md text-on-surface-variant hover:text-primary flex items-center gap-1">
          <span className="icon text-sm">arrow_back</span>
          <span>Back to Sales Pipeline</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {isWhatsAppEligible(deal.phone) ? (
            <a
              href={dynamicWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-3.5 rounded-xl text-body-sm font-semibold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
              title="Launch 1-Click AI WhatsApp Pitch with 2-Month Free Trial"
            >
              <span className="icon text-base">chat</span>
              <span>WhatsApp Pitch (2M Trial)</span>
            </a>
          ) : deal.phone ? (
            <a
              href={`tel:${deal.phone}`}
              className="py-2 px-3.5 rounded-xl text-body-sm font-semibold flex items-center gap-1.5 bg-surface-variant hover:bg-surface-variant/80 text-on-surface transition-all border border-outline-variant/30"
              title={`Call School Reception: ${deal.phone} (Landline - No WhatsApp)`}
            >
              <span className="icon text-base">call</span>
              <span>Call School</span>
            </a>
          ) : null}

          <button
            onClick={handleRunAIStrategist}
            disabled={analyzing}
            className="btn-ai py-2 px-4 text-body-sm flex items-center gap-2"
          >
            <span className={`icon text-lg ${analyzing ? 'animate-spin' : ''}`}>psychology</span>
            <span>{analyzing ? 'Consulting Sales Strategist AI...' : 'Consult AI Sales Strategist (Hermes 3)'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-outline-variant/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="status-badge primary text-xs">Stage: {deal.stage.replace(/_/g, ' ').toUpperCase()}</span>
              <span className="status-badge active">{deal.probability}% Win Probability</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                🎁 2 Months Free Trial
              </span>
            </div>
            <h1 className="text-display-md font-bold text-on-surface mb-1">{deal.schoolName}</h1>
            <p className="text-body-sm text-on-surface-variant flex items-center gap-2">
              <span className="icon text-base">person</span>
              <span>Contact: {deal.contactName}</span>
              <span>•</span>
              <span className="icon text-base">event</span>
              <span>Expected Close: {deal.expectedClose}</span>
            </p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-secondary/30 text-right">
            <div className="text-label-md uppercase font-semibold text-on-surface-variant">Annual SaaS Contract</div>
            <div className="text-kpi-xl text-secondary font-mono font-bold">
              ₹{(pricing.annualSaaS / 100000).toFixed(2)} Lakhs
            </div>
            <div className="text-[11px] font-mono text-emerald-400 font-semibold mt-0.5">
              @ ₹{pricing.rate}/student/month
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Pricing Engine & Commercial Offer Box */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-primary/30 relative overflow-hidden bg-gradient-to-br from-primary/5 via-surface-container-low to-secondary/5 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="icon text-primary text-2xl">calculate</span>
              <h2 className="text-headline-sm font-bold text-on-surface">Commercial Pricing & Contract Calculator</h2>
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Dynamic per-student rate calculation based on student strength with zero-risk launch hooks.
            </p>
          </div>

          {/* Pricing Slab Indicators */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className={`px-2.5 py-1 rounded-lg border transition-all ${students <= 200 ? 'bg-primary text-white border-primary shadow-sm font-bold' : 'bg-surface-container text-on-surface-variant border-outline-variant/30'}`}>
              100–200: ₹8
            </span>
            <span className={`px-2.5 py-1 rounded-lg border transition-all ${students > 200 && students <= 500 ? 'bg-primary text-white border-primary shadow-sm font-bold' : 'bg-surface-container text-on-surface-variant border-outline-variant/30'}`}>
              200–500: ₹7
            </span>
            <span className={`px-2.5 py-1 rounded-lg border transition-all ${students > 500 && students <= 1000 ? 'bg-primary text-white border-primary shadow-sm font-bold' : 'bg-surface-container text-on-surface-variant border-outline-variant/30'}`}>
              500–1000: ₹6
            </span>
            <span className={`px-2.5 py-1 rounded-lg border transition-all ${students > 1000 ? 'bg-primary text-white border-primary shadow-sm font-bold' : 'bg-surface-container text-on-surface-variant border-outline-variant/30'}`}>
              1000+: ₹5
            </span>
          </div>
        </div>

        {/* Interactive Student Strength Slider & Live Slabs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 space-y-3">
            <div className="flex justify-between items-center text-body-sm">
              <label className="font-semibold text-on-surface flex items-center gap-1.5">
                <span className="icon text-base text-primary">groups</span>
                <span>Active Student Strength</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="10000"
                  step="50"
                  value={students}
                  onChange={(e) => setStudents(Math.max(50, parseInt(e.target.value) || 100))}
                  className="w-24 px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface font-mono font-bold text-right outline-none focus:border-primary"
                />
                <span className="text-xs text-on-surface-variant">students</span>
              </div>
            </div>

            <input
              type="range"
              min="100"
              max="4000"
              step="50"
              value={students}
              onChange={(e) => setStudents(parseInt(e.target.value))}
              className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
            />

            <div className="flex justify-between text-[11px] font-mono text-on-surface-variant">
              <span>100 (₹8/std)</span>
              <span>500 (₹7/std)</span>
              <span>1000 (₹6/std)</span>
              <span>4000+ (₹5/std)</span>
            </div>

            <div className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant/30 flex items-center justify-between text-body-sm">
              <span className="text-on-surface-variant">Active Pricing Tier:</span>
              <span className="font-bold text-primary">{pricing.tierLabel}</span>
            </div>

            {/* Billing Mode Switcher: Actual Count vs Upper Slab Package */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold uppercase text-on-surface-variant/70">Billing Calculation Method</div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-high/80 rounded-xl border border-outline-variant/30 text-xs">
                <button
                  type="button"
                  onClick={() => setBillingMode('actual')}
                  className={`py-2 px-2.5 rounded-lg font-bold flex flex-col items-center gap-0.5 transition-all ${billingMode === 'actual' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  <span>🎯 Actual Enrolled Count</span>
                  <span className="text-[10px] opacity-80">{students} × ₹{pricing.rate} = ₹{(students * pricing.rate).toLocaleString('en-IN')}/mo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBillingMode('slab')}
                  className={`py-2 px-2.5 rounded-lg font-bold flex flex-col items-center gap-0.5 transition-all ${billingMode === 'slab' ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  <span>📦 Upper Slab Pack</span>
                  <span className="text-[10px] opacity-80">Up to {pricing.slabLimit} × ₹{pricing.rate} = ₹{(pricing.slabLimit * pricing.rate).toLocaleString('en-IN')}/mo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Financials Breakdown */}
          <div className="md:col-span-6 grid grid-cols-2 gap-3">
            <div className="glass-card p-3.5 rounded-xl border border-outline-variant/30">
              <div className="text-label-xs uppercase font-semibold text-on-surface-variant">Per Student Rate</div>
              <div className="text-headline-sm font-mono font-bold text-primary mt-1">₹{pricing.rate} <span className="text-xs font-normal text-on-surface-variant">/mo</span></div>
              <div className="text-[11px] text-on-surface-variant/80 mt-0.5">Billed on {pricing.billedStudents} students</div>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-outline-variant/30">
              <div className="text-label-xs uppercase font-semibold text-on-surface-variant">Monthly SaaS Billing</div>
              <div className="text-headline-sm font-mono font-bold text-secondary mt-1">₹{pricing.monthlySaaS.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-on-surface-variant/80 mt-0.5">₹{(pricing.monthlySaaS / 1000).toFixed(1)}k / month</div>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-outline-variant/30">
              <div className="text-label-xs uppercase font-semibold text-on-surface-variant">Annual SaaS (12 Mo)</div>
              <div className="text-headline-sm font-mono font-bold text-on-surface mt-1">₹{pricing.annualSaaS.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-secondary font-semibold mt-0.5">₹{(pricing.annualSaaS / 100000).toFixed(2)} Lakhs / year</div>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-outline-variant/30 relative">
              <div className="flex items-center justify-between">
                <div className="text-label-xs uppercase font-semibold text-on-surface-variant">Setup / Impl. Fee</div>
                <button
                  type="button"
                  onClick={() => setWaiveSetupFee(!waiveSetupFee)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-all ${waiveSetupFee ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30'}`}
                  title="Toggle fee waiver as closing incentive"
                >
                  {waiveSetupFee ? 'Waived (FREE)' : 'Waive Fee?'}
                </button>
              </div>
              <div className={`text-headline-sm font-mono font-bold mt-1 ${waiveSetupFee ? 'line-through text-on-surface-variant/50' : 'text-warning'}`}>
                ₹5,000
              </div>
              <div className="text-[11px] text-on-surface-variant/80 mt-0.5">
                {waiveSetupFee ? '✨ 100% Waived for early sign-up' : 'One-time onboarding fee'}
              </div>
            </div>
          </div>
        </div>

        {/* 100% Zero-Risk No-Bond Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <span className="icon text-emerald-400 text-2xl">verified_user</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-body-md font-bold text-on-surface">
                  2 महीने चलाकर देखें — पसंद न आए तो ₹0 चार्ज, कोई बॉन्ड नहीं!
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Zero-Risk Guarantee
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-0.5">
                60 दिन का पूरा लाइव इस्तेमाल बिना किसी कानूनी बॉन्ड या एडवांस चेक के। अगर स्कूल संतुष्ट न हो, तो बिना कोई सवाल पूछे ₹0 पेमेंट पर कैंसिलेशन।
              </p>
            </div>
          </div>
          <span className="shrink-0 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            🛡️ No Lock-In Contract
          </span>
        </div>

        {/* The 4 No-Brainer Closing Hooks Included in Every Deal */}
        <div className="pt-2 border-t border-outline-variant/20">
          <div className="text-label-xs uppercase font-bold tracking-wider text-on-surface-variant mb-2.5">
            Included Risk-Free Commercial Hooks (Guaranteed)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
              <span className="icon text-xl text-emerald-400">card_giftcard</span>
              <div>
                <div className="text-xs font-bold text-emerald-300">2 Months Free Trial</div>
                <div className="text-[11px] text-on-surface-variant">Zero upfront payment</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2.5">
              <span className="icon text-xl text-cyan-400">sync_alt</span>
              <div>
                <div className="text-xs font-bold text-cyan-300">Free Data Migration</div>
                <div className="text-[11px] text-on-surface-variant">Excel / Old DB imported</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2.5">
              <span className="icon text-xl text-purple-400">school</span>
              <div>
                <div className="text-xs font-bold text-purple-300">Free Staff Training</div>
                <div className="text-[11px] text-on-surface-variant">Teachers & clerks certified</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5">
              <span className="icon text-xl text-amber-400">verified</span>
              <div>
                <div className="text-xs font-bold text-amber-300">₹5,000 Setup (Waivable)</div>
                <div className="text-[11px] text-on-surface-variant">Negotiation closing hook</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Deal Modules + Gemini AI Sales Strategist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols — Included ERP Modules */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-primary text-xl">inventory_2</span>
            <span>Licensed EduVault Modules</span>
          </h2>

          <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-3">
            {(deal.modules || ['School ERP', 'WhatsApp Fees']).map((module, idx) => (
              <div key={idx} className="glass-card p-3 rounded-xl flex items-center gap-3">
                <span className="icon text-primary text-xl">check_circle</span>
                <span className="text-body-sm font-bold text-on-surface">{module}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 7 Cols — Hermes 3 AI Sales Strategist Report */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-tertiary text-xl">smart_toy</span>
            <span>AI Sales Strategist Advice (Hermes 3 AI)</span>
          </h2>

          {aiStrategy ? (
            <div className="glass-panel p-6 rounded-2xl border border-tertiary/30 space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div>
                  <div className="text-label-sm uppercase font-semibold text-on-surface-variant">Calculated Win Odds</div>
                  <div className="text-kpi-md font-mono font-bold text-secondary">{aiStrategy.winProbability}%</div>
                </div>
              </div>

              <div>
                <div className="text-label-sm font-semibold uppercase text-error mb-1">Closing Risk / Blocker</div>
                <p className="text-body-sm text-on-surface bg-error-container/10 p-3 rounded-xl border border-error/20">
                  {aiStrategy.closingBlocker}
                </p>
              </div>

              <div>
                <div className="text-label-sm font-semibold uppercase text-primary mb-1">Recommended Closing Tactic</div>
                <p className="text-body-sm text-on-surface bg-primary-container/10 p-3 rounded-xl border border-primary/20">
                  {aiStrategy.recommendedTactic}
                </p>
              </div>

              <div>
                <div className="text-label-sm font-semibold uppercase text-warning mb-1">Incentive Strategy</div>
                <p className="text-body-sm text-on-surface bg-warning/10 p-3 rounded-xl border border-warning/20">
                  {aiStrategy.discountStrategy}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 rounded-2xl text-center space-y-3">
              <span className="icon text-4xl text-tertiary block">auto_awesome</span>
              <div className="text-body-md font-semibold text-on-surface">No Closing Strategy Generated Yet</div>
              <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
                Click "Consult AI Sales Strategist" above to analyze risks and get an AI-powered deal closing strategy tailored to the 2-month free trial.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
