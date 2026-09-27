# EduVault AI — Database Architecture

## Database Choice

**Primary Database:** PostgreSQL 15+
**ORM:** Prisma
**Migrations:** Prisma Migrate
**Seeding:** Prisma seed scripts

---

## Design Principles

1. Every table has `organization_id` for multi-tenancy scoping
2. All primary keys use `uuid` (UUID v4)
3. All tables have `created_at` and `updated_at` timestamps
4. Soft deletes via `deleted_at` for critical business records
5. JSON columns for flexible/dynamic data (AI metadata, custom fields)
6. Source tracking on all discovered/imported data

---

## Core Entity Model

### Organizations & Users

```sql
organizations
  id            UUID PK
  name          VARCHAR
  slug          VARCHAR UNIQUE
  plan          ENUM (starter, professional, enterprise)
  settings      JSONB
  created_at    TIMESTAMPTZ
  updated_at    TIMESTAMPTZ

users
  id            UUID PK
  organization_id UUID FK organizations
  email         VARCHAR UNIQUE
  name          VARCHAR
  avatar_url    VARCHAR
  role          ENUM (owner, admin, manager, sales, marketing, customer_success, support, analyst, viewer, ai_operator)
  password_hash VARCHAR
  is_active     BOOLEAN
  last_login_at TIMESTAMPTZ
  created_at    TIMESTAMPTZ
  updated_at    TIMESTAMPTZ

teams
  id            UUID PK
  organization_id UUID FK organizations
  name          VARCHAR
  description   VARCHAR
  created_at    TIMESTAMPTZ

team_members
  team_id       UUID FK teams
  user_id       UUID FK users
  role          ENUM (lead, member)
```

### Schools (Core Discovery Entity)

```sql
schools
  id                  UUID PK
  organization_id     UUID FK organizations
  name                VARCHAR NOT NULL
  type                ENUM (public, private, cbse, icse, state_board, international, other)
  level               ENUM (primary, secondary, higher_secondary, k12)
  address             VARCHAR
  city                VARCHAR
  state               VARCHAR
  pincode             VARCHAR
  country             VARCHAR DEFAULT 'India'
  latitude            DECIMAL(10,8)
  longitude           DECIMAL(11,8)
  website             VARCHAR
  phone               VARCHAR
  email               VARCHAR
  student_count       INTEGER
  staff_count         INTEGER
  established_year    INTEGER
  affiliation_board   VARCHAR
  principal_name      VARCHAR
  logo_url            VARCHAR
  source              ENUM (google_maps, search_engine, csv_import, manual, maps_api)
  source_url          VARCHAR
  source_id           VARCHAR          -- external source identifier
  data_confidence     DECIMAL(3,2)     -- 0.00 to 1.00
  last_verified_at    TIMESTAMPTZ
  website_data        JSONB            -- scraped website intelligence
  enrichment_data     JSONB            -- additional enriched fields
  tags                VARCHAR[]
  is_duplicate        BOOLEAN DEFAULT FALSE
  duplicate_of        UUID FK schools
  deleted_at          TIMESTAMPTZ
  created_at          TIMESTAMPTZ
  updated_at          TIMESTAMPTZ

-- Indexes
CREATE INDEX idx_schools_org ON schools(organization_id);
CREATE INDEX idx_schools_city ON schools(organization_id, city);
CREATE INDEX idx_schools_location ON schools USING GIST(point(longitude, latitude));
```

### Contacts (Decision Makers)

```sql
contacts
  id                UUID PK
  organization_id   UUID FK organizations
  school_id         UUID FK schools
  first_name        VARCHAR
  last_name         VARCHAR
  email             VARCHAR
  phone             VARCHAR
  whatsapp          VARCHAR
  designation       ENUM (principal, vice_principal, director, trustee, it_head, admin_head, other)
  designation_other VARCHAR
  linkedin_url      VARCHAR
  avatar_url        VARCHAR
  is_primary        BOOLEAN DEFAULT FALSE
  email_verified    BOOLEAN DEFAULT FALSE
  opt_out           BOOLEAN DEFAULT FALSE
  opt_out_at        TIMESTAMPTZ
  source            ENUM (website_scrape, linkedin, manual, ai_extracted, csv_import)
  data_confidence   DECIMAL(3,2)
  notes             TEXT
  custom_fields     JSONB
  deleted_at        TIMESTAMPTZ
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ
```

### Leads

```sql
leads
  id                UUID PK
  organization_id   UUID FK organizations
  school_id         UUID FK schools
  contact_id        UUID FK contacts
  assigned_to       UUID FK users
  status            ENUM (new, contacted, engaged, qualified, meeting_scheduled, proposal_sent, negotiating, won, lost, disqualified)
  lead_score        INTEGER           -- 0-100
  score_breakdown   JSONB             -- individual scoring factors
  score_updated_at  TIMESTAMPTZ
  qualification_notes TEXT
  loss_reason       VARCHAR
  source            VARCHAR
  custom_fields     JSONB
  deleted_at        TIMESTAMPTZ
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ

lead_scores
  id              UUID PK
  lead_id         UUID FK leads
  score           INTEGER
  factors         JSONB    -- {school_size: 20, website_quality: 15, ...}
  ai_reasoning    TEXT
  model_version   VARCHAR
  created_at      TIMESTAMPTZ
```

