# EduVault AI — System Architecture

## Overview

EduVault AI is a production-grade, AI-powered sales and marketing SaaS platform for the EduVault School Management Software product. It automates the complete revenue lifecycle from school discovery through retention and expansion.

**Core Vision:** An autonomous AI workforce that discovers schools, qualifies leads, executes outreach, drives sales, and supports customers — with humans setting policy and AI executing the mission.

---

## Architectural Philosophy

### Modular Monolith First

The system starts as a **modular monolith** — a single deployable unit with cleanly bounded internal modules. This approach:

- Keeps the team moving fast without distributed system overhead
- Allows individual modules to be extracted into services later if needed
- Maintains data consistency without the complexity of distributed transactions
- Is debuggable and understandable by a small team

### Business Domain Orientation

All code is organized around **business domains**, not screens or technical layers. This ensures developers can find, understand, and modify everything related to a capability in one place.

---

## System Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)                  │
│         Feature Modules → Shared UI → App Shell           │
└──────────────────────────┬──────────────────────────────┘
                           │ REST / WebSocket
┌──────────────────────────▼──────────────────────────────┐
│                   API Gateway Layer                       │
│         Auth Middleware → Rate Limiting → Routing         │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                 Application Services Layer                │
│     Domain Services → Business Logic → Orchestration      │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    Domain Modules                         │
│  Schools | Leads | Contacts | Campaigns | Sales | ...     │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│               Infrastructure / Data Layer                 │
│    PostgreSQL | Redis | File Storage | Message Queue       │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                   External Services                       │
│   AI Providers | Email | Maps | Calendar | WhatsApp        │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Router v6

**Design System:** Material Design 3 color system (dark mode), Inter + JetBrains Mono fonts, WebGL shader backgrounds, glassmorphism components.

### Shell Layout

Every authenticated screen follows the same layout pattern extracted from the Stitch designs:

```
┌──────────────────────────────────────────────────────┐
│                 Top Navigation Bar (h-16)              │
│  Logo | Primary Nav Links | Actions | User Avatar      │
├────────┬─────────────────────────────────────────────┤
│        │                                              │
│  Side  │            Main Content Area                 │
│  Nav   │      (scrollable, max-w-[1600px])            │
│  (w-64)│                                              │
│        │                                              │
└────────┴─────────────────────────────────────────────┘
```

**Layout types identified in Stitch:**
1. **Auth Layout** — split 45%/55% (login, onboarding)
2. **App Shell Layout** — fixed sidebar + top nav + scrollable content (all main screens)
3. **Splash Layout** — full-screen centered (splash/loading)
4. **Focused Layout** — no sidebar, centered content (onboarding steps)

### State Management

- **Zustand** — lightweight global state for auth, user preferences, active workspace
- **React Query (TanStack Query)** — server state, caching, background refetch
- **React Hook Form + Zod** — form state with schema validation

---

## Backend Architecture

**Runtime:** Node.js + TypeScript
**Framework:** Express.js (can migrate to Fastify for performance later)
**ORM:** Prisma
**Database:** PostgreSQL
**Cache:** Redis (sessions, job queues, real-time state)
**Queue:** BullMQ (background jobs, AI tasks, email sending)
**File Storage:** S3-compatible (local MinIO for dev, AWS S3 for prod)

### API Layer

All APIs follow REST conventions. WebSockets are used for real-time features (AI agent status, live activity feeds).

```
/api/v1/
  /auth          — Authentication & session management
  /organizations — Org management & settings
  /users         — User management & preferences
  /schools       — School records & intelligence
  /contacts      — Contact records
  /leads         — Lead management & scoring
  /campaigns     — Campaign management
  /communication — Email, WhatsApp, SMS, Calls
  /sales         — Pipeline, deals, tasks
  /customers     — Customer records
  /onboarding    — Customer onboarding flows
  /renewals      — Renewal & expansion tracking
  /revenue       — Revenue analytics & forecasting
  /ai            — AI agent management & execution
  /automation    — Workflow automation engine
  /analytics     — Reporting & dashboards
  /integrations  — External service connections
  /settings      — Platform configuration
```

---

## Multi-Tenancy

Every business record is scoped to an `organization_id`. This provides data isolation between customer organizations using the platform.

**Approach:** Shared database with `organization_id` scoping enforced at application service layer.

**Key rules:**
- Every API request must identify the organization via JWT claims
- No cross-organization data leakage
- Superadmin role can span organizations (for EduVault operations team)

---

## Core Business Entities

```
Organization
├── Users (roles, permissions)
├── Teams
├── Schools (discovered targets)
│   ├── Contacts (decision makers)
│   ├── Leads (qualified schools)
│   │   ├── Lead Score
│   │   ├── Activities (emails, calls, meetings)
│   │   └── Campaigns
│   ├── Deals
│   └── Customers
│       ├── Subscriptions
│       ├── Renewals
│       └── Expansion Opportunities
├── Campaigns
│   ├── Sequences
│   └── Messages
├── AI Agents
│   ├── Agent Configurations
│   ├── Agent Tasks
│   └── Agent Executions
└── Automations (Workflows)
    ├── Triggers
    ├── Conditions
    └── Actions
```

---

## Observability

- **Logs:** Structured JSON logging (Winston/Pino)
- **AI Logs:** Dedicated audit trail for every AI execution
- **Error Tracking:** Sentry (frontend + backend)
- **Performance:** Built-in request timing, slow query detection
- **Audit Trail:** Every data mutation logged with actor, timestamp, org context

---

## Security

- JWT-based authentication with refresh tokens
- HTTPS only in production
- CORS configured per environment
- Input validation at API boundary (Zod schemas)
- Rate limiting on all endpoints
- Sensitive AI actions require explicit human approval
- Email sending subject to suppression lists and opt-out compliance
