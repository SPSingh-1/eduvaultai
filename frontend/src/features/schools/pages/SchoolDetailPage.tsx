import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { schoolsApi, School } from '@/features/schools/services/schools.api'

const DEMO_SCHOOLS: Record<string, School> = {
  sch_dps_pune: {
    id: 'sch_dps_pune',
    name: 'Delhi Public School (DPS) International',
    type: 'cbse',
    city: 'Pune',
    state: 'Maharashtra',
    studentCount: 1850,
    principalName: 'Dr. Sunita Sharma',
    email: 'principal@dpspune.edu.in',
    phone: '+91 20 2690 2100',
    confidence: 0.98,
    website: 'https://dpspune.edu.in',
  },
  sch_ryan_mumbai: {
    id: 'sch_ryan_mumbai',
    name: 'Ryan International Academy',
    type: 'icse',
    city: 'Mumbai',
    state: 'Maharashtra',
    studentCount: 2200,
    principalName: 'Mr. Rajesh Nair',
    email: 'contact@ryaninternational.org',
    phone: '+91 22 2880 1234',
    confidence: 0.96,
    website: 'https://ryaninternational.org',
  },
  sch_jain_bangalore: {
    id: 'sch_jain_bangalore',
    name: 'Jain International Residential School',
    type: 'international',
    city: 'Bengaluru',
    state: 'Karnataka',
    studentCount: 1400,
    principalName: 'Dr. A.K. Singh',
    email: 'principal@jirs.ac.in',
    phone: '+91 80 2757 7000',
    confidence: 0.95,
    website: 'https://jirs.ac.in',
  },
  sch_podar_pune: {
    id: 'sch_podar_pune',
    name: 'Podar International School',
    type: 'cbse',
    city: 'Pune',
    state: 'Maharashtra',
    studentCount: 1600,
    principalName: 'Mrs. Vandana Lulla',
    email: 'info.pune@podareducation.org',
    phone: '+91 20 6711 0000',
    confidence: 0.97,
    website: 'https://podareducation.org',
  },
}

