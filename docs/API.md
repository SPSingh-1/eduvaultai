# EduVault AI — API Architecture

## API Design Principles

- **REST** for all standard CRUD and business operations
- **WebSockets** for real-time features (AI agent status, live dashboards)
- **Versioned** — all endpoints under `/api/v1/`
- **Consistent response envelope**
- **Standard HTTP status codes**
- **OpenAPI/Swagger documentation** auto-generated

---

## Request/Response Conventions

### Standard Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "LEAD_NOT_FOUND",
    "message": "The requested lead could not be found.",
    "details": { }
  }
}
```

### Pagination

All list endpoints support:
- `?page=1&limit=20` — page-based pagination
- `?cursor=<token>` — cursor-based pagination for real-time feeds

### Filtering

```
GET /api/v1/schools?city=Mumbai&type=cbse&min_students=500
GET /api/v1/leads?status=qualified&assigned_to=me&score_gte=70
GET /api/v1/messages?channel=email&status=opened&after=2026-01-01
```

### Sorting

```
GET /api/v1/schools?sort=created_at:desc
GET /api/v1/leads?sort=lead_score:desc,name:asc
```

---

## Authentication & Authorization Headers

```
Authorization: Bearer <access_token>
X-Organization-ID: <org_uuid>      (optional, inferred from token if not present)
```

---

## API Endpoint Reference

### Auth (`/api/v1/auth`)

```
POST   /auth/login                  — Email/password login
POST   /auth/logout                 — Invalidate session
POST   /auth/refresh                — Refresh access token
POST   /auth/forgot-password        — Send reset email
POST   /auth/reset-password         — Reset with token
POST   /auth/verify-email           — Verify email with token
GET    /auth/me                     — Get current user profile
PATCH  /auth/me                     — Update profile
POST   /auth/organizations          — Create new org (signup)
GET    /auth/organizations          — List user's organizations
POST   /auth/organizations/switch   — Switch active organization
```

### Schools (`/api/v1/schools`)

```
GET    /schools                     — List schools (paginated, filterable)
POST   /schools                     — Create school (manual)
GET    /schools/:id                 — Get school details (360 view)
PATCH  /schools/:id                 — Update school
DELETE /schools/:id                 — Soft delete school
GET    /schools/:id/contacts        — Get school's contacts
GET    /schools/:id/leads           — Get school's leads
GET    /schools/:id/activities      — Get school's activity timeline
GET    /schools/:id/intelligence    — Get AI-generated school intelligence
POST   /schools/import              — CSV import
POST   /schools/deduplicate         — Trigger deduplication scan
```

### Discovery (`/api/v1/discovery`)

```
POST   /discovery/search            — Trigger school search
GET    /discovery/jobs              — List discovery job statuses
GET    /discovery/jobs/:id          — Get job details and results
POST   /discovery/maps              — Discover via Maps API
POST   /discovery/website           — Trigger website research for a school
GET    /discovery/queue             — View pending discovery queue
```

### Contacts (`/api/v1/contacts`)

```
GET    /contacts                    — List contacts
POST   /contacts                    — Create contact
GET    /contacts/:id                — Get contact details
PATCH  /contacts/:id                — Update contact
DELETE /contacts/:id                — Soft delete
GET    /contacts/:id/activities     — Contact activity timeline
POST   /contacts/:id/opt-out        — Mark opt-out
POST   /contacts/import             — CSV import
```

### Leads (`/api/v1/leads`)

```
GET    /leads                       — List leads (filterable by status, score, assigned)
POST   /leads                       — Create lead
GET    /leads/:id                   — Lead details with full context
PATCH  /leads/:id                   — Update lead
DELETE /leads/:id                   — Archive lead
PATCH  /leads/:id/status            — Change lead status
PATCH  /leads/:id/assign            — Assign to user
GET    /leads/:id/score             — Get detailed score breakdown
POST   /leads/:id/rescore           — Trigger AI rescoring
GET    /leads/:id/activities        — Lead activity timeline
GET    /leads/:id/ai-recommendations — AI action suggestions
```

### Campaigns (`/api/v1/campaigns`)

```
GET    /campaigns                   — List campaigns
POST   /campaigns                   — Create campaign
GET    /campaigns/:id               — Campaign details
PATCH  /campaigns/:id               — Update campaign
DELETE /campaigns/:id               — Archive campaign
POST   /campaigns/:id/start         — Launch campaign
POST   /campaigns/:id/pause         — Pause campaign
GET    /campaigns/:id/stats         — Campaign performance stats
GET    /campaigns/:id/enrollments   — List enrolled contacts
POST   /campaigns/:id/enroll        — Enroll contacts/leads
GET    /campaigns/:id/sequences     — Get sequence steps
POST   /campaigns/:id/sequences     — Add sequence step
PATCH  /campaigns/:id/sequences/:stepId — Update step
```

### Communication (`/api/v1/communication`)

```
GET    /communication/inbox         — Unified inbox
GET    /communication/messages      — List messages (filterable by channel, status)
POST   /communication/email/send    — Send email
POST   /communication/whatsapp/send — Send WhatsApp message
GET    /communication/threads/:id   — Get conversation thread
GET    /communication/templates     — List message templates
POST   /communication/templates     — Create template
GET    /communication/templates/:id — Get template
PATCH  /communication/templates/:id — Update template
DELETE /communication/templates/:id — Delete template
```

### Sales Pipeline (`/api/v1/sales`)

```
GET    /sales/pipeline              — Kanban pipeline view data
GET    /sales/deals                 — List deals
POST   /sales/deals                 — Create deal
GET    /sales/deals/:id             — Deal details
PATCH  /sales/deals/:id             — Update deal
PATCH  /sales/deals/:id/stage       — Move deal stage
GET    /sales/tasks                 — List tasks
POST   /sales/tasks                 — Create task
PATCH  /sales/tasks/:id             — Update task
PATCH  /sales/tasks/:id/complete    — Complete task
GET    /sales/calendar              — Calendar events
GET    /sales/meetings              — List meetings
POST   /sales/meetings              — Schedule meeting
GET    /sales/forecast              — Revenue forecast
```

### Customers (`/api/v1/customers`)

```
GET    /customers                   — List customers
GET    /customers/:id               — Customer 360 view
PATCH  /customers/:id               — Update customer
GET    /customers/:id/health        — Health score details
GET    /customers/:id/subscriptions — Subscriptions
GET    /customers/:id/renewals      — Renewal records
GET    /customers/:id/activities    — Activity timeline
POST   /customers/:id/health/update — Trigger health score refresh
GET    /customers/at-risk           — At-risk customers list
```

### Renewals (`/api/v1/renewals`)

```
GET    /renewals                    — List renewals (upcoming, at-risk, etc.)
GET    /renewals/:id                — Renewal details
PATCH  /renewals/:id                — Update renewal
PATCH  /renewals/:id/status         — Change status
GET    /renewals/calendar           — Renewal calendar view
GET    /renewals/analytics          — Renewal analytics
GET    /expansion/opportunities     — Upsell opportunities list
```

### AI Agents (`/api/v1/ai`)

```
GET    /ai/agents                   — List all AI agents
GET    /ai/agents/:id               — Agent details and status
PATCH  /ai/agents/:id               — Update agent config
POST   /ai/agents/:id/start         — Start/resume agent
POST   /ai/agents/:id/pause         — Pause agent
GET    /ai/tasks                    — List AI tasks
GET    /ai/tasks/:id                — Task details
POST   /ai/tasks/:id/cancel         — Cancel task
GET    /ai/executions               — Execution history
GET    /ai/executions/:id           — Execution details with reasoning
GET    /ai/approvals                — Pending approvals queue
POST   /ai/approvals/:id/approve    — Approve AI action
POST   /ai/approvals/:id/reject     — Reject AI action
GET    /ai/control-tower            — Real-time agent status overview
```

### Automation (`/api/v1/automation`)

```
GET    /automation/workflows        — List workflows
POST   /automation/workflows        — Create workflow
GET    /automation/workflows/:id    — Workflow details
PATCH  /automation/workflows/:id    — Update workflow
DELETE /automation/workflows/:id    — Delete workflow
POST   /automation/workflows/:id/activate   — Activate workflow
POST   /automation/workflows/:id/deactivate — Deactivate workflow
GET    /automation/workflows/:id/executions — Execution history
POST   /automation/workflows/:id/trigger    — Manual trigger
```

### Analytics (`/api/v1/analytics`)

```
GET    /analytics/dashboard         — Dashboard KPIs
GET    /analytics/schools           — School discovery metrics
GET    /analytics/leads             — Lead funnel analytics
GET    /analytics/campaigns         — Campaign performance
GET    /analytics/sales             — Sales performance
GET    /analytics/revenue           — Revenue analytics & forecast
GET    /analytics/ai-performance    — AI agent performance
GET    /analytics/customer-health   — Customer health overview
GET    /analytics/market            — Market intelligence
GET    /analytics/competitors       — Competitor monitoring
```

### Settings (`/api/v1/settings`)

```
GET    /settings/organization       — Org settings
PATCH  /settings/organization       — Update org settings
GET    /settings/users              — List users
POST   /settings/users/invite       — Invite user
PATCH  /settings/users/:id/role     — Change user role
DELETE /settings/users/:id          — Remove user
GET    /settings/integrations       — Integration statuses
POST   /settings/integrations/:key/connect    — Connect integration
DELETE /settings/integrations/:key/disconnect — Disconnect
GET    /settings/billing            — Billing info
GET    /settings/usage              — Platform usage stats
```

---

## WebSocket Events

### Client → Server

```json
{ "type": "subscribe", "channel": "ai_agents" }
{ "type": "subscribe", "channel": "lead_feed", "filters": { "status": "qualified" } }
{ "type": "unsubscribe", "channel": "ai_agents" }
```

### Server → Client

```json
{ "type": "agent_status_changed", "data": { "agent_id": "...", "status": "running" } }
{ "type": "ai_execution_completed", "data": { "task_id": "...", "result": {...} } }
{ "type": "lead_created", "data": { "lead_id": "...", "school": {...} } }
{ "type": "message_received", "data": { "message_id": "...", "contact": {...} } }
{ "type": "approval_required", "data": { "approval_id": "...", "action": {...} } }
{ "type": "notification", "data": { "title": "...", "body": "..." } }
```

---

## Rate Limiting

| Endpoint Category | Limit |
|---|---|
| Auth endpoints | 10 req/min per IP |
| Standard read endpoints | 100 req/min per user |
| Standard write endpoints | 30 req/min per user |
| AI trigger endpoints | 10 req/min per org |
| Email send endpoints | 50 req/min per org |
| Bulk import endpoints | 5 req/min per org |

---

## Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | No valid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_UNAVAILABLE` | 503 | AI service temporarily unavailable |
| `ORG_SUSPENDED` | 403 | Organization account suspended |
| `QUOTA_EXCEEDED` | 402 | Usage quota exceeded |
