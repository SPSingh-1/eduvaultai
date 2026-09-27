# EduVault AI — Development Guide

## Getting Started

This guide covers everything a developer needs to understand, run, and contribute to the EduVault AI codebase.

---

## Repository Structure

```
eduvault-ai/
├── frontend/                    # React/Vite frontend application
│   ├── src/
│   │   ├── app/                 # Application shell, router, providers
│   │   │   ├── router/          # Centralized route definitions
│   │   │   ├── providers/       # Context providers (auth, theme, query)
│   │   │   ├── layouts/         # Layout components (App, Auth, Splash)
│   │   │   └── config/          # App-level configuration
│   │   │
│   │   ├── components/          # Shared/reusable UI components
│   │   │   ├── ui/              # Base primitives (shadcn/ui based)
│   │   │   ├── common/          # Common cross-domain components
│   │   │   ├── data-display/    # Tables, charts, KPI cards
│   │   │   ├── forms/           # Form building blocks
│   │   │   ├── feedback/        # Alerts, toasts, modals, drawers
│   │   │   └── ai/              # AI-specific components
│   │   │
│   │   ├── features/            # Domain feature modules
│   │   │   ├── dashboard/       # Main dashboard / command center
│   │   │   ├── schools/         # School discovery & profiles
│   │   │   ├── leads/           # Lead management
│   │   │   ├── contacts/        # Contact intelligence
│   │   │   ├── discovery/       # AI school discovery center
│   │   │   ├── campaigns/       # Campaign builder & management
│   │   │   ├── communication/   # Unified inbox & messaging
│   │   │   ├── sales/           # Pipeline, deals, tasks, calendar
│   │   │   ├── crm/             # CRM tools
│   │   │   ├── customers/       # Customer 360 view
│   │   │   ├── onboarding/      # App onboarding & customer onboarding
│   │   │   ├── customer-success/ # CS command center
│   │   │   ├── renewals/        # Renewal & expansion center
│   │   │   ├── revenue/         # Revenue forecast & analytics
│   │   │   ├── automation/      # Workflow automation studio
│   │   │   ├── marketing/       # Marketing command center
│   │   │   ├── ai-workforce/    # AI agent team management
│   │   │   ├── market-intelligence/ # Market & search intelligence
│   │   │   ├── competitors/     # Competitor radar
│   │   │   ├── analytics/       # Analytics & attribution
│   │   │   ├── training/        # Sales training & coaching
│   │   │   ├── simulations/     # AI sales simulation studio
│   │   │   ├── executive/       # Executive command center
│   │   │   └── settings/        # Platform settings & governance
│   │   │
│   │   ├── services/            # Frontend service layer
│   │   │   ├── api/             # API client (axios + React Query)
│   │   │   ├── auth/            # Auth service & token management
│   │   │   ├── websocket/       # WebSocket client & subscriptions
│   │   │   └── ai/              # AI request builders
│   │   │
│   │   ├── hooks/               # Global reusable React hooks
│   │   ├── stores/              # Zustand global state stores
│   │   ├── types/               # Global TypeScript types
│   │   ├── utils/               # Utility functions
│   │   ├── lib/                 # Library wrappers & config
│   │   ├── config/              # Constants, feature flags
│   │   └── styles/              # Global CSS, design tokens
│   │
│   ├── public/                  # Static assets
│   ├── index.html               # Vite entry point
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                     # Node.js/Express backend
│   ├── src/
│   │   ├── api/                 # Route handlers (thin controllers)
│   │   │   ├── auth/
│   │   │   ├── schools/
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
│   │   ├── services/            # Business logic services
│   │   │   ├── school.service.ts
│   │   │   ├── lead.service.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── campaign.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── scoring.service.ts
│   │   │   └── ...
│   │   │
│   │   ├── ai/                  # AI layer
│   │   │   ├── agents/          # Individual agent implementations
│   │   │   ├── tools/           # Tool definitions
│   │   │   ├── context/         # Context builders
│   │   │   ├── providers/       # AI model provider adapters
│   │   │   └── executor.ts      # Agent execution engine
│   │   │
│   │   ├── automation/          # Workflow engine
│   │   │   ├── engine.ts        # Core workflow executor
│   │   │   ├── triggers/        # Trigger handlers
│   │   │   ├── actions/         # Action executors
│   │   │   └── conditions.ts    # Condition evaluator
│   │   │
│   │   ├── integrations/        # External service adapters
│   │   │   ├── email/
│   │   │   ├── maps/
│   │   │   ├── calendar/
│   │   │   ├── whatsapp/
│   │   │   └── ai-providers/
│   │   │
│   │   ├── infrastructure/      # Database, queue, cache
│   │   │   ├── db/              # Prisma client, connection
│   │   │   ├── queue/           # BullMQ setup and job definitions
│   │   │   ├── cache/           # Redis client wrapper
│   │   │   └── storage/         # File storage client
│   │   │
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.ts          # JWT validation
│   │   │   ├── permission.ts    # Permission checking
│   │   │   ├── rateLimit.ts     # Rate limiting
│   │   │   ├── validate.ts      # Zod validation
│   │   │   └── audit.ts         # Audit logging
│   │   │
│   │   ├── types/               # TypeScript types & Zod schemas
│   │   ├── utils/               # Utility functions
│   │   └── config/              # Configuration loading
│   │
│   ├── prisma/                  # Prisma schema and migrations
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   └── tsconfig.json
│
├── docs/                        # Architecture documentation
│   ├── ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── AI_ARCHITECTURE.md
│   ├── AUTOMATION.md
│   ├── AUTHORIZATION.md
│   ├── INTEGRATIONS.md
│   ├── DEVELOPMENT_GUIDE.md     (this file)
│   └── IMPLEMENTATION_ROADMAP.md
│
├── stitch_eduvault_ai_hunter_interface/  # Original Stitch designs (source of truth)
│
├── docker-compose.yml           # Local dev: PostgreSQL, Redis, MinIO
├── .env.example                 # Environment variable template
└── README.md
```