### Activities (All Touchpoints)

```sql
activities
  id                UUID PK
  organization_id   UUID FK organizations
  school_id         UUID FK schools
  lead_id           UUID FK leads
  contact_id        UUID FK contacts
  user_id           UUID FK users
  type              ENUM (email_sent, email_received, email_bounced, call_made, call_received, whatsapp_sent, whatsapp_received, meeting_scheduled, meeting_held, note_added, task_created, task_completed, ai_action)
  direction         ENUM (inbound, outbound)
  subject           VARCHAR
  body              TEXT
  metadata          JSONB             -- channel-specific data
  occurred_at       TIMESTAMPTZ
  created_at        TIMESTAMPTZ
```

### Deals

```sql
deals
  id                UUID PK
  organization_id   UUID FK organizations
  school_id         UUID FK schools
  lead_id           UUID FK leads
  contact_id        UUID FK contacts
  assigned_to       UUID FK users
  name              VARCHAR
  stage             ENUM (discovery, qualification, proposal, negotiation, closed_won, closed_lost)
  value             DECIMAL(12,2)     -- INR
  currency          VARCHAR DEFAULT 'INR'
  probability       INTEGER           -- 0-100
  expected_close_at DATE
  closed_at         TIMESTAMPTZ
  loss_reason       VARCHAR
  notes             TEXT
  products          JSONB
  custom_fields     JSONB
  deleted_at        TIMESTAMPTZ
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ
```

### Campaigns

```sql
campaigns
  id                UUID PK
  organization_id   UUID FK organizations
  created_by        UUID FK users
  name              VARCHAR
  type              ENUM (email, whatsapp, sms, multi_channel)
  status            ENUM (draft, scheduled, active, paused, completed, archived)
  goal              VARCHAR
  target_segment    JSONB             -- filter criteria for audience
  scheduled_at      TIMESTAMPTZ
  started_at        TIMESTAMPTZ
  completed_at      TIMESTAMPTZ
  settings          JSONB             -- sending limits, approval settings
  stats             JSONB             -- cached stats
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ

campaign_sequences
  id                UUID PK
  campaign_id       UUID FK campaigns
  step_number       INTEGER
  name              VARCHAR
  channel           ENUM (email, whatsapp, sms, call)
  delay_days        INTEGER DEFAULT 0
  template_id       UUID FK message_templates
  subject           VARCHAR
  body              TEXT
  ai_personalize    BOOLEAN DEFAULT FALSE
  created_at        TIMESTAMPTZ

campaign_enrollments
  id                UUID PK
  campaign_id       UUID FK campaigns
  contact_id        UUID FK contacts
  lead_id           UUID FK leads
  status            ENUM (active, completed, unsubscribed, bounced, failed)
  current_step      INTEGER DEFAULT 0
  enrolled_at       TIMESTAMPTZ
  completed_at      TIMESTAMPTZ
```

### Communication Messages

```sql
messages
  id                UUID PK
  organization_id   UUID FK organizations
  campaign_id       UUID FK campaigns (nullable)
  sequence_step_id  UUID FK campaign_sequences (nullable)
  contact_id        UUID FK contacts
  lead_id           UUID FK leads (nullable)
  channel           ENUM (email, whatsapp, sms, call)
  direction         ENUM (inbound, outbound)
  from_address      VARCHAR
  to_address        VARCHAR
  subject           VARCHAR
  body              TEXT
  status            ENUM (draft, queued, sending, sent, delivered, opened, clicked, replied, bounced, failed, unsubscribed)
  status_updated_at TIMESTAMPTZ
  sent_at           TIMESTAMPTZ
  delivered_at      TIMESTAMPTZ
  opened_at         TIMESTAMPTZ
  clicked_at        TIMESTAMPTZ
  replied_at        TIMESTAMPTZ
  metadata          JSONB
  created_at        TIMESTAMPTZ

message_templates
  id                UUID PK
  organization_id   UUID FK organizations
  name              VARCHAR
  channel           ENUM (email, whatsapp, sms)
  subject           VARCHAR
  body              TEXT
  variables         VARCHAR[]
  is_ai_generated   BOOLEAN DEFAULT FALSE
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ
```

### Customers & Subscriptions

```sql
customers
  id                UUID PK
  organization_id   UUID FK organizations
  school_id         UUID FK schools
  primary_contact_id UUID FK contacts
  account_manager_id UUID FK users
  status            ENUM (active, at_risk, churned, churning)
  health_score      INTEGER           -- 0-100
  nps_score         INTEGER           -- -100 to 100
  onboarding_status ENUM (not_started, in_progress, completed)
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ

subscriptions
  id                UUID PK
  organization_id   UUID FK organizations
  customer_id       UUID FK customers
  plan              VARCHAR
  modules           VARCHAR[]         -- licensed modules
  seats             INTEGER
  mrr               DECIMAL(12,2)
  arr               DECIMAL(12,2)
  currency          VARCHAR DEFAULT 'INR'
  starts_at         DATE
  expires_at        DATE
  auto_renew        BOOLEAN DEFAULT TRUE
  status            ENUM (trial, active, suspended, cancelled)
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ

renewals
  id                UUID PK
  organization_id   UUID FK organizations
  customer_id       UUID FK customers
  subscription_id   UUID FK subscriptions
  assigned_to       UUID FK users
  status            ENUM (upcoming, in_negotiation, renewed, churned, at_risk)
  due_at            DATE
  value             DECIMAL(12,2)
  renewal_value     DECIMAL(12,2)    -- actual renewal amount
  notes             TEXT
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ
```

