# EduVault AI — AI Architecture

## Core Philosophy

> **Autonomy with Control:** Humans set the policy, AI executes the mission.

The AI layer is **completely decoupled** from the UI and domain logic. AI agents are first-class system citizens with their own lifecycle, observability, and governance layer.

---

## Design Principles

1. **Explainability** — Every AI recommendation shows the "Why" (chain-of-thought reasoning)
2. **Autonomy with Control** — All high-impact external actions require human approval by default
3. **Auditability** — Every AI execution is logged with input, output, reasoning, and model version
4. **Composability** — Agents can be composed into multi-step pipelines
5. **Testability** — AI actions can be simulated (dry-run mode) without side effects
6. **Graceful Degradation** — System continues to function if AI services are unavailable

---

## AI Agent Execution Model

```
User/Scheduler/Event Trigger
        |
        v
+-------------------+
|   Task Dispatcher |  — Creates AITask record, assigns to agent
+-------------------+
        |
        v
+-------------------+
|  Context Builder  |  — Assembles all relevant data for the task
|                   |    (school data, history, preferences, templates)
+-------------------+
        |
        v
+-------------------+
|   Prompt Builder  |  — Constructs structured prompt with context
|                   |    Selects appropriate model and parameters
+-------------------+
        |
        v
+-------------------+
|    AI Provider    |  — OpenAI / Claude / Gemini / etc.
|                   |    Model call with tools/function calling
+-------------------+
        |
        v
+-------------------+
|   Tool Executor   |  — Executes any tools the model invoked
|                   |    (search web, fetch school data, etc.)
+-------------------+
        |
        v
+-------------------+
|   Result Parser   |  — Structured output parsing & validation
|                   |    Confidence scoring
+-------------------+
        |
        v
+-------------------+
| Human Gate Check  |  — Is this action above threshold for auto-execution?
|                   |    If yes: queue for approval
|                   |    If no: proceed to execution
+-------------------+
        |
        v
+-------------------+
|  Business Action  |  — Writes to database, sends email, creates task, etc.
+-------------------+
        |
        v
+-------------------+
|   Audit Logger    |  — Records full execution with all details
+-------------------+
```

---

## AI Agent Catalog

### Discovery Domain

| Agent | Purpose | Trigger | Output |
|---|---|---|---|
| **School Discovery Agent** | Finds new schools from search engines, maps, directories | Scheduled / Manual | List of `schools` records |
| **Maps Intelligence Agent** | Discovers schools in geographic areas via Maps API | Location search | Geo-enriched school records |
| **Scout Agent** | Rapidly scans and classifies new territories | Geographic campaign | Discovery queue |

### Intelligence Domain

| Agent | Purpose | Trigger | Output |
|---|---|---|---|
| **Website Research Agent** | Analyzes school websites for data enrichment | After discovery | `website_data` JSON on school |
| **Lead Intelligence Agent** | Comprehensive school intelligence profile | Lead qualification | Intelligence report |
| **Contact Intelligence Agent** | Identifies and validates decision-maker contacts | Lead qualification | Contact records |
| **Lead Scoring Agent** | Scores leads 0-100 based on multiple factors | Lead creation / data change | `lead_score` + reasoning |

### Engagement Domain

| Agent | Purpose | Trigger | Output |
|---|---|---|---|
| **Email Personalization Agent** | Creates unique personalized emails for each school | Campaign launch / outreach | Email draft requiring approval |
| **Follow-up Agent** | Determines optimal follow-up strategy | Email sequence | Follow-up task / message draft |
| **Reply Assistant Agent** | Suggests responses to inbound emails | Email reply needed | Response suggestions |
| **Sales Strategy Agent** | Recommends next best action for a lead | Lead stalled / status change | Strategy recommendations |

### Customer Domain

| Agent | Purpose | Trigger | Output |
|---|---|---|---|
| **Customer Success Agent** | Monitors and improves customer health | Scheduled weekly | Health report, action items |
| **Churn Prediction Agent** | Predicts churn risk from usage patterns | Scheduled | Risk score + early warning |
| **Upsell Agent** | Identifies expansion and upsell opportunities | Scheduled | Opportunity report |
| **Renewal Agent** | Manages renewal process intelligently | Renewal approaching | Renewal strategy, outreach drafts |

### Intelligence Domain

| Agent | Purpose | Trigger | Output |
|---|---|---|---|
| **Market Intelligence Agent** | Tracks market trends and opportunities | Scheduled | Intelligence report |
| **Competitor Intelligence Agent** | Monitors competitor activity via public signals | Scheduled | Competitive landscape update |
| **Executive Intelligence Agent** | Synthesizes business-wide insights for leadership | Scheduled / On-demand | Executive summary |

### Training Domain

| Agent | Purpose | Trigger | Output |
|---|---|---|---|
| **Sales Coach Agent** | Provides contextual coaching for sales reps | Deal activity | Coaching suggestions |
| **AI Simulation Agent** | Acts as AI-driven school principal for roleplay | Training session | Simulation scenario |

---

## Agent Configuration

Each agent is configurable per organization:

```typescript
interface AgentConfiguration {
  agentId: string;
  agentType: AgentType;
  isEnabled: boolean;
  model: 'gpt-4o' | 'claude-3-5-sonnet' | 'gemini-1.5-pro';
  approvalPolicy: {
    requireApprovalForEmail: boolean;
    requireApprovalForDataChanges: boolean;
    autoApproveBelow: number;       // confidence threshold 0-1
    maxAutoActionsPerHour: number;
  };
  schedule?: {
    cron: string;
    timezone: string;
  };
  customInstructions?: string;
  budgetPerMonth?: number;          // AI token budget
}
```

---

## Human Approval System

### Approval Policy Levels

| Level | Description | Default |
|---|---|---|
| **Always Approve** | All external actions require human approval | Email send |
| **Confidence-Based** | Auto-approve if confidence > threshold | Data enrichment |
| **Auto-Execute** | No approval required | Internal data scoring |

### Approval Workflow

```
AI proposes action
        |
        v
[Approval Required?]
   YES        NO
    |          |
    v          v
Create      Execute
approval    directly
queue
    |
    v
Notify assigned user
    |
    v
[Human reviews in dashboard]
   APPROVE    REJECT
    |          |
    v          v
Execute     Log rejection
    |       + learn
    v
Audit log
```

---

## AI Tool Library

Agents have access to a curated set of tools:

### Data Access Tools
- `get_school_data(school_id)` — Full school record
- `get_contact_data(contact_id)` — Contact record
- `get_lead_history(lead_id)` — Full activity history
- `search_internal(query)` — Search internal database
- `get_campaign_stats(campaign_id)` — Campaign performance

### Research Tools
- `search_web(query)` — Web search (via approved API)
- `fetch_website(url)` — Fetch and parse website content
- `extract_contacts(website_data)` — Extract contact information
- `lookup_business(name, location)` — Business directory lookup

### Communication Tools
- `draft_email(params)` — Create email draft (does NOT send)
- `draft_whatsapp(params)` — Create WhatsApp message draft
- `create_task(params)` — Create internal task

### Analysis Tools
- `calculate_lead_score(factors)` — Score computation
- `analyze_sentiment(text)` — Sentiment analysis
- `detect_intent(text)` — Intent classification
- `generate_summary(content)` — Content summarization

---

## AI Context Building

The context builder assembles the richest possible context before calling the model:

```typescript
interface TaskContext {
  // Core entity
  school: SchoolRecord;
  contacts: Contact[];
  lead: Lead | null;
  customer: Customer | null;

  // History
  recentActivities: Activity[];
  sentMessages: Message[];
  previousAIExecutions: AIExecution[];

  // Organizational context
  organization: Organization;
  icp: IdealCustomerProfile;          // Ideal customer profile settings
  productInfo: ProductDescription;
  competitorInfo: CompetitorSnapshot;

  // User preferences
  agentInstructions: string;
  tonePreferences: ToneConfig;
  approvalPolicies: ApprovalPolicy;
}
```

---

## AI Safety Controls

### What AI can do automatically (no approval):
- Score leads
- Enrich school data
- Analyze website content
- Generate draft content (emails, reports)
- Update internal database fields (non-critical)
- Create internal tasks and reminders

### What ALWAYS requires human approval:
- Sending any external communication (email, WhatsApp, SMS)
- Creating/cancelling calendar invites with externals
- Marking a lead as Won/Lost
- Any action that involves monetary transactions
- Contacting opted-out contacts

### Circuit Breakers
- Max AI actions per hour per organization (configurable)
- Automatic pause if error rate > 20%
- Automatic pause if token budget exceeded
- Human override to pause all agents immediately

---

## AI Observability

### AI Control Tower (real-time dashboard)
- Live status of all agents
- Tasks in queue / running / completed
- Recent executions with results
- Pending approvals
- Performance metrics (accuracy, efficiency)
- Cost tracking (tokens used / budget)

### AI Execution Log
Every execution records:
- Full input context
- Model response
- Chain-of-thought reasoning
- Tools called and their results
- Final output
- Human decision (if approval required)
- Tokens consumed
- Latency

---

## AI Model Strategy

### Model Selection by Task

| Task Type | Preferred Model | Why |
|---|---|---|
| School discovery | GPT-4o / Gemini 1.5 | Tool use, web search |
| Email personalization | Claude 3.5 Sonnet | Writing quality |
| Lead scoring | GPT-4o mini | Fast, cost-effective |
| Market intelligence | Gemini 1.5 Pro | Long context |
| Sales coaching | GPT-4o | Reasoning quality |
| Quick analysis | GPT-4o mini | Speed + cost |

### Provider Abstraction

```typescript
interface AIProvider {
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  streamComplete(request: CompletionRequest): AsyncGenerator<string>;
  getUsage(): UsageStats;
}

// Implementations
class OpenAIProvider implements AIProvider { ... }
class AnthropicProvider implements AIProvider { ... }
class GoogleAIProvider implements AIProvider { ... }
```

This allows switching or A/B testing providers without changing agent code.

---

## AI Simulation Studio

The AI Simulation Studio (Sales Training feature) uses a specialized agent configuration:

- **Persona Agent** — Plays the role of a school principal with defined characteristics
- **Scenario Generator** — Creates realistic objection scenarios
- **Coach Agent** — Provides real-time feedback on sales rep performance
- **Session Recorder** — Transcribes and analyzes simulation sessions

These run in isolated sandbox environments with no ability to affect production data.