---

## Feature Module Structure

Every feature follows the same internal structure:

```
features/schools/
├── components/           # UI components for this feature only
│   ├── SchoolCard.tsx
│   ├── SchoolTable.tsx
│   └── SchoolFilters.tsx
├── pages/                # Full page components (mounted by router)
│   ├── SchoolsListPage.tsx
│   ├── SchoolDetailPage.tsx
│   └── SchoolDiscoveryPage.tsx
├── hooks/                # Feature-specific hooks
│   ├── useSchools.ts
│   ├── useSchoolDetail.ts
│   └── useDiscovery.ts
├── services/             # API calls for this feature
│   └── schools.api.ts
├── types/                # Feature-specific TypeScript types
│   └── school.types.ts
├── schemas/              # Zod validation schemas
│   └── school.schemas.ts
└── index.ts              # Public exports
```

---

## Coding Standards

### TypeScript

- **Strict mode enabled** (`strict: true`)
- No `any` types — use `unknown` and narrow appropriately
- All function parameters and return types explicit
- Use enums for finite sets of values
- Prefer interfaces for object shapes
- Use `type` for union types and computed types

### React Components

```typescript
// Component file structure
import type { FC } from 'react';

interface Props {
  // Always define explicit props interface
}

const SchoolCard: FC<Props> = ({ ... }) => {
  // Hooks at the top
  // Derived state next
  // Handlers next
  // JSX return last
  return (...);
};

export default SchoolCard;
```

- Functional components only (no class components)
- Custom hooks for all business logic
- No business logic in JSX
- One component per file

### Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Components | PascalCase | `SchoolCard`, `AIStatusBadge` |
| Hooks | `use` prefix | `useSchools`, `useAIAgent` |
| Services | `service` suffix | `school.service.ts` |
| API functions | Descriptive verbs | `createSchool`, `getLeadById` |
| Constants | UPPER_SNAKE | `MAX_SCHOOLS_PER_PAGE` |
| Types/Interfaces | PascalCase | `School`, `LeadStatus` |
| Enums | PascalCase + members PascalCase | `LeadStatus.Qualified` |
| Files | kebab-case | `school-card.tsx`, `use-schools.ts` |

### API Calls (Frontend)

All API calls use TanStack Query:

```typescript
// Fetching
const { data: schools, isLoading } = useQuery({
  queryKey: ['schools', filters],
  queryFn: () => schoolsApi.list(filters),
});

// Mutations
const { mutate: createSchool } = useMutation({
  mutationFn: schoolsApi.create,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schools'] }),
});
```

### Backend Services

Services contain business logic. Controllers (route handlers) should be thin:

```typescript
// WRONG — logic in controller
router.post('/leads', async (req, res) => {
  const score = await calculateScore(req.body);
  const lead = await db.lead.create({ ...req.body, score });
  res.json(lead);
});

// CORRECT — thin controller, rich service
router.post('/leads', validate(createLeadSchema), async (req, res) => {
  const lead = await leadService.create(req.orgId, req.body);
  res.json({ success: true, data: lead });
});
```

---

## Environment Variables

```env
# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/eduvault_ai

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AI...

# Email
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM_DOMAIN=mail.eduvault.ai

# Maps
GOOGLE_MAPS_API_KEY=...

# Storage
STORAGE_PROVIDER=local   # or 's3'
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...

# Monitoring
SENTRY_DSN=...
```

---

## Local Development Setup

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Backend setup
cd backend
npm install
cp .env.example .env   # Fill in values
npx prisma migrate dev
npx prisma db seed
npm run dev

# 3. Frontend setup
cd frontend
npm install
npm run dev

# App running at:
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
# API docs: http://localhost:3001/api/docs
```

---

## Git Workflow

```
main                 — Production branch (protected)
develop              — Integration branch
feature/schools-ui   — Feature branches
fix/lead-scoring     — Bug fix branches
```

**Commit message format:** `type(scope): description`
Examples:
- `feat(schools): add CSV import functionality`
- `fix(leads): correct score calculation for new schools`
- `docs(api): update lead endpoints documentation`

---

## Testing Strategy

### Unit Tests (Vitest)
- Services (business logic)
- Utility functions
- Zod schemas

### Component Tests (Testing Library)
- UI components in isolation
- Hook behavior

### Integration Tests
- API endpoint tests with real DB (test container)
- Workflow engine tests

### E2E Tests (Playwright) — Phase 10+
- Critical user journeys only

---

## Development Principles Summary

1. **Domain first** — Organize by business domain, not technical layer
2. **Thin controllers** — Business logic lives in services, not route handlers
3. **Typed everything** — No shortcuts with `any`
4. **Single responsibility** — Each module/component/function does one thing
5. **Explicit over implicit** — Clear names, explicit types, documented decisions
6. **No premature abstraction** — Build the obvious thing first; refactor when patterns emerge
7. **AI is isolated** — No AI provider SDK calls outside the `ai/` directory
8. **Integrations are adapters** — No external SDK calls outside `integrations/`
9. **Always test the service layer** — UI can change, but business logic must be tested
10. **Audit everything** — Any meaningful state change should be in the audit log