### AI Agents & Executions

```sql
ai_agents
  id                UUID PK
  organization_id   UUID FK organizations
  name              VARCHAR
  type              ENUM (discovery, website_research, lead_intelligence, contact_intelligence, lead_scoring, email_personalization, follow_up, sales_strategy, customer_success, churn_prediction, upsell, renewal, market_intelligence, competitor_intelligence, sales_coach, executive_intelligence)
  status            ENUM (active, paused, idle, error)
  configuration     JSONB             -- agent-specific config
  model             VARCHAR           -- AI model identifier
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ

ai_tasks
  id                UUID PK
  organization_id   UUID FK organizations
  agent_id          UUID FK ai_agents
  type              VARCHAR
  priority          ENUM (critical, high, normal, low)
  status            ENUM (queued, running, completed, failed, cancelled, awaiting_approval)
  input             JSONB
  created_at        TIMESTAMPTZ
  started_at        TIMESTAMPTZ
  completed_at      TIMESTAMPTZ

ai_executions
  id                UUID PK
  task_id           UUID FK ai_tasks
  agent_id          UUID FK ai_agents
  status            ENUM (running, completed, failed)
  input             JSONB
  output            JSONB
  reasoning         TEXT              -- chain-of-thought / explanation
  tokens_used       INTEGER
  model             VARCHAR
  duration_ms       INTEGER
  error             TEXT
  created_at        TIMESTAMPTZ
  completed_at      TIMESTAMPTZ

ai_approvals
  id                UUID PK
  organization_id   UUID FK organizations
  task_id           UUID FK ai_tasks
  action_type       VARCHAR           -- 'send_email', 'update_lead', etc.
  action_payload    JSONB
  status            ENUM (pending, approved, rejected)
  reviewed_by       UUID FK users
  reviewed_at       TIMESTAMPTZ
  review_notes      TEXT
  created_at        TIMESTAMPTZ
```

### Automations

```sql
workflows
  id                UUID PK
  organization_id   UUID FK organizations
  name              VARCHAR
  description       TEXT
  status            ENUM (draft, active, paused, archived)
  trigger_type      ENUM (event, schedule, webhook, manual)
  trigger_config    JSONB
  created_by        UUID FK users
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ

workflow_steps
  id                UUID PK
  workflow_id       UUID FK workflows
  parent_step_id    UUID FK workflow_steps (nullable)
  step_type         ENUM (condition, action, wait, ai_action, human_review)
  step_config       JSONB
  position          INTEGER
  created_at        TIMESTAMPTZ

workflow_executions
  id                UUID PK
  workflow_id       UUID FK workflows
  trigger_payload   JSONB
  status            ENUM (running, completed, failed, cancelled)
  started_at        TIMESTAMPTZ
  completed_at      TIMESTAMPTZ
  error             TEXT
```

### Audit Logs

```sql
audit_logs
  id                UUID PK
  organization_id   UUID FK organizations
  user_id           UUID FK users (nullable, null for AI/system actions)
  agent_id          UUID FK ai_agents (nullable)
  action            VARCHAR           -- 'school.created', 'lead.status_changed', etc.
  entity_type       VARCHAR
  entity_id         UUID
  changes           JSONB             -- {before: {...}, after: {...}}
  ip_address        INET
  user_agent        VARCHAR
  created_at        TIMESTAMPTZ

-- Partitioned by month for performance
```

---

## Key Indexes Strategy

```sql
-- All org-scoped queries
CREATE INDEX ON schools(organization_id, created_at DESC);
CREATE INDEX ON leads(organization_id, status, assigned_to);
CREATE INDEX ON messages(organization_id, contact_id, created_at DESC);
CREATE INDEX ON ai_executions(task_id, created_at DESC);
CREATE INDEX ON audit_logs(organization_id, entity_type, entity_id);

-- Full text search
CREATE INDEX ON schools USING GIN(to_tsvector('english', name || ' ' || COALESCE(city, '')));
CREATE INDEX ON contacts USING GIN(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(email, '')));
```

---

## Data Retention Policy

| Table | Retention | Strategy |
|---|---|---|
| `audit_logs` | 2 years | Partition + archive to cold storage |
| `ai_executions` | 90 days | Regular purge job |
| `messages` | 1 year | Soft delete + archive |
| `activities` | 2 years | Partition by month |
| `workflow_executions` | 30 days | Regular purge |

---

## Backup Strategy

- Daily automated backups (pg_dump)
- Point-in-time recovery enabled in production
- Cross-region replica for disaster recovery
