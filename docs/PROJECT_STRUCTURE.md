# EduVault AI — Project Structure

## Repository Layout

```
eduvault-ai/
│
├── frontend/                            # React/Vite/TS frontend
│   ├── src/
│   │   │
│   │   ├── app/                         # Application shell
│   │   │   ├── router/
│   │   │   │   ├── index.tsx            # Root router
│   │   │   │   ├── routes.tsx           # All route definitions
│   │   │   │   └── guards/              # AuthGuard, PermissionGuard
│   │   │   ├── providers/
│   │   │   │   ├── AppProviders.tsx     # Root provider wrapper
│   │   │   │   ├── QueryProvider.tsx    # TanStack Query
│   │   │   │   ├── AuthProvider.tsx     # Auth context
│   │   │   │   └── WebSocketProvider.tsx
│   │   │   ├── layouts/
│   │   │   │   ├── AppLayout.tsx        # Sidebar + top nav + main content
│   │   │   │   ├── AuthLayout.tsx       # Split panel (45/55) for login
│   │   │   │   ├── SplashLayout.tsx     # Full screen centered
│   │   │   │   └── FocusedLayout.tsx    # No sidebar (onboarding)
│   │   │   └── config/
│   │   │       ├── constants.ts         # App-level constants
│   │   │       └── feature-flags.ts     # Feature flag config
│   │   │
│   │   ├── components/                  # Shared UI components
│   │   │   ├── ui/                      # Base primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Drawer.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   ├── Dropdown.tsx
│   │   │   │   ├── Tooltip.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Checkbox.tsx
│   │   │   │   ├── Switch.tsx
│   │   │   │   └── Skeleton.tsx
│   │   │   │
│   │   │   ├── common/                  # Cross-domain UI
│   │   │   │   ├── PageHeader.tsx       # Standard page title + actions
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── ErrorState.tsx
│   │   │   │   ├── LoadingState.tsx
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   ├── CommandPalette.tsx   # Cmd+K global search
│   │   │   │   ├── UserAvatar.tsx
│   │   │   │   └── NotificationBell.tsx
│   │   │   │
│   │   │   ├── data-display/            # Data visualization
│   │   │   │   ├── DataTable.tsx        # Reusable sortable/filterable table
│   │   │   │   ├── KPICard.tsx          # Dashboard KPI metric card
│   │   │   │   ├── SparklineChart.tsx   # Tiny inline chart
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── ScoreBadge.tsx       # Lead/health score display
│   │   │   │   ├── StatusBadge.tsx      # Status pills
│   │   │   │   ├── ActivityTimeline.tsx # Activity feed/timeline
│   │   │   │   └── MiniMap.tsx          # Small map preview
│   │   │   │
│   │   │   ├── forms/                   # Form building blocks
│   │   │   │   ├── FormField.tsx        # Label + Input + Error wrapper
│   │   │   │   ├── SearchInput.tsx      # Search bar with icon
│   │   │   │   ├── FilterBar.tsx        # Multi-filter bar component
│   │   │   │   ├── DatePicker.tsx
│   │   │   │   └── FileUpload.tsx
│   │   │   │
│   │   │   ├── feedback/                # User feedback UI
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Alert.tsx
│   │   │   │   └── Banner.tsx
│   │   │   │
│   │   │   └── ai/                      # AI-specific UI
│   │   │       ├── AIStatusDot.tsx      # Green pulsing dot for AI active
│   │   │       ├── AIInsightCard.tsx    # AI recommendation card
│   │   │       ├── AIReasoningPanel.tsx # Shows AI chain-of-thought
│   │   │       ├── ApprovalCard.tsx     # Human approval UI
│   │   │       ├── AgentStatusBadge.tsx # Agent online/paused/error
│   │   │       └── ShaderBackground.tsx # WebGL shader wrapper component
│   │   │
│   │   ├── features/                    # Domain feature modules
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── components/
│   │   │   │   │   ├── CommandCenterHero.tsx
│   │   │   │   │   ├── AIWorkforceStatus.tsx
│   │   │   │   │   ├── RecentActivityFeed.tsx
│   │   │   │   │   └── QuickActionsPanel.tsx
│   │   │   │   ├── pages/
│   │   │   │   │   └── DashboardPage.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useDashboardData.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── schools/
│   │   │   │   ├── components/
│   │   │   │   │   ├── SchoolCard.tsx
│   │   │   │   │   ├── SchoolTable.tsx
│   │   │   │   │   ├── SchoolFilters.tsx
│   │   │   │   │   ├── School360Profile.tsx
│   │   │   │   │   ├── SchoolIntelligencePanel.tsx
│   │   │   │   │   └── WebsiteIntelligenceView.tsx
│   │   │   │   ├── pages/
│   │   │   │   │   ├── SchoolsListPage.tsx
│   │   │   │   │   └── SchoolDetailPage.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useSchools.ts
│   │   │   │   │   └── useSchoolDetail.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── schools.api.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── school.types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── discovery/
│   │   │   │   ├── components/
│   │   │   │   │   ├── DiscoverySearchPanel.tsx
│   │   │   │   │   ├── MapsDiscoveryView.tsx
│   │   │   │   │   ├── DiscoveryJobCard.tsx
│   │   │   │   │   └── ScoutAgentPanel.tsx
│   │   │   │   ├── pages/
│   │   │   │   │   ├── DiscoveryCenterPage.tsx
│   │   │   │   │   └── MapsIntelligencePage.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useDiscovery.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── leads/
│   │   │   │   ├── components/
│   │   │   │   │   ├── LeadTable.tsx
│   │   │   │   │   ├── LeadCard.tsx
│   │   │   │   │   ├── LeadScoreBreakdown.tsx
│   │   │   │   │   ├── LeadIntelligenceView.tsx
│   │   │   │   │   ├── ICPBuilder.tsx
│   │   │   │   │   └── LeadFilters.tsx
│   │   │   │   ├── pages/
│   │   │   │   │   ├── LeadsPage.tsx
│   │   │   │   │   ├── LeadDetailPage.tsx
│   │   │   │   │   └── ICPPage.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useLeads.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── contacts/
│   │   │   ├── campaigns/
│   │   │   ├── communication/
│   │   │   ├── sales/
│   │   │   ├── crm/
│   │   │   ├── customers/
│   │   │   ├── onboarding/
│   │   │   ├── customer-success/
│   │   │   ├── renewals/
│   │   │   ├── revenue/
│   │   │   ├── automation/
│   │   │   ├── marketing/
│   │   │   ├── ai-workforce/
│   │   │   ├── market-intelligence/
│   │   │   ├── competitors/
│   │   │   ├── analytics/
│   │   │   ├── training/
│   │   │   ├── simulations/
│   │   │   ├── executive/
│   │   │   └── settings/
│   │   │
│   │   ├── services/
│   │   │   ├── api/
│   │   │   │   ├── client.ts            # Axios instance + interceptors
│   │   │   │   └── endpoints.ts         # Base URL constants
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── token.service.ts     # JWT storage + refresh
│   │   │   └── websocket/
│   │   │       └── ws.client.ts         # WebSocket connection manager
│   │   │
│   │   ├── hooks/                       # Global reusable hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePermissions.ts
│   │   │   ├── useOrganization.ts
│   │   │   ├── usePagination.ts
│   │   │   └── useDebounce.ts
│   │   │
│   │   ├── stores/                      # Zustand stores
│   │   │   ├── auth.store.ts            # User, token, organization
│   │   │   ├── ui.store.ts              # Sidebar state, theme
│   │   │   └── notifications.store.ts   # Toast/notification queue
│   │   │
│   │   ├── types/                       # Global TypeScript types
│   │   │   ├── api.types.ts             # ApiResponse, PaginatedResponse
│   │   │   ├── auth.types.ts            # User, Organization, Role
│   │   │   └── common.types.ts          # Shared utility types
│   │   │
│   │   ├── utils/                       # Utility functions
│   │   │   ├── format.ts                # Date, currency, number formatting
│   │   │   ├── cn.ts                    # clsx + tailwind-merge helper
│   │   │   ├── validators.ts            # Common validators
│   │   │   └── constants.ts             # App constants
│   │   │
│   │   ├── lib/                         # Library setup
│   │   │   ├── query-client.ts          # TanStack Query client config
│   │   │   └── axios.ts                 # Axios configuration
│   │   │
│   │   └── styles/
│   │       ├── globals.css              # CSS reset, design tokens, utilities
│   │       └── animations.css           # Named keyframe animations
│   │
│   ├── public/
│   │   └── favicon.svg
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts               # Full design token config from DESIGN_SYSTEM.md
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── api/                         # Express route handlers (thin)
│   │   │   ├── index.ts                 # Mounts all routers
│   │   │   ├── auth/
│   │   │   │   ├── auth.router.ts
│   │   │   │   └── auth.controller.ts
│   │   │   ├── schools/
│   │   │   ├── contacts/
│   │   │   ├── leads/
│   │   │   ├── campaigns/
│   │   │   ├── communication/
│   │   │   ├── sales/
│   │   │   ├── customers/
│   │   │   ├── ai/
│   │   │   ├── automation/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   │
│   │   ├── services/                    # Business logic (thick)
│   │   │   ├── auth.service.ts
│   │   │   ├── school.service.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── lead.service.ts
│   │   │   ├── scoring.service.ts
│   │   │   ├── campaign.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── customer.service.ts
│   │   │   ├── renewal.service.ts
│   │   │   └── analytics.service.ts
│   │   │
│   │   ├── ai/                          # AI layer (isolated)
│   │   │   ├── agents/
│   │   │   │   ├── discovery.agent.ts
│   │   │   │   ├── scoring.agent.ts
│   │   │   │   ├── email-personalization.agent.ts
│   │   │   │   ├── website-research.agent.ts
│   │   │   │   ├── contact-intelligence.agent.ts
│   │   │   │   ├── customer-success.agent.ts
│   │   │   │   ├── churn-prediction.agent.ts
│   │   │   │   └── market-intelligence.agent.ts
│   │   │   ├── tools/
│   │   │   │   ├── search.tool.ts
│   │   │   │   ├── web-fetch.tool.ts
│   │   │   │   ├── database.tool.ts
│   │   │   │   └── email-draft.tool.ts
│   │   │   ├── context/
│   │   │   │   └── context-builder.ts
│   │   │   ├── providers/
│   │   │   │   ├── openai.provider.ts
│   │   │   │   ├── anthropic.provider.ts
│   │   │   │   └── google.provider.ts
│   │   │   └── executor.ts              # Agent execution engine
│   │   │
│   │   ├── automation/                  # Workflow engine
│   │   │   ├── engine.ts
│   │   │   ├── triggers/
│   │   │   ├── actions/
│   │   │   └── conditions.ts
│   │   │
│   │   ├── integrations/                # External adapters
│   │   │   ├── email/
│   │   │   │   ├── email.interface.ts
│   │   │   │   └── resend.provider.ts
│   │   │   ├── maps/
│   │   │   │   ├── maps.interface.ts
│   │   │   │   └── google-maps.provider.ts
│   │   │   ├── calendar/
│   │   │   └── whatsapp/
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── db/
│   │   │   │   └── client.ts            # Prisma client singleton
│   │   │   ├── queue/
│   │   │   │   └── bullmq.ts            # Job queue setup
│   │   │   └── cache/
│   │   │       └── redis.ts             # Redis client
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── permission.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   ├── rate-limit.middleware.ts
│   │   │   └── audit.middleware.ts
│   │   │
│   │   ├── types/                       # Shared TypeScript types
│   │   ├── utils/
│   │   ├── config/
│   │   │   └── env.ts                   # Environment variable validation
│   │   └── app.ts                       # Express app setup
│   │
│   ├── prisma/
│   │   ├── schema.prisma                # Full schema (see DATABASE.md)
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                                # Architecture documentation
│   ├── ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── AI_ARCHITECTURE.md
│   ├── AUTOMATION.md
│   ├── AUTHORIZATION.md
│   ├── INTEGRATIONS.md
│   ├── DEVELOPMENT_GUIDE.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   └── PROJECT_STRUCTURE.md             (this file)
│
├── stitch_eduvault_ai_hunter_interface/ # Stitch design exports (READ ONLY)
│
├── docker-compose.yml                   # Local dev infrastructure
├── .env.example
└── README.md
```

