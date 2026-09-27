import { useState, useEffect } from 'react'
import { settingsApi, APIKeyItem, TeamMember, IntegrationItem } from '@/features/settings/services/settings.api'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'keys' | 'team' | 'integrations'>('keys')
  const [keys, setKeys] = useState<APIKeyItem[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([])
  const [loading, setLoading] = useState(true)

  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Sales Representative')
  const [inviting, setInviting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [kData, tData, iData] = await Promise.all([
        settingsApi.getKeys(),
        settingsApi.getTeam(),
        settingsApi.getIntegrations(),
      ])
      setKeys(kData || [])
      setTeam(tData || [])
      setIntegrations(iData || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      await settingsApi.inviteMember({ name: inviteName || inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole })
      setInviteName('')
      setInviteEmail('')
      fetchData()
    } catch (e) {
      console.error(e)
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="icon text-primary text-xl">settings</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
              System Governance
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">Settings & Integrations</h1>
          <p className="text-body-sm text-on-surface-variant">
            Manage your 100% Free Stack API keys, team roles, and system integration health.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 glass-card p-1 rounded-xl border border-outline-variant/30">
          {[
            { id: 'keys', label: 'Free Stack Keys', icon: 'key' },
            { id: 'team', label: 'Team & RBAC', icon: 'group' },
            { id: 'integrations', label: 'Integration Health', icon: 'hub' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-label-md font-medium flex items-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-container text-white font-semibold shadow-glow-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="icon text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-8 text-center text-on-surface-variant rounded-2xl">
          <span className="icon text-2xl animate-spin text-primary block mb-2">sync</span>
          Loading settings configuration...
        </div>
      ) : (
        <>
          {/* Tab 1: API Keys Manager */}
          {activeTab === 'keys' && (
            <div className="space-y-4">
              <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
                <span className="icon text-secondary text-xl">key</span>
                <span>100% Free Stack API Providers ({keys.length})</span>
              </h2>

              <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/30">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                      <th className="p-4">Provider / Service</th>
                      <th className="p-4">Environment Variable</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 font-mono">Free Quota / Limit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 text-body-sm">
                    {keys.map((k, i) => (
                      <tr key={i} className="hover:bg-surface-container-high/40 transition-colors">
                        <td className="p-4 font-bold text-on-surface">{k.provider}</td>
                        <td className="p-4 font-mono text-tertiary">{k.envVar}</td>
                        <td className="p-4">
                          <span className="status-badge active flex items-center gap-1 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Connected
                          </span>
                        </td>
                        <td className="p-4 font-mono text-secondary font-semibold">{k.freeQuota}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Team & RBAC */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Invite Form */}
              <form onSubmit={handleInvite} className="glass-panel p-5 rounded-2xl border border-outline-variant/30 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4">
                  <label className="text-label-md font-medium text-on-surface-variant block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="glass-input w-full"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="text-label-md font-medium text-on-surface-variant block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="priya@eduvault.ai"
                    className="glass-input w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-label-md font-medium text-on-surface-variant block mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="glass-input w-full bg-surface-container"
                  >
                    <option value="Sales Representative">Sales Rep</option>
                    <option value="Customer Success Manager">CS Manager</option>
                    <option value="Administrator">Admin</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={inviting} className="btn-primary w-full py-3 text-body-sm font-semibold flex items-center justify-center gap-1">
                    <span className="icon text-base">person_add</span>
                    <span>{inviting ? 'Inviting...' : 'Invite'}</span>
                  </button>
                </div>
              </form>

              {/* Team Table */}
              <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/30">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                      <th className="p-4">User Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role Permission</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 text-body-sm">
                    {team.map((user) => (
                      <tr key={user.id} className="hover:bg-surface-container-high/40 transition-colors">
                        <td className="p-4 font-bold text-on-surface">{user.name}</td>
                        <td className="p-4 font-mono text-on-surface-variant">{user.email}</td>
                        <td className="p-4"><span className="status-badge primary">{user.role}</span></td>
                        <td className="p-4"><span className="status-badge active">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Integration Health */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
                <span className="icon text-secondary text-xl">sensors</span>
                <span>Live Adapter Latency & Health</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map((item, idx) => (
                  <div key={idx} className="glass-card p-5 rounded-2xl border border-outline-variant/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="status-badge primary text-xs uppercase">{item.category}</span>
                      <span className="status-badge active">Operational</span>
                    </div>
                    <h3 className="text-body-md font-bold text-on-surface">{item.name}</h3>
                    <div className="text-label-md font-mono text-secondary pt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span>Latency: {item.latencyMs} ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
