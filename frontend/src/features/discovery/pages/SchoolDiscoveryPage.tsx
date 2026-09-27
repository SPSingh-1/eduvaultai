import { useState, useEffect } from 'react'
import { schoolsApi } from '@/features/schools/services/schools.api'
import { isWhatsAppEligible, getWhatsAppUrl } from '@/utils/phone'

const CITY_LOCALITIES: Record<string, string[]> = {
  Jaipur: [
    'Gandhi Nagar',
    'Vaishali Nagar',
    'Durgapura',
    'Malviya Nagar',
    'Mansarovar',
    'Raja Park',
    'C-Scheme',
    'Jagatpura',
    'Tonk Road',
    'Sodala',
    'Nirman Nagar',
    'Bani Park',
  ],
  Pune: ['Kothrud', 'Viman Nagar', 'Baner', 'Wakad', 'Hadapsar', 'Aundh', 'Shivaji Nagar', 'Hinjewadi', 'Koregaon Park'],
  Delhi: ['South Delhi', 'Dwarka', 'Rohini', 'Vasant Kunj', 'Pitampura', 'Janakpuri', 'Saket', 'Lajpat Nagar'],
  Bengaluru: ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Electronic City', 'JP Nagar'],
  Mumbai: ['Andheri East', 'Bandra West', 'Powai', 'Borivali West', 'Juhu', 'Thane West', 'Navi Mumbai'],
  Ahmedabad: ['Satellite', 'Bodakdev', 'Navrangpura', 'Prahlad Nagar', 'Bopal', 'SG Highway'],
  Lucknow: ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Mahanagar'],
  Chandigarh: ['Sector 17', 'Sector 35', 'Sector 44', 'Mohali Phase 7', 'Panchkula Sector 11'],
}

const SCHOOL_TYPES = [
  { id: 'all', label: 'All School Types (Default)', icon: 'apps' },
  { id: 'private', label: 'Private Schools', icon: 'domain' },
  { id: 'cbse', label: 'CBSE', icon: 'school' },
  { id: 'icse', label: 'ICSE', icon: 'auto_stories' },
  { id: 'international', label: 'International', icon: 'public' },
  { id: 'state_board', label: 'State Board', icon: 'account_balance' },
]

