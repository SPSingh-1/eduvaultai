import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { schoolsApi, School } from '@/features/schools/services/schools.api'

export function SchoolsListPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const fetchSchools = async () => {
    setLoading(true)
    try {
      const res = await schoolsApi.list({ search, type: typeFilter })
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setSchools(res.data)
      } else {
        setSchools([])
      }
    } catch (e) {
      console.error(e)
      setSchools([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchools()
  }, [search, typeFilter])

  // Split schools: verified phone vs no phone
  const withPhone = schools.filter((s) => s.phone && s.phone.trim() !== '')
  const withoutPhone = schools.filter((s) => !s.phone || s.phone.trim() === '')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-bold text-on-surface">Target School Directory</h1>
          <p className="text-body-sm text-on-surface-variant">
            All discovered and qualified K-12 school profiles saved in your EduVault AI database.
          </p>
        </div>
        <Link to="/discovery" className="btn-primary py-2.5 px-4 flex items-center gap-2 self-start">
          <span className="icon text-lg">travel_explore</span>
          <span>Discover New Schools</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-outline-variant/30 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by school name, city, principal..."
            className="glass-input w-full pl-10 h-10 text-body-sm"
          />
          <span className="icon text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 text-lg">search</span>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="glass-input h-10 px-3 text-body-sm bg-surface-container"
        >
          <option value="">All Board Types</option>
          <option value="cbse">CBSE</option>
          <option value="icse">ICSE</option>
          <option value="private">Private</option>
          <option value="state_board">State Board</option>
          <option value="international">International</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh] gap-3">
          <span className="icon text-3xl animate-spin text-primary">sync</span>
          <span className="text-body-sm text-on-surface-variant">Loading school directory...</span>
        </div>
      ) : schools.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl text-on-surface-variant space-y-3">
          <span className="icon text-4xl text-primary/40 block">school</span>
          <div className="text-body-md font-bold text-on-surface">No Schools in Database Yet</div>
          <p className="text-body-sm text-xs max-w-md mx-auto">
            Click <b>Discover New Schools</b> above, then click <b>⚡ Run Autonomous Agent Flow</b> to automatically find and save schools.
          </p>
          <Link to="/discovery" className="btn-primary py-2.5 px-5 inline-flex items-center gap-2 mt-2">
            <span className="icon text-lg">travel_explore</span>
            <span>Start School Discovery</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Section A — Schools WITH Verified Phone (Priority Targets) */}
          {withPhone.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/30">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span className="text-label-md font-bold text-secondary">
                    ✅ {withPhone.length} Schools — Verified Contact Available
                  </span>
                </div>
                <span className="text-label-sm text-on-surface-variant">Ready for immediate outreach</span>
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden border border-secondary/30">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-secondary/20 bg-secondary/5 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                        <th className="p-4">School Name</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">City</th>
                        <th className="p-4">Students</th>
                        <th className="p-4">📞 Phone</th>
                        <th className="p-4">✉️ Email</th>
                        <th className="p-4">Principal</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-body-sm">
                      {withPhone.map((school) => (
                        <tr key={school.id} className="hover:bg-secondary/5 transition-colors">
                          <td className="p-4 font-semibold text-on-surface max-w-[200px]">
                            <Link to={`/schools/${school.id}`} className="hover:text-primary transition-colors line-clamp-2">
                              {school.name}
                            </Link>
                          </td>
                          <td className="p-4">
                            <span className="status-badge active uppercase text-xs">{school.type}</span>
                          </td>
                          <td className="p-4 text-on-surface-variant">{school.city || '-'}</td>
                          <td className="p-4 font-mono text-on-surface">{school.studentCount?.toLocaleString() || '-'}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="icon text-secondary text-sm">phone_in_talk</span>
                              <a href={`tel:${school.phone}`} className="font-mono text-secondary font-semibold hover:underline text-xs">
                                {school.phone}
                              </a>
                            </div>
                          </td>
                          <td className="p-4">
                            {school.email ? (
                              <a href={`mailto:${school.email}`} className="font-mono text-primary text-xs hover:underline truncate max-w-[160px] block">
                                {school.email}
                              </a>
                            ) : (
                              <span className="text-on-surface-variant/50 text-xs">-</span>
                            )}
                          </td>
                          <td className="p-4 text-on-surface-variant text-xs">{school.principalName || '-'}</td>
                          <td className="p-4 text-right">
                            <Link to={`/schools/${school.id}`} className="btn-ghost py-1.5 px-3 text-xs inline-flex items-center gap-1">
                              <span>360° Profile</span>
                              <span className="icon text-sm">arrow_forward</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Section B — Schools WITHOUT Phone (Needs Enrichment) */}
          {withoutPhone.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-on-surface-variant/10 border border-outline-variant/40">
                  <span className="icon text-on-surface-variant/50 text-sm">phone_disabled</span>
                  <span className="text-label-md font-bold text-on-surface-variant">
                    ⏳ {withoutPhone.length} Schools — Contact Pending AI Enrichment
                  </span>
                </div>
                <span className="text-label-sm text-on-surface-variant/60">Run Agent Flow to extract phone numbers</span>
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/30 opacity-85">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                        <th className="p-4">School Name</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">City</th>
                        <th className="p-4">Students</th>
                        <th className="p-4">Phone Status</th>
                        <th className="p-4">✉️ Email</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-body-sm">
                      {withoutPhone.map((school) => (
                        <tr key={school.id} className="hover:bg-surface-container-high/30 transition-colors">
                          <td className="p-4 font-semibold text-on-surface max-w-[200px]">
                            <Link to={`/schools/${school.id}`} className="hover:text-primary transition-colors line-clamp-2">
                              {school.name}
                            </Link>
                          </td>
                          <td className="p-4">
                            <span className="status-badge primary uppercase text-xs">{school.type}</span>
                          </td>
                          <td className="p-4 text-on-surface-variant">{school.city || '-'}</td>
                          <td className="p-4 font-mono text-on-surface">{school.studentCount?.toLocaleString() || '-'}</td>
                          <td className="p-4">
                            <span className="flex items-center gap-1.5 text-on-surface-variant/60 text-xs font-mono">
                              <span className="icon text-sm">phone_disabled</span>
                              Not Found
                            </span>
                          </td>
                          <td className="p-4">
                            {school.email ? (
                              <a href={`mailto:${school.email}`} className="font-mono text-primary text-xs hover:underline truncate max-w-[160px] block">
                                {school.email}
                              </a>
                            ) : (
                              <span className="text-on-surface-variant/50 text-xs">-</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <Link to={`/schools/${school.id}`} className="btn-ghost py-1.5 px-3 text-xs inline-flex items-center gap-1">
                              <span>360° Profile</span>
                              <span className="icon text-sm">arrow_forward</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