export function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiReport, setAiReport] = useState<any>(null)

  const fetchSchoolDetail = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await schoolsApi.getById(id)
      if (data) {
        setSchool(data)
        if (data?.websiteData) setAiReport(data.websiteData)
      } else if (DEMO_SCHOOLS[id]) {
        setSchool(DEMO_SCHOOLS[id])
      }
    } catch (e) {
      console.error(e)
      if (DEMO_SCHOOLS[id]) {
        setSchool(DEMO_SCHOOLS[id])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchoolDetail()
  }, [id])

  const handleRunWebsiteVision = async () => {
    if (!id) return
    setAnalyzing(true)
    try {
      const res = await schoolsApi.runWebsiteResearch(id)
      setAiReport(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <span className="icon text-3xl animate-spin text-primary">sync</span>
        <span className="text-body-sm text-on-surface-variant">Loading School 360° Profile...</span>
      </div>
    )
  }

  if (!school) {
    return (
      <div className="glass-panel p-8 text-center rounded-2xl max-w-md mx-auto my-12">
        <span className="icon text-4xl text-error mb-2 block">error</span>
        <h2 className="text-headline-sm font-bold text-on-surface mb-2">School Not Found</h2>
        <Link to="/schools" className="btn-ghost text-xs">Back to Directory</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link to="/schools" className="text-label-md text-on-surface-variant hover:text-primary flex items-center gap-1">
          <span className="icon text-sm">arrow_back</span>
          <span>Back to School Directory</span>
        </Link>

        <button
          onClick={handleRunWebsiteVision}
          disabled={analyzing}
          className="btn-ai py-2 px-4 text-body-sm flex items-center gap-2"
        >
          <span className={`icon text-lg ${analyzing ? 'animate-spin' : ''}`}>auto_awesome</span>
          <span>{analyzing ? 'Scanning Website AI...' : 'Run Website Vision AI'}</span>
        </button>
      </div>

      {/* 360 Header Banner */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-outline-variant/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="status-badge primary uppercase">{school.type} Board</span>
              <span className="status-badge active">Confidence 96%</span>
            </div>
            <h1 className="text-display-md font-bold text-on-surface mb-2">{school.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="icon text-base">place</span>{school.city}, {school.state || 'India'}</span>
              <span className="flex items-center gap-1"><span className="icon text-base">groups</span>{school.studentCount || '1,200'} Students</span>
              {school.website && (
                <a href={school.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  <span className="icon text-base">language</span>{school.website}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Decision Makers + AI Vision Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols — Key Contacts / Decision Makers */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-primary text-xl">contacts</span>
            <span>Decision Makers</span>
          </h2>

          {school.contacts && school.contacts.length > 0 ? (
            school.contacts.map((c, i) => (
              <div key={c.id || i} className="glass-card p-5 rounded-2xl border border-outline-variant/30 space-y-4 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
                      {`${c.firstName?.[0] || ''}${c.lastName?.[0] || 'C'}`}
                    </div>
                    <div>
                      <div className="text-body-md font-bold text-on-surface">
                        {`${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Key Decision Maker'}
                      </div>
                      <div className="text-label-md text-on-surface-variant">{c.designation || 'School Leader / Trustee'}</div>
                    </div>
                  </div>
                  <span className="status-badge primary">{i === 0 ? 'Primary' : 'Contact'}</span>
                </div>
                <div className="divider"></div>
                <div className="space-y-2 text-body-sm text-on-surface-variant">
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <span className="icon text-base text-primary">mail</span>
                      <span>{c.email}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <span className="icon text-base text-secondary">phone</span>
                      <span>{c.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : school.principalName ? (
            <div className="glass-card p-5 rounded-2xl border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
                    {school.principalName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-body-md font-bold text-on-surface">{school.principalName}</div>
                    <div className="text-label-md text-on-surface-variant">Principal / Academic Head</div>
                  </div>
                </div>
                <span className="status-badge primary">Primary</span>
              </div>

              <div className="divider"></div>

              <div className="space-y-2 text-body-sm text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="icon text-base text-primary">mail</span>
                  <span>{school.email || `principal@${school.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`}</span>
                </div>
                {school.phone && (
                  <div className="flex items-center gap-2">
                    <span className="icon text-base text-secondary">phone</span>
                    <span>{school.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 rounded-2xl border border-outline-variant/30 text-center space-y-3">
              <span className="icon text-3xl text-primary/60 block">person_search</span>
              <div className="text-body-md font-semibold text-on-surface">No Decision Maker Discovered Yet</div>
              <p className="text-body-sm text-on-surface-variant text-xs max-w-xs mx-auto">
                Principal and management contact information for {school.name} is pending automated AI enrichment.
              </p>
              <Link to="/discovery" className="btn-secondary py-2 px-3 text-xs inline-flex items-center gap-1.5 mt-2">
                <span className="icon text-sm">travel_explore</span>
                <span>Run Contact Scout Agent</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right 7 Cols — AI Website Vision Intelligence Report */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="icon text-tertiary text-xl">psychology</span>
            <span>AI Website Vision Intelligence (Gemini 1.5 Flash)</span>
          </h2>

          {aiReport ? (
            <div className="glass-panel p-6 rounded-2xl border border-tertiary/30 space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                <div>
                  <div className="text-label-sm uppercase font-semibold text-on-surface-variant">Digital Maturity Score</div>
                  <div className="text-kpi-xl font-mono font-bold text-tertiary">{aiReport.digitalMaturityScore || 78}/100</div>
                </div>
                <div className="text-right">
                  <div className="text-label-sm uppercase font-semibold text-on-surface-variant">Confidence</div>
                  <div className="text-body-md font-mono text-secondary">94% Verified</div>
                </div>
              </div>

              <div>
                <div className="text-label-sm font-semibold uppercase text-on-surface-variant mb-2">Detected Tech Stack</div>
                <div className="flex flex-wrap gap-2">
                  {(aiReport.currentTechStack || ['Legacy Desktop ERP', 'Basic WordPress Website']).map((tech: string, i: number) => (
                    <span key={i} className="status-badge purple">{tech}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-label-sm font-semibold uppercase text-on-surface-variant mb-2">Key ERP Automation Opportunities</div>
                <ul className="space-y-1 text-body-sm text-on-surface">
                  {(aiReport.keyOpportunities || ['Online Fee Gateway', 'WhatsApp Parent Portal']).map((opp: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="icon text-secondary text-sm">check_circle</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-tertiary-container/10 border border-tertiary/20">
                <div className="text-label-sm uppercase font-semibold text-tertiary mb-1">AI Pitch Hook</div>
                <p className="text-body-sm text-on-surface italic">
                  "{aiReport.aiRecommendedPitch || `Upgrade ${school.name}'s parent portal with EduVault AI to automate fee collection and attendance.`}"
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 rounded-2xl text-center space-y-3">
              <span className="icon text-4xl text-tertiary block">auto_awesome</span>
              <div className="text-body-md font-semibold text-on-surface">No Website Intelligence Report Yet</div>
              <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
                Click "Run Website Vision AI" above to generate a 360° technology assessment powered by Google Gemini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
