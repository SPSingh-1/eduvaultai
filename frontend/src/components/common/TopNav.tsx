import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useNavigate, Link } from 'react-router-dom'

export function TopNav() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0)
  const [alerts, setAlerts] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/schools?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const fetchAlerts = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/communication/alerts')
      const data = await res.json()
      if (data.success) {
        setAlerts(data.data || [])
        setUnreadAlertsCount(data.unreadCount || 0)
      }
    } catch {
      // ignore
    }
  }

  // Poll for inbound client response alerts every 10s
  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleBellClick = () => {
    setShowDropdown((prev) => !prev)
    fetchAlerts()
  }

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`http://localhost:3001/api/v1/communication/alerts/${id}/read`, { method: 'PATCH' })
      fetchAlerts()
    } catch {
      // ignore
    }
  }

  return (
    <header className="h-16 glass-elevated border-b border-outline-variant/30 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand logo */}
      <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-container to-tertiary-container flex items-center justify-center shadow-glow-primary">
          <span className="icon text-white text-xl">hub</span>
        </div>
        <div className="flex flex-col">
          <span className="text-body-md font-bold tracking-tight text-on-surface flex items-center gap-1.5">
            EduVault <span className="text-primary font-mono text-xs px-1.5 py-0.5 rounded bg-primary-container/20 border border-primary/20">AI OS</span>
          </span>
        </div>
      </Link>

      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center gap-2 bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-1.5 w-96 text-on-surface-variant focus-within:border-primary/50 transition-all">
        <span className="icon text-lg">search</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search schools, leads, campaigns (Press Enter)..."
          className="bg-transparent text-body-sm text-on-surface outline-none w-full placeholder:text-on-surface-variant/60"
        />
        <span className="text-label-md font-mono bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant">↵</span>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Quick AI Task trigger */}
        <button
          onClick={() => navigate('/discovery')}
          className="btn-ai text-xs py-2 px-3.5 flex items-center gap-2 hidden sm:flex font-semibold"
        >
          <span className="icon text-sm">auto_awesome</span>
          <span>Deploy Hunter</span>
        </button>

        {/* Notifications / Inbound Client Response Alerts with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleBellClick}
            title={unreadAlertsCount > 0 ? `${unreadAlertsCount} New School Reply Alerts!` : 'Notifications'}
            className={`w-9 h-9 rounded-xl glass-card flex items-center justify-center transition-all ${
              showDropdown
                ? 'border-secondary text-secondary bg-secondary/10'
                : 'text-on-surface-variant hover:text-on-surface'
            } relative`}
          >
            <span className="icon text-xl">notifications</span>
            {unreadAlertsCount > 0 ? (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-secondary text-on-secondary shadow-glow-primary animate-pulse">
                {unreadAlertsCount}
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-outline-variant/60 absolute top-2 right-2"></span>
            )}
          </button>

          {/* Interactive Notifications Popover Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-96 max-h-[480px] glass-elevated border border-outline-variant/40 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in flex flex-col">
              {/* Dropdown Header */}
              <div className="p-3.5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/60">
                <div className="flex items-center gap-2">
                  <span className="icon text-secondary text-lg">mark_chat_unread</span>
                  <span className="text-body-sm font-bold text-on-surface">Client Response Alerts</span>
                </div>
                {unreadAlertsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-secondary/20 text-secondary border border-secondary/40">
                    {unreadAlertsCount} New
                  </span>
                )}
              </div>

              {/* Alerts List Body */}
              <div className="overflow-y-auto divide-y divide-outline-variant/20 max-h-[340px]">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant text-body-xs space-y-2">
                    <span className="icon text-3xl text-on-surface-variant/40 block">notifications_off</span>
                    <p>No client response alerts yet.</p>
                    <p className="text-muted text-[11px]">When schools reply to your outreach emails, Hermes 3 AI categorizes them and alerts you right here.</p>
                  </div>
                ) : (
                  alerts.slice(0, 6).map((alert) => {
                    const isUnread = alert.status === 'unread'
                    const isDemo = alert.category === 'demo_requested'
                    const isPricing = alert.category === 'pricing_inquiry'

                    return (
                      <div
                        key={alert.id}
                        onClick={() => {
                          setShowDropdown(false)
                          navigate('/dashboard')
                        }}
                        className={`p-3.5 hover:bg-surface-container-high/50 cursor-pointer transition-colors space-y-1.5 ${
                          isUnread ? 'bg-secondary/5' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              isDemo
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : isPricing
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            }`}
                          >
                            {alert.categoryLabel || '💬 School Reply'}
                          </span>
                          <span className="text-[11px] font-mono text-on-surface-variant/60">
                            {new Date(alert.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="text-body-sm font-semibold text-on-surface truncate">
                          {alert.schoolName}
                        </div>

                        <p className="text-body-xs text-on-surface-variant line-clamp-2 italic">
                          "{alert.preview || alert.fullMessage}"
                        </p>

                        {alert.crmStageAdvanced && (
                          <div className="text-[10px] text-primary font-mono flex items-center gap-1">
                            <span className="icon text-xs">trending_up</span>
                            CRM Stage: {alert.crmStageAdvanced}
                          </div>
                        )}

                        {isUnread && (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={(e) => handleMarkAsRead(alert.id, e)}
                              className="text-[11px] text-secondary hover:underline"
                            >
                              Mark as read
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2.5 border-t border-outline-variant/30 bg-surface-container-low/60 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setShowDropdown(false)
                    navigate('/communication')
                  }}
                  className="text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Open Unified Inbox</span>
                  <span className="icon text-xs">arrow_forward</span>
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false)
                    navigate('/dashboard')
                  }}
                  className="text-secondary hover:underline font-semibold"
                >
                  View on Dashboard
                </button>
              </div>
            </div>
          )}
        </div>



        {/* User avatar & menu */}
        <div className="flex items-center gap-3 border-l border-outline-variant/30 pl-3">
          <div className="w-8 h-8 rounded-full bg-tertiary-container/40 border border-tertiary/30 flex items-center justify-center text-tertiary font-semibold text-xs">
            {user?.name?.slice(0, 2).toUpperCase() || 'SA'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-body-sm font-semibold text-on-surface leading-tight">{user?.name || 'Sales Architect'}</div>
            <div className="text-label-md text-on-surface-variant">{user?.role || 'Admin'}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-8 h-8 rounded-xl glass-card flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="icon text-lg">logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
