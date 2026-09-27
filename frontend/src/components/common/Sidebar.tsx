import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Command Center', icon: 'dashboard', path: '/dashboard' },
  { label: 'School Discovery', icon: 'travel_explore', path: '/schools' },
  { label: 'Lead Intelligence', icon: 'psychology', path: '/leads' },
  { label: 'Campaign Studio', icon: 'campaign', path: '/campaigns' },
  { label: 'Unified Inbox', icon: 'forum', path: '/communication' },
  { label: 'Sales Pipeline', icon: 'view_kanban', path: '/sales/pipeline' },
  { label: 'AI Control Tower', icon: 'precision_manufacturing', path: '/ai/control-tower' },
  { label: 'Customer Success', icon: 'verified_user', path: '/customers' },
  { label: 'Renewals & Growth', icon: 'trending_up', path: '/renewals' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
]

export function Sidebar() {
  return (
    <aside className="w-64 glass-elevated min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 border-r border-outline-variant/30 hidden md:flex shrink-0">
      <div className="space-y-6">
        {/* Workspace selector */}
        <div className="glass-card rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-primary/30">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-container/40 flex items-center justify-center text-primary font-bold text-sm">
              EV
            </div>
            <div className="truncate">
              <div className="text-body-sm font-semibold text-on-surface truncate">EduVault India</div>
              <div className="text-label-md text-on-surface-variant">Enterprise Workspace</div>
            </div>
          </div>
          <span className="icon text-on-surface-variant text-sm">unfold_more</span>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
            Core Workforce
          </div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="icon text-xl">{item.icon}</span>
              <span className="text-body-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* AI Agent Status Pill */}
      <div className="glass-card rounded-xl p-3.5 flex items-center gap-3">
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-secondary"></div>
          <div className="w-3 h-3 rounded-full bg-secondary absolute inset-0 animate-ping opacity-75"></div>
        </div>
        <div>
          <div className="text-body-sm font-medium text-on-surface flex items-center gap-1.5">
            AI Active <span className="text-xs text-secondary font-mono">100%</span>
          </div>
          <div className="text-label-md text-on-surface-variant">17 Agents Autonomous</div>
        </div>
      </div>
    </aside>
  )
}