---

## Routing Map

```
/                           → Redirect to /dashboard or /login
/splash                     → Splash/loading screen
/login                      → Login gateway
/onboarding                 → Onboarding flow
  /onboarding/business      → Step 1: Business info
  /onboarding/workspace     → Step 2: Workspace setup
  /onboarding/ai-config     → Step 3: AI configuration
  /onboarding/success       → Onboarding complete

/dashboard                  → Command Center (main dashboard)

/discovery                  → AI School Discovery Center
  /discovery/maps           → Maps Intelligence Agent
  /discovery/scout          → Scout Agent

/schools                    → Schools list
  /schools/:id              → School 360° Profile
  /schools/:id/website      → Website Vision AI
  /schools/:id/contacts     → School contacts

/contacts                   → Contacts list
  /contacts/:id             → Contact Intelligence Profile

/leads                      → Lead Intelligence Database
  /leads/:id                → Lead detail
  /leads/icp                → ICP Intelligence

/campaigns                  → Campaign Command Center
  /campaigns/new            → Campaign Builder
  /campaigns/:id            → Campaign detail
  /campaigns/:id/sequence   → Sequence Composer
  /campaigns/marketplace    → Blueprint Marketplace

/communication              → Unified Inbox
  /communication/outreach   → AI Outreach Studio
  /communication/whatsapp   → WhatsApp Studio
  /communication/calls      → Call Intelligence
  /communication/templates  → Message Templates

/sales                      → Sales overview
  /sales/pipeline           → Sales Pipeline (Kanban)
  /sales/deals              → Deals list
  /sales/deals/:id          → Deal Intelligence Workspace
  /sales/tasks              → Task Manager
  /sales/calendar           → Sales Calendar
  /sales/meetings           → Meeting Scheduler
  /sales/forecast           → Revenue Forecast

/customers                  → Customer list
  /customers/:id            → Customer 360°
  /customers/health         → Health & Churn Prediction

/customer-success           → CS Command Center
  /customer-success/strategy → CS Strategist

/support                    → AI Support Copilot

/renewals                   → Renewal & Expansion Center
  /renewals/expansion       → Upsell & Cross-sell Engine

/revenue                    → Revenue Intelligence
  /revenue/forecast         → Revenue Forecast Center

/marketing                  → Marketing Command Center
  /marketing/content        → AI Content Studio
  /marketing/audiences      → AI Audience Builder
  /marketing/pages          → Landing Page & Offer Studio
  /marketing/attribution    → Marketing Attribution & ROI
  /marketing/experiments    → Growth Experiment Lab

/automation                 → Automation overview
  /automation/studio        → Workflow Automation Studio
  /automation/:id           → Workflow detail

/ai                         → AI overview
  /ai/agents                → Agent Command Center
  /ai/workforce             → AI Workforce Team View
  /ai/control-tower         → AI Control Tower
  /ai/executions            → Execution Monitor
  /ai/knowledge             → Knowledge & Prompt Center
  /ai/approvals             → Pending Approvals

/intelligence               → Market Intelligence
  /intelligence/market      → Market Opportunity Radar
  /intelligence/competitors → Competitor Intelligence Center
  /intelligence/seo         → SEO & Search Intelligence
  /intelligence/growth      → Growth Intelligence Center

/training                   → Sales Training & Coaching Center
  /training/playbooks       → Playbook Builder
  /training/simulation      → AI Sales Simulation Studio

/executive                  → Executive Command Center
  /executive/intelligence   → Executive Intelligence Layer

/settings                   → Platform Settings
  /settings/organization    → Org settings
  /settings/users           → User management
  /settings/integrations    → Integrations Hub
  /settings/billing         → Billing
  /settings/usage           → Usage stats
```

---

## Component Hierarchy Overview

```
App
└── AppProviders (QueryClient, Auth, WebSocket)
    └── Router
        ├── SplashLayout
        │   └── SplashPage
        ├── AuthLayout
        │   ├── LoginPage
        │   └── ForgotPasswordPage
        ├── FocusedLayout (no sidebar)
        │   └── OnboardingFlow
        └── AppLayout (authenticated)
            ├── TopNavBar
            ├── SideNav
            └── <Outlet>  ← All main pages render here
                ├── DashboardPage
                ├── SchoolsListPage
                ├── SchoolDetailPage
                ├── LeadsPage
                ├── ...etc
```
