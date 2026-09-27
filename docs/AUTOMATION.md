# EduVault AI — Automation Architecture

## Overview

The automation engine is a generic, event-driven workflow system that can power any repeatable business process. It is domain-agnostic — the same engine runs lead workflows, marketing sequences, customer success playbooks, renewal campaigns, and AI task pipelines.

---

## Core Concepts

### Trigger
An event or condition that starts a workflow execution.

### Condition
A logic gate that branches workflow execution based on data.

### Action
A concrete step that performs work — sending a message, creating a task, updating a record, calling an AI agent, or waiting.

### Wait
A delay step that pauses execution for a fixed duration or until a condition is met.

---

## Workflow Execution Model

```
Trigger fires
     |
     v
Workflow Execution created
     |
     v
Step 1 executed
     |
     v
[Condition?]
   YES        NO
    |          |
    v          v
Branch A    Branch B
    |
    v
[Wait?]
    |
    v
Step 2 executed
    |
    ...
    v
[Human Review Step?]
    |
    v
Workflow Completed / Failed
```

---

## Trigger Types

| Trigger | Description | Example |
|---|---|---|
| `RECORD_CREATED` | Fires when a record is created | New school discovered → start qualification flow |
| `RECORD_UPDATED` | Fires when a field changes | Lead status changed to "Qualified" → start outreach |
| `RECORD_DELETED` | Fires on deletion | - |
| `FIELD_CHANGED` | Fires when a specific field changes | Lead score drops below 40 → alert sales rep |
| `SCORE_THRESHOLD` | Fires when a score crosses a threshold | Health score < 60 → trigger success playbook |
| `DATE_APPROACHING` | Fires N days before a date | Renewal 30 days away → start renewal sequence |
| `DATE_PASSED` | Fires when a date passes | Subscription expired → trigger win-back |
| `INBOUND_MESSAGE` | Fires on new inbound message | Email reply received → notify rep + route |
| `MANUAL` | User-triggered | - |
| `SCHEDULE` | Cron-based | Daily at 9am — send digest |
| `API_WEBHOOK` | External webhook | Calendar booking confirmed → create meeting task |

---

## Condition Operators

```typescript
type ConditionOperator =
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains'
  | 'greater_than' | 'less_than'
  | 'greater_than_or_equal' | 'less_than_or_equal'
  | 'is_empty' | 'is_not_empty'
  | 'in_list' | 'not_in_list'
  | 'date_is_before' | 'date_is_after'
  | 'boolean_is_true' | 'boolean_is_false';
```

Conditions can be grouped with AND/OR logic.

---

## Action Types

| Action | Description | Domain |
|---|---|---|
| `SEND_EMAIL` | Send or queue an email | Communication |
| `SEND_WHATSAPP` | Send WhatsApp message | Communication |
| `SEND_SMS` | Send SMS | Communication |
| `CREATE_TASK` | Create a task for a user | Sales/CS |
| `CREATE_MEETING` | Schedule a meeting | Sales |
| `UPDATE_RECORD` | Update a database field | CRM |
| `CHANGE_LEAD_STATUS` | Move lead through pipeline | Sales |
| `CHANGE_DEAL_STAGE` | Move deal through pipeline | Sales |
| `ENROLL_IN_CAMPAIGN` | Add to campaign | Marketing |
| `REMOVE_FROM_CAMPAIGN` | Remove from campaign | Marketing |
| `TRIGGER_AI_AGENT` | Start an AI agent task | AI |
| `NOTIFY_USER` | In-app notification | Platform |
| `SEND_WEBHOOK` | HTTP POST to external URL | Integration |
| `WAIT` | Pause for duration or condition | Flow Control |
| `HUMAN_REVIEW` | Pause for human review/approval | Governance |
| `BRANCH` | Conditional fork | Flow Control |
| `ADD_TAG` | Add tag to record | Data |
| `REMOVE_TAG` | Remove tag | Data |
| `ASSIGN_TO_USER` | Change record ownership | CRM |

---

## Built-in Workflow Templates

These pre-built templates are available on the platform:

### Lead Workflows
- **New Lead Qualification** — Score → Research → Outreach sequence
- **High-Score Lead Fast Track** — Immediate outreach for score > 80
- **Stalled Lead Revival** — Re-engage leads inactive for 14+ days
- **Meeting No-Show Recovery** — Automated follow-up after missed meeting

### Marketing Workflows
- **Welcome Sequence** — 5-touch email sequence for newly discovered schools
- **Webinar Invite Flow** — Pre/post webinar communication
- **Re-engagement Campaign** — Win back cold leads

### Customer Success Workflows
- **Onboarding Kickoff** — Triggered when deal is won
- **Health Score Alert** — Customer health drops → assign to CS rep
- **Churn Prevention** — AI-triggered intervention for at-risk customers
- **Quarterly Business Review** — Automated QBR scheduling

### Renewal Workflows
- **Renewal Notice (90/60/30 days)** — Sequential renewal notifications
- **Renewal At-Risk Escalation** — Escalate to senior rep
- **Post-Renewal Expansion** — Upsell flow after renewal confirmed

---

## Workflow Data Context

Each workflow execution has access to the triggering record's full context:

```typescript
interface WorkflowContext {
  trigger: {
    type: TriggerType;
    entityType: string;
    entityId: string;
    payload: Record<string, any>;
  };
  school?: School;
  contact?: Contact;
  lead?: Lead;
  deal?: Deal;
  customer?: Customer;
  organization: Organization;
  executionId: string;
  variables: Record<string, any>;   // user-defined workflow variables
}
```

---

## Workflow Builder (Frontend)

The Workflow Automation Studio screen (from Stitch) provides:

- **Visual canvas** — Drag-and-drop workflow builder
- **Trigger selection** — Choose from trigger library
- **Step library** — All action types available
- **Condition editor** — GUI condition builder
- **Template gallery** — Pre-built templates
- **Test mode** — Dry-run with sample data
- **Execution monitor** — Real-time execution status

---

## Execution Guarantee

- Workflow steps use a persistent job queue (BullMQ with Redis)
- Failed steps are retried up to 3 times with exponential backoff
- Dead-letter queue for permanently failed jobs
- All execution states persisted to database for recovery

---

## Rate Limiting & Safeguards

- Maximum emails sent per day per organization (configurable)
- Maximum WhatsApp messages per day (platform limits apply)
- AI agent calls throttled per workflow
- Human review gates cannot be bypassed programmatically
- Workflows cannot be self-triggering (circular execution detection)
