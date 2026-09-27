import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

// Layouts
import { AppLayout } from '@/app/layouts/AppLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { SplashLayout } from '@/app/layouts/SplashLayout'

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SplashPage } from '@/features/auth/pages/SplashPage'

// Dashboard
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

// Phase 3 — School Discovery & Profiles
import { SchoolDiscoveryPage } from '@/features/discovery/pages/SchoolDiscoveryPage'
import { SchoolsListPage } from '@/features/schools/pages/SchoolsListPage'
import { SchoolDetailPage } from '@/features/schools/pages/SchoolDetailPage'

// Phase 4 — Lead Intelligence & ICP
import { LeadsDatabasePage } from '@/features/leads/pages/LeadsDatabasePage'
import { LeadDetailPage } from '@/features/leads/pages/LeadDetailPage'
import { ICPBuilderPage } from '@/features/leads/pages/ICPBuilderPage'

// Phase 5 — Communication & Email
import { UnifiedInboxPage } from '@/features/communication/pages/UnifiedInboxPage'
import { AIOutreachStudioPage } from '@/features/communication/pages/AIOutreachStudioPage'

// Phase 6 — CRM & Sales Pipeline
import { SalesPipelinePage } from '@/features/sales/pages/SalesPipelinePage'
import { DealWorkspacePage } from '@/features/sales/pages/DealWorkspacePage'
import { TaskDeskPage } from '@/features/sales/pages/TaskDeskPage'

// Phase 7 — AI Workforce & Control Tower
import { AIControlTowerPage } from '@/features/ai-workforce/pages/AIControlTowerPage'
import { AIWorkforceTeamPage } from '@/features/ai-workforce/pages/AIWorkforceTeamPage'
import { AIApprovalsPage } from '@/features/ai-workforce/pages/AIApprovalsPage'

// Phase 8 — Campaigns & Workflow Automation
import { CampaignsPage } from '@/features/campaigns/pages/CampaignsPage'
import { WorkflowStudioPage } from '@/features/automation/pages/WorkflowStudioPage'

// Phase 9 — Customer Success & Support Copilot
import { CustomerSuccessPage } from '@/features/customers/pages/CustomerSuccessPage'
import { Customer360Page } from '@/features/customers/pages/Customer360Page'
import { SupportCopilotPage } from '@/features/customers/pages/SupportCopilotPage'

// Phase 10 — Renewals & Growth
import { RenewalsPage } from '@/features/renewals/pages/RenewalsPage'

// Phase 11 — Intelligence & Market Radar
import { CompetitorBattlecardsPage } from '@/features/intelligence/pages/CompetitorBattlecardsPage'
import { MarketRadarPage } from '@/features/intelligence/pages/MarketRadarPage'

// Phase 12 — System Settings & Governance
import { SettingsPage } from '@/features/settings/pages/SettingsPage'

// Phase 13 — Executive Growth Analytics & Territory Heatmaps
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage'

// Auth Guard
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <Routes>
      {/* Splash */}
      <Route path="/" element={<SplashLayout><SplashPage /></SplashLayout>} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          <RedirectIfAuth><LoginPage /></RedirectIfAuth>
        } />
      </Route>

      {/* Protected app routes */}
      <Route element={
        <RequireAuth><AppLayout /></RequireAuth>
      }>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Phase 3 — School Discovery Routes */}
        <Route path="/discovery" element={<SchoolDiscoveryPage />} />
        <Route path="/schools" element={<SchoolsListPage />} />
        <Route path="/schools/:id" element={<SchoolDetailPage />} />

        {/* Phase 4 — Lead Intelligence Routes */}
        <Route path="/leads" element={<LeadsDatabasePage />} />
        <Route path="/leads/icp" element={<ICPBuilderPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />

        {/* Phase 5 — Communication Routes */}
        <Route path="/communication" element={<UnifiedInboxPage />} />
        <Route path="/communication/outreach" element={<AIOutreachStudioPage />} />

        {/* Phase 6 — Sales Pipeline Routes */}
        <Route path="/sales/pipeline" element={<SalesPipelinePage />} />
        <Route path="/sales/deals/:id" element={<DealWorkspacePage />} />
        <Route path="/sales/tasks" element={<TaskDeskPage />} />

        {/* Phase 7 — AI Workforce Routes */}
        <Route path="/ai/control-tower" element={<AIControlTowerPage />} />
        <Route path="/ai/workforce" element={<AIWorkforceTeamPage />} />
        <Route path="/ai/approvals" element={<AIApprovalsPage />} />

        {/* Phase 8 — Campaigns & Automation Routes */}
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/automation" element={<WorkflowStudioPage />} />

        {/* Phase 9 — Customer Success Routes */}
        <Route path="/customers" element={<CustomerSuccessPage />} />
        <Route path="/customers/support" element={<SupportCopilotPage />} />
        <Route path="/customers/:id" element={<Customer360Page />} />

        {/* Phase 10 — Renewals & Growth Routes */}
        <Route path="/renewals" element={<RenewalsPage />} />

        {/* Phase 11 — Intelligence Routes */}
        <Route path="/intelligence/battlecards" element={<CompetitorBattlecardsPage />} />
        <Route path="/intelligence/radar" element={<MarketRadarPage />} />

        {/* Phase 12 — Settings & Governance Routes */}
        <Route path="/settings" element={<SettingsPage />} />

        {/* Phase 13 — Analytics Routes */}
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
