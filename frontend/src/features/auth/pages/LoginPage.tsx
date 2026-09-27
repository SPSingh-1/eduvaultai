import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

export function LoginPage() {
  const [email, setEmail] = useState('architect@eduvault.ai')
  const [password, setPassword] = useState('eduvault2026')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    setTimeout(() => {
      // Demo authentication success
      setAuth(
        {
          id: 'usr_architect_01',
          email: email,
          name: 'Shashi Sales Architect',
          role: 'Lead Architect',
          organizationId: 'org_eduvault_01',
        },
        {
          id: 'org_eduvault_01',
          name: 'EduVault India',
          slug: 'eduvault-india',
          plan: 'Enterprise Free Tier',
        },
        'demo-jwt-token-2026'
      )
      setLoading(false)
      navigate('/dashboard')
    }, 600)
  }

  return (
    <div className="w-full max-w-5xl glass-panel rounded-3xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden border border-outline-variant/30 shadow-glass my-8">
      {/* Left Column — Login Gateway Form */}
      <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between z-10">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-container to-tertiary-container flex items-center justify-center shadow-glow-primary">
              <span className="icon text-white text-2xl">hub</span>
            </div>
            <div>
              <div className="text-headline-sm font-bold text-on-surface leading-tight">
                EduVault <span className="text-primary font-mono">AI</span>
              </div>
              <div className="text-label-md text-on-surface-variant">Sales & Marketing Gateway</div>
            </div>
          </div>

          <h2 className="text-headline-md font-bold text-on-surface mb-2">Welcome Back</h2>
          <p className="text-body-sm text-on-surface-variant mb-6">
            Enter your credentials to access the Autonomous Command Center.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-body-sm flex items-center gap-2">
              <span className="icon text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-label-md font-medium text-on-surface-variant mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="architect@eduvault.ai"
                  className="glass-input w-full pl-11"
                />
                <span className="icon text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 text-xl">
                  mail
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-label-md font-medium text-on-surface-variant">
                  Password
                </label>
                <a href="#forgot" className="text-label-md text-primary hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="glass-input w-full pl-11"
                />
                <span className="icon text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2 text-xl">
                  lock
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer text-body-sm text-on-surface-variant">
                <input type="checkbox" defaultChecked className="rounded border-outline-variant bg-surface-container-high text-primary" />
                <span>Keep me signed in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-semibold text-body-md"
            >
              {loading ? (
                <>
                  <span className="icon text-xl animate-spin">sync</span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Command Center</span>
                  <span className="icon text-xl">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Demo Access */}
        <div className="mt-8 pt-6 border-t border-outline-variant/30">
          <div className="text-label-md text-on-surface-variant mb-3 font-mono">100% FREE STACK DEMO ACTIVE</div>
          <button
            type="button"
            onClick={handleLogin}
            className="btn-ghost w-full py-2.5 text-xs flex items-center justify-center gap-2 border-dashed border-primary/40 text-primary"
          >
            <span className="icon text-base">bolt</span>
            <span>One-Click Instant Demo Login</span>
          </button>
        </div>
      </div>

      {/* Right Column — Feature Showcase & Neural Mesh */}
      <div className="lg:col-span-7 bg-surface-container-low p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden hidden lg:flex border-l border-outline-variant/30">
        {/* Decorative mesh glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-container/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-tertiary-container/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-label-md font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>17 Autonomous AI Agents Ready</span>
          </div>

          <h1 className="text-display-md font-extrabold text-on-surface leading-tight mb-4">
            Automate School Discovery to Deal Close
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-lg mb-8">
            EduVault AI discovers target K-12 schools, enriches decision-maker profiles, scores leads autonomously, and writes hyper-personalized emails.
          </p>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-4 rounded-xl">
              <div className="text-kpi-md text-primary font-bold font-mono">1M+</div>
              <div className="text-label-md text-on-surface-variant">Daily Free AI Tokens</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="text-kpi-md text-secondary font-bold font-mono">94%</div>
              <div className="text-label-md text-on-surface-variant">Lead Scoring Accuracy</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="text-kpi-md text-tertiary font-bold font-mono">10x</div>
              <div className="text-label-md text-on-surface-variant">Outreach Speed</div>
            </div>
          </div>
        </div>

        {/* Live System Banner */}
        <div className="glass-panel p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="icon text-2xl text-secondary">verified</span>
            <div>
              <div className="text-body-sm font-semibold text-on-surface">Supabase + Gemini 1.5 Flash Connected</div>
              <div className="text-label-md text-on-surface-variant font-mono">Status: Operational (₹0 Cost)</div>
            </div>
          </div>
          <span className="text-label-md text-primary font-mono bg-primary-container/20 px-2 py-1 rounded">V1.0</span>
        </div>
      </div>
    </div>
  )
}