export function SchoolDiscoveryPage() {
  const [city, setCity] = useState('Jaipur')
  const [area, setArea] = useState('')
  const [schoolType, setSchoolType] = useState('all')
  const [loading, setLoading] = useState(false)
  const [discoveredSchools, setDiscoveredSchools] = useState<any[]>([])
  const [savedIds, setSavedIds] = useState<Record<number, boolean>>({})
  const [hasSearched, setHasSearched] = useState(false)
  const [qualifyingAll, setQualifyingAll] = useState(false)
  const [dbSchoolsCount, setDbSchoolsCount] = useState<number>(76)
  const [autoEmailSending, setAutoEmailSending] = useState(false)
  const [outreachStatusMsg, setOutreachStatusMsg] = useState<string | null>(null)

  const [visibleCount, setVisibleCount] = useState(10)
  const [targetedStats, setTargetedStats] = useState<{
    cities: Record<string, number>
    areas: Record<string, number>
  }>({ cities: {}, areas: {} })
  const [searchTargetSummary, setSearchTargetSummary] = useState<{
    allTargeted: boolean
    targetedCount: number
    count: number
  } | null>(null)

  // Autonomous Agent Auto-Pilot State
  const [autoPilotRunning, setAutoPilotRunning] = useState(false)
  const [agentStep, setAgentStep] = useState(0)
  const [agentLogs, setAgentLogs] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // 1. Restore previous discovery state on mount from localStorage (prevents vanishing on refresh)
  useEffect(() => {
    try {
      const cached = localStorage.getItem('eduvault_discovery_cache')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.discoveredSchools && parsed.discoveredSchools.length > 0) {
          setDiscoveredSchools(parsed.discoveredSchools)
          setCity(parsed.city || 'Jaipur')
          setArea(parsed.area || '')
          setSchoolType(parsed.schoolType || 'all')
          setSavedIds(parsed.savedIds || {})
          setAgentLogs(parsed.agentLogs || [])
          setHasSearched(true)
        }
      }
    } catch {
      // ignore
    }

    // Fetch live persistent count from DB
    schoolsApi.list({ limit: 1 }).then((res) => {
      setDbSchoolsCount(res.meta?.total ?? 0)
    }).catch(() => {
      setDbSchoolsCount(0)
    })

    // Fetch targeted counts by city & locality
    schoolsApi.getTargetedStats().then((res) => {
      if (res?.success) {
        setTargetedStats({ cities: res.cities || {}, areas: res.areas || {} })
      }
    }).catch(() => {})
  }, [])

  const handleResetDiscovery = () => {
    try {
      localStorage.removeItem('eduvault_discovery_cache')
    } catch {
      // ignore
    }
    setDiscoveredSchools([])
    setSavedIds({})
    setAgentLogs([])
    setHasSearched(false)
    setAutoPilotResult(null)
    setOutreachStatusMsg(null)
  }


  // 2. Persist state whenever schools or search parameters change
  useEffect(() => {
    if (discoveredSchools.length > 0) {
      try {
        localStorage.setItem(
          'eduvault_discovery_cache',
          JSON.stringify({
            discoveredSchools,
            city,
            area,
            schoolType,
            savedIds,
            agentLogs,
          })
        )
      } catch {
        // ignore
      }
    }
  }, [discoveredSchools, savedIds, city, area, schoolType, agentLogs])

  const handleSearch = async (e?: React.FormEvent, overrideCity?: string, overrideArea?: string) => {
    if (e) e.preventDefault()
    const targetCity = overrideCity !== undefined ? overrideCity : city
    const targetArea = overrideArea !== undefined ? overrideArea : area

    if (!targetCity.trim()) return

    setLoading(true)
    setHasSearched(true)
    setVisibleCount(10)
    try {
      const res = await schoolsApi.discoverByCity({
        city: targetCity.trim(),
        area: targetArea.trim(),
        schoolType,
      })
      const schools = res.data || []
      setDiscoveredSchools(schools)

      const markSaved: Record<number, boolean> = {}
      schools.forEach((item: any, idx: number) => {
        if (item.isTargeted || item.isSaved) {
          markSaved[idx] = true
        }
      })
      setSavedIds(markSaved)
      setSearchTargetSummary({
        allTargeted: res.allTargeted || (schools.length > 0 && Object.keys(markSaved).length === schools.length),
        targetedCount: res.targetedCount || Object.keys(markSaved).length,
        count: res.count || schools.length,
      })
    } catch (err) {
      console.error('Discovery search error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-trigger search when type filter changes if search was already done
  useEffect(() => {
    if (hasSearched) {
      handleSearch(undefined, city, area)
    }
  }, [schoolType])

  const [autoPilotResult, setAutoPilotResult] = useState<any>(null)

  const handleRunAutoPilot = async () => {
    if (!city.trim()) return
    setAutoPilotRunning(true)
    setAgentStep(1)
    setAutoPilotResult(null)
    setVisibleCount(10)
    setAgentLogs([`🕵️ Agent 1 (Discovery Agent): Initiating Google Maps Places scan for ${area ? `${area}, ${city}` : city}...`])

    try {
      // Step 2 timer simulation for live UX
      setTimeout(() => {
        setAgentStep(2)
        setAgentLogs((prev) => [
          ...prev,
          `📞 Agent 2 (Contact Intelligence): Extracting official phone numbers, addresses & website domains...`,
        ])
      }, 1200)

      setTimeout(() => {
        setAgentStep(3)
        setAgentLogs((prev) => [
          ...prev,
          `🧠 Agent 3 (AI ICP Intelligence Agent): Evaluating ICP fit scores & student potential with Hermes 3...`,
        ])
      }, 2400)

      const result = await schoolsApi.runAutoPilot({
        city: city.trim(),
        area: area.trim(),
        schoolType,
      })

      setAgentStep(4)
      setDiscoveredSchools(result.discovered || [])
      setHasSearched(true)
      setAutoPilotResult(result)

      const markSaved: Record<number, boolean> = {}
      ;(result.discovered || []).forEach((_: any, idx: number) => {
        markSaved[idx] = true
      })
      setSavedIds(markSaved)


      setAgentLogs(
        result.agentLogs || [
          `⚡ Agent 4 (Pipeline Agent): Successfully added ${result.autoQualifiedCount || 0} discovery leads to CRM Pipeline!`,
        ]
      )

      // Refresh DB counter
      const listRes = await schoolsApi.list({ limit: 1 })
      if (listRes.meta?.total) setDbSchoolsCount(listRes.meta.total)
    } catch (err) {
      console.error('Auto-Pilot error:', err)
      setAgentLogs((prev) => [...prev, `❌ Auto-Pilot error: Could not complete full workflow. Check backend status.`])
    } finally {
      setTimeout(() => {
        setAutoPilotRunning(false)
      }, 1000)
    }
  }

  // Autonomous Cold Email Dispatcher Trigger
  const handleAutoSendEmails = async () => {
    setAutoEmailSending(true)
    setOutreachStatusMsg(null)
    try {
      const res = await schoolsApi.autoOutreach({ schools: discoveredSchools })
      if (res.sentCount && res.sentCount > 0) {
        setOutreachStatusMsg(
          `🚀 Dispatched personalized cold emails to ${res.sentCount} new school(s)!${
            res.skippedCount ? ` (🛡️ ${res.skippedCount} already-contacted school(s) were protected from duplicate cold emails)` : ''
          } Pitch includes 2-Month Free Trial, No-Bond guarantee & ₹5-₹8 pricing.`
        )
      } else if (res.skippedCount && res.skippedCount > 0) {
        setOutreachStatusMsg(
          `🛡️ Duplicate Protection Active: All ${res.skippedCount} school(s) have already received their initial cold outreach email. No repeated cold emails sent!`
        )
      } else {
        setOutreachStatusMsg(`⚠️ ${res.message || 'No schools with verified email IDs found for automated dispatch.'}`)
      }
    } catch (err) {
      console.error('Auto-outreach error:', err)
      setOutreachStatusMsg(`❌ Failed to send emails: ${(err as Error).message}`)
    } finally {
      setAutoEmailSending(false)
    }
  }


  const handleSaveToPipeline = async (school: any, index: number) => {
    try {
      setSavedIds((prev) => ({ ...prev, [index]: true }))
      await schoolsApi.saveDiscovered({
        name: school.name,
        city: school.city || city || 'Unknown',
        area: school.area || area,
        website: school.website,
        phone: school.phone,
        email: school.email,
        type: school.type || 'cbse',
        studentCount: school.studentCount || 500,
        address: school.address,
      })
      // Refresh count & stats
      const listRes = await schoolsApi.list({ limit: 1 })
      if (listRes.meta?.total) setDbSchoolsCount(listRes.meta.total)
      schoolsApi.getTargetedStats().then((res) => {
        if (res?.success) {
          setTargetedStats({ cities: res.cities || {}, areas: res.areas || {} })
        }
      }).catch(() => {})
    } catch (err) {
      console.error(err)
    }
  }

  const handleQualifyAll = async () => {
    setQualifyingAll(true)
    try {
      for (let i = 0; i < discoveredSchools.length; i++) {
        if (!savedIds[i]) {
          await handleSaveToPipeline(discoveredSchools[i], i)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setQualifyingAll(false)
    }
  }

  const handleCopyPhone = (phone: string, index: number) => {
    navigator.clipboard.writeText(phone)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const currentLocalities = CITY_LOCALITIES[city] || ['Central', 'North Region', 'South Region', 'East Zone', 'West Zone']

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">travel_explore</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              Live Google Places & AI Agent Discovery
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              PostgreSQL Active: {dbSchoolsCount} Saved
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">School Discovery & Intelligence</h1>
          <p className="text-body-sm text-on-surface-variant">
            Target <b>all schools</b> across any city & locality with <b>verified contact numbers</b>, automated AI agent flow & autonomous cold emailing.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleAutoSendEmails}
            disabled={autoEmailSending || loading}
            title="Auto-send personalized cold emails featuring 2-Month Free Trial and ₹5-₹8 pricing"
            className="px-4 py-2.5 rounded-xl text-body-sm font-bold bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/30 flex items-center gap-2 transition-all shadow-sm"
          >
            <span className={`icon text-lg ${autoEmailSending ? 'animate-spin' : ''}`}>
              {autoEmailSending ? 'sync' : 'forward_to_inbox'}
            </span>
            <span>{autoEmailSending ? 'AI Dispatching...' : '🚀 AI Auto-Send Cold Emails'}</span>
          </button>

          {hasSearched && (
            <button
              onClick={handleResetDiscovery}
              title="Clear screen and start a fresh discovery"
              className="px-3.5 py-2.5 rounded-xl text-body-sm font-semibold glass-card border-outline-variant/30 text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-all"
            >
              <span className="icon text-base">restart_alt</span>
              <span>Fresh Search</span>
            </button>
          )}

          <button
            onClick={handleRunAutoPilot}
            disabled={autoPilotRunning || loading}
            className="btn-ai py-2.5 px-5 text-body-sm font-bold flex items-center gap-2 shadow-glow-primary self-start md:self-auto"
          >
            <span className={`icon text-xl ${autoPilotRunning ? 'animate-spin' : ''}`}>auto_mode</span>
            <span>{autoPilotRunning ? 'Executing Flow...' : '⚡ Run Autonomous Agent Flow'}</span>
          </button>

        </div>
      </div>

      {/* Outreach Status Feedback Alert Banner */}
      {outreachStatusMsg && (
        <div className="glass-panel p-4 rounded-2xl border border-secondary/40 bg-secondary/10 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="icon text-secondary text-xl">mark_email_read</span>
            <span className="text-body-sm text-on-surface font-medium">{outreachStatusMsg}</span>
          </div>
          <button
            onClick={() => setOutreachStatusMsg(null)}
            className="text-on-surface-variant hover:text-on-surface p-1"
          >
            <span className="icon text-sm">close</span>
          </button>
        </div>
      )}


      {/* Filter Section: School Type Tabs */}
      <div className="glass-panel p-4 rounded-2xl border border-outline-variant/30 space-y-2">
        <label className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider block">
          Target School Category (Flexible Filter):
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {SCHOOL_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSchoolType(t.id)}
              className={`px-3.5 py-2 rounded-xl text-label-md font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                schoolType === t.id
                  ? 'bg-primary text-white font-semibold shadow-glow-primary'
                  : 'glass-card border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="icon text-sm">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location Selector: City + Sub-Area / Locality */}
      <div className="glass-panel p-5 rounded-2xl border border-outline-variant/30 space-y-4">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* City Input */}
          <div className="relative">
            <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">Target City:</label>
            <div className="relative">
              <input
                type="text"
                required
                value={city}
                onChange={(e) => {
                  setCity(e.target.value)
                  setArea('')
                }}
                placeholder="Enter city (e.g. Jaipur, Pune)..."
                className="glass-input w-full pl-10 h-11"
              />
              <span className="icon text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 text-lg">location_city</span>
            </div>
          </div>

          {/* Sub-Area / Locality Input */}
          <div className="relative">
            <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
              Locality / Major Area (Optional):
            </label>
            <div className="relative">
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Gandhi Nagar, Vaishali Nagar..."
                className="glass-input w-full pl-10 h-11"
              />
              <span className="icon text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 text-lg">pin_drop</span>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button type="submit" disabled={loading || !city.trim()} className="btn-primary h-11 w-full flex items-center justify-center gap-2 font-semibold">
              <span className={`icon text-lg ${loading ? 'animate-spin' : ''}`}>search</span>
              <span>{loading ? 'Scanning Google Places...' : `Search Schools in ${area || city}`}</span>
            </button>
          </div>
        </form>

        {/* Quick City Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-outline-variant/20">
          <span className="text-label-md text-on-surface-variant font-mono mr-1">Cities:</span>
          {['Jaipur', 'Pune', 'Delhi', 'Bengaluru', 'Mumbai', 'Ahmedabad', 'Lucknow', 'Chandigarh'].map((c) => {
            const targetedCount = targetedStats.cities[c] || 0
            return (
              <button
                key={c}
                onClick={() => {
                  setCity(c)
                  setArea('')
                  handleSearch(undefined, c, '')
                }}
                className={`px-3 py-1 rounded-full text-label-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  city === c
                    ? 'bg-primary-container text-white border border-primary/40 font-bold'
                    : 'glass-card text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{c}</span>
                {targetedCount > 0 && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {targetedCount} ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Dynamic Locality / Sub-Area Chips for Active City */}
        <div className="space-y-1.5 pt-2 border-t border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-semibold text-secondary flex items-center gap-1">
              <span className="icon text-sm">explore</span>
              <span>Major Sub-Areas & Localities in {city}:</span>
            </span>
            {area && (
              <button
                onClick={() => {
                  setArea('')
                  handleSearch(undefined, city, '')
                }}
                className="text-label-sm text-primary hover:underline flex items-center gap-0.5"
              >
                <span className="icon text-xs">close</span> Clear Locality Filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {currentLocalities.map((loc) => {
              const isSelected = area === loc
              const locLower = loc.toLowerCase()
              const isCovered = (targetedStats.areas[locLower] || 0) > 0
              return (
                <button
                  key={loc}
                  onClick={() => {
                    setArea(loc)
                    handleSearch(undefined, city, loc)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-label-md font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-secondary text-white shadow-glow-secondary font-bold'
                      : 'glass-card border border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:border-secondary/40'
                  }`}
                >
                  <span className="icon text-xs">place</span>
                  <span>{loc}</span>
                  {isCovered && (
                    <span className="text-[10px] font-bold text-emerald-400">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Autonomous Agent Live Execution Suite */}
      {(autoPilotRunning || agentLogs.length > 0) && (
        <div className="glass-panel p-6 rounded-2xl border border-primary/40 space-y-4 animate-fade-in bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="icon text-primary text-2xl animate-pulse">smart_toy</span>
              <h3 className="text-headline-sm font-bold text-on-surface">Autonomous AI Agent Execution Pipeline</h3>
            </div>
            <span className="status-badge active font-mono">
              {agentStep === 5 ? 'Pipeline Finished' : `Executing Stage ${agentStep}/5`}
            </span>
          </div>

          {/* 5 Agent Stage Indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { num: 1, title: 'Live Places Discovery', icon: 'travel_explore', desc: 'Google Maps Places API' },
              { num: 2, title: 'Contact Intelligence', icon: 'contact_phone', desc: 'Phone, Address & Domain' },
              { num: 3, title: 'AI ICP Intelligence', icon: 'psychology', desc: 'Hermes 3 ICP Fit Scoring' },
              { num: 4, title: 'Pipeline Integration', icon: 'add_to_photos', desc: 'Lead Creation & CRM Sync' },
              { num: 5, title: 'Autonomous Outreach', icon: 'mark_email_read', desc: 'Cold Pitch with 2M Free Trial' },
            ].map((stg) => {
              const isActive = agentStep === stg.num
              const isDone = agentStep > stg.num
              return (
                <div
                  key={stg.num}
                  className={`p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-primary-container/20 border-primary text-primary shadow-glow-primary'
                      : isDone
                      ? 'bg-secondary/10 border-secondary/40 text-secondary'
                      : 'glass-card border-outline-variant/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`icon text-lg ${isActive ? 'animate-spin' : ''}`}>{isDone ? 'check_circle' : stg.icon}</span>
                    <span className="text-label-md font-bold">{stg.title}</span>
                  </div>
                  <p className="text-label-sm text-on-surface-variant">{stg.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Logs Terminal Output */}
          <div className="bg-surface-dark p-4 rounded-xl font-mono text-label-sm space-y-1.5 border border-outline-variant/30 text-secondary max-h-36 overflow-y-auto">
            {agentLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-on-surface-variant/40">{i + 1}.</span>
                <span>{log}</span>
              </div>
            ))}
          </div>

          {/* ✅ Completion Summary — shown after all 4 stages done */}
          {agentStep === 4 && autoPilotResult && (
            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/30 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <span className="icon text-secondary text-xl">check_circle</span>
                <span className="text-body-md font-bold text-on-surface">Autonomous Agent Flow Complete!</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="glass-card p-3 rounded-xl text-center">
                  <div className="text-kpi-md font-mono font-bold text-primary">{autoPilotResult.discoveredCount || 0}</div>
                  <div className="text-label-sm text-on-surface-variant">Schools Found</div>
                </div>
                <div className="glass-card p-3 rounded-xl text-center">
                  <div className="text-kpi-md font-mono font-bold text-secondary">{autoPilotResult.schoolsSaved || autoPilotResult.discoveredCount || 0}</div>
                  <div className="text-label-sm text-on-surface-variant">
                    {autoPilotResult.newlyCreated !== undefined
                      ? `Active in CRM (${autoPilotResult.newlyCreated} new + ${autoPilotResult.existingSynced} synced)`
                      : 'Schools Active in CRM'}
                  </div>
                </div>
                <div className="glass-card p-3 rounded-xl text-center">
                  <div className="text-kpi-md font-mono font-bold text-tertiary">{autoPilotResult.contactsCreated || 0}</div>
                  <div className="text-label-sm text-on-surface-variant">Contacts Enriched</div>
                </div>
                <div className="glass-card p-3 rounded-xl text-center">
                  <div className="text-kpi-md font-mono font-bold text-on-surface">{autoPilotResult.autoQualifiedCount || autoPilotResult.discoveredCount || 0}</div>
                  <div className="text-label-sm text-on-surface-variant">Leads in Pipeline</div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <a href="/schools" className="btn-secondary py-2 px-4 text-body-sm flex items-center gap-2">
                  <span className="icon text-base">school</span>
                  <span>View School Directory</span>
                </a>
                <a href="/sales/pipeline" className="btn-primary py-2 px-4 text-body-sm flex items-center gap-2">
                  <span className="icon text-base">view_kanban</span>
                  <span>View Sales Pipeline</span>
                </a>
                <a href="/leads" className="btn-ghost py-2 px-4 text-body-sm flex items-center gap-2">
                  <span className="icon text-base">psychology</span>
                  <span>View Lead Intelligence</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Discovered Schools Grid Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
              <span className="icon text-secondary text-xl">view_list</span>
              <span>
                {city
                  ? `Discovered Schools in ${area ? `${area}, ${city}` : city} (${discoveredSchools.length})`
                  : 'Discovered School Targets'}
              </span>
            </h2>
            <p className="text-label-md text-on-surface-variant">
              Targeting <b>all school levels & categories</b>. Real contact numbers verified via Google Maps Places API.
            </p>
          </div>

          {discoveredSchools.length > 0 && (
            (() => {
              const allSaved = discoveredSchools.length > 0 && Object.keys(savedIds).length >= discoveredSchools.length
              return (
                <button
                  onClick={handleQualifyAll}
                  disabled={qualifyingAll || allSaved}
                  className={`py-2.5 px-4 text-body-sm font-semibold flex items-center gap-2 self-start rounded-xl transition-all ${
                    allSaved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default shadow-sm'
                      : 'btn-ai cursor-pointer'
                  }`}
                >
                  <span className={`icon text-lg ${qualifyingAll ? 'animate-spin' : ''}`}>
                    {qualifyingAll ? 'sync' : allSaved ? 'verified' : 'playlist_add'}
                  </span>
                  <span>
                    {qualifyingAll
                      ? 'Adding All to Pipeline...'
                      : allSaved
                      ? `✔ All ${discoveredSchools.length} Targeted & Qualified`
                      : `+ Qualify All ${discoveredSchools.length} Schools`}
                  </span>
                </button>
              )
            })()
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card p-5 rounded-2xl h-52 shimmer"></div>
            ))}
          </div>
        ) : !hasSearched ? (
          <div className="glass-panel p-12 text-center rounded-2xl text-on-surface-variant space-y-3">
            <span className="icon text-4xl text-primary/40 block">travel_explore</span>
            <div className="text-body-md font-bold text-on-surface">Select a City & Locality to Discover Schools</div>
            <p className="text-body-sm max-w-md mx-auto text-xs">
              Search <b>Jaipur (Gandhi Nagar, Vaishali Nagar, Durgapura)</b> or any city to find real school listings with verified phone numbers & addresses.
            </p>
          </div>
        ) : discoveredSchools.length === 0 ? (
          <div className="glass-panel p-10 text-center rounded-2xl text-on-surface-variant space-y-2">
            <span className="icon text-3xl text-on-surface-variant/40 block">search_off</span>
            <div className="text-body-md font-bold text-on-surface">No Schools Found in {area ? `${area}, ${city}` : city}</div>
            <p className="text-body-sm text-xs">Try selecting a different locality or changing the school category filter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 100% City/Locality Targeted Completion Banner */}
            {(searchTargetSummary?.allTargeted || (discoveredSchools.length > 0 && Object.keys(savedIds).length >= discoveredSchools.length)) && (
              <div className="glass-panel p-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-scale-in">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <span className="icon text-2xl text-emerald-400">task_alt</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-body-md font-bold text-emerald-300">
                        All {discoveredSchools.length} Schools in {area ? `${area}, ${city}` : city} Are 100% Targeted & AI-Qualified!
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-500/40">
                        Completed ✓
                      </span>
                    </div>
                    <p className="text-label-sm text-emerald-200/70 mt-0.5">
                      Saare schools discover hokar CRM pipeline me successfully add aur AI-qualify ho chuke hain! Ready for Outreach.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleAutoSendEmails}
                    disabled={autoEmailSending}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-neutral-950 flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <span className="icon text-sm">forward_to_inbox</span>
                    <span>Cold Outreach</span>
                  </button>
                  <a
                    href="/sales/pipeline"
                    className="px-4 py-2 rounded-xl text-xs font-bold glass-card border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <span className="icon text-sm">view_kanban</span>
                    <span>Sales Pipeline</span>
                  </a>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discoveredSchools.slice(0, visibleCount).map((school, index) => {
                const isSmallMidPriority = school.studentCount >= 50 && school.studentCount <= 1000
                const hasVerifiedPhone = school.phoneStatus === 'verified' && school.phone

                return (
                  <div
                    key={index}
                    className={`glass-card p-5 rounded-2xl border flex flex-col justify-between transition-all space-y-4 ${
                      savedIds[index]
                        ? 'border-secondary/50 bg-secondary/5'
                        : isSmallMidPriority
                        ? 'border-primary/40 hover:border-primary'
                        : 'border-outline-variant/30 hover:border-primary/40'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`status-badge ${isSmallMidPriority ? 'active' : 'primary'} uppercase text-label-xs`}>
                            {school.type ? school.type.toUpperCase() : 'SCHOOL'}
                          </span>
                          {savedIds[index] && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                              <span className="icon text-[11px]">bolt</span>
                              <span>{school.leadScore || 85}/100 AI Fit</span>
                            </span>
                          )}
                        </div>

                        <span className="text-label-md font-mono text-secondary flex items-center gap-1 font-bold">
                          {school.studentCount} Students
                        </span>
                      </div>

                      {/* School Name */}
                      <h3 className="text-body-md font-bold text-on-surface line-clamp-2 mb-1.5">{school.name}</h3>

                      {/* Locality & Address */}
                      <div className="text-body-sm text-on-surface-variant flex items-start gap-1.5 mb-3">
                        <span className="icon text-sm text-primary shrink-0 mt-0.5">place</span>
                        <span className="line-clamp-2 text-xs">{school.address || `${school.area || city}, India`}</span>
                      </div>

                      {/* Contact Phone & Email Badges */}
                      <div className="mb-3 space-y-2">
                        {hasVerifiedPhone ? (
                          <div className="flex items-center justify-between bg-secondary/10 border border-secondary/30 p-2 rounded-xl text-label-sm">
                            <div className="flex items-center gap-1.5 text-secondary font-mono font-bold">
                              <span className="icon text-sm">phone_in_talk</span>
                              <span>{school.phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {isWhatsAppEligible(school.phone) && (
                                <a
                                  href={(() => {
                                    const msg = `Respected Principal / Management (${school.name}),\n\nI hope you are well.\n\nOur AI system EduVault evaluated your school (~${school.studentCount || 500} students). We help schools automate fee collection using WhatsApp UPI QR codes, eliminating payment delays and manual register follow-ups.\n\nCould we share a 2-minute personalized video demo for ${school.name}?\n\nWarm regards,\nEduVault AI Team`
                                    return getWhatsAppUrl(school.phone, msg)
                                  })()}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-0.5"
                                  title="Send AI WhatsApp Pitch"
                                >
                                  <span className="icon text-xs">chat</span>
                                  <span>WhatsApp</span>
                                </a>
                              )}
                              <a
                                href={`tel:${school.phone}`}
                                className="px-2 py-1 rounded bg-secondary/20 text-secondary hover:bg-secondary/30 text-xs font-semibold"
                                title="Call Phone Number"
                              >
                                Call
                              </a>
                              <button
                                onClick={() => handleCopyPhone(school.phone, index)}
                                className="px-2 py-1 rounded glass-card text-on-surface-variant hover:text-on-surface text-xs"
                              >
                                {copiedIndex === index ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-on-surface-variant/60 bg-surface-dark/40 px-2.5 py-1.5 rounded-xl text-label-xs font-mono">
                            <span className="icon text-xs">phone_disabled</span>
                            <span>Phone Unlisted (Needs Direct Call)</span>
                          </div>
                        )}

                        {school.email && (
                          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-2 rounded-xl text-label-sm">
                            <a href={`mailto:${school.email}`} className="flex items-center gap-1.5 text-primary font-mono font-medium hover:underline text-xs truncate">
                              <span className="icon text-sm">mail</span>
                              <span className="truncate">{school.email}</span>
                            </a>
                            <span className="text-label-xs text-primary/80 font-mono shrink-0 ml-1">Domain Mail</span>
                          </div>
                        )}
                      </div>
                    </div>


                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                      {school.website ? (
                        <a
                          href={school.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-label-md text-primary flex items-center gap-1 hover:underline font-medium"
                        >
                          <span className="icon text-sm">language</span>
                          <span>Website</span>
                        </a>
                      ) : (
                        <span className="text-label-xs text-on-surface-variant/50 flex items-center gap-1">
                          <span className="icon text-xs">verified</span>
                          <span>{school.source || 'Google Verified'}</span>
                        </span>
                      )}

                      <button
                        onClick={() => handleSaveToPipeline(school, index)}
                        disabled={savedIds[index]}
                        className={`px-3 py-1.5 rounded-xl text-label-md font-medium flex items-center gap-1.5 transition-all ${
                          savedIds[index]
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 font-semibold cursor-default'
                            : isSmallMidPriority
                            ? 'btn-primary cursor-pointer'
                            : 'btn-ghost cursor-pointer'
                        }`}
                      >
                        <span className="icon text-sm">{savedIds[index] ? 'verified' : 'add'}</span>
                        <span>{savedIds[index] ? 'AI Qualified Lead' : '+ Qualify & Save'}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Load More Button — Only shows if more schools are available */}
            {discoveredSchools.length > visibleCount && (
              <div className="flex flex-col items-center gap-2 pt-4">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 10)}
                  className="btn-primary py-3.5 px-8 text-body-sm font-bold flex items-center gap-2.5 shadow-glow-primary hover:scale-105 transition-all"
                >
                  <span className="icon text-xl">expand_more</span>
                  <span>
                    Load More Schools (Displaying {visibleCount} of {discoveredSchools.length} Total Found)
                  </span>
                </button>
                <span className="text-label-sm text-on-surface-variant">
                  Clicking will show the next 10 target schools in {area || city}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

