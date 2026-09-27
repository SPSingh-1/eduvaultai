# EduVault AI — Implementation Roadmap

## Overview

Implementation is divided into 15 phases. Each phase delivers working, shippable software. Do NOT attempt multiple phases simultaneously.

**Rule:** Complete each phase, verify it works, then proceed to the next.

---

## Phase 0: Architecture + Design System Foundation
**Duration:** 1-2 weeks
**Status:** IN PROGRESS (architecture documentation created)

### Deliverables
- [x] Stitch design analysis complete
- [x] Architecture documentation created (ARCHITECTURE.md, DESIGN_SYSTEM.md, DATABASE.md, API.md, AI_ARCHITECTURE.md, AUTOMATION.md, AUTHORIZATION.md, INTEGRATIONS.md, DEVELOPMENT_GUIDE.md)
- [ ] Architecture reviewed and approved
- [ ] Frontend project scaffolded (Vite + React + TS + Tailwind)
- [ ] Backend project scaffolded (Express + Prisma)
- [ ] Docker Compose for local dev
- [ ] Tailwind design tokens configured (colors, typography, spacing from Stitch)
- [ ] Global CSS utilities (glass-panel, glass-card, shader backgrounds)
- [ ] Base UI components extracted (Button, Input, Card, Badge, Modal)
- [ ] App shell layout components (AppLayout, AuthLayout, SplashLayout)
- [ ] CI/CD skeleton

### Key Files Created
- `frontend/tailwind.config.ts` — Full design token configuration
- `frontend/src/styles/globals.css` — Glassmorphism utilities, scrollbar, animations
- `frontend/src/components/ui/` — Button, Input, Badge, Card, Modal, Drawer
- `backend/prisma/schema.prisma` — Full database schema

---

## Phase 1: Application Shell + Authentication
**Duration:** 1 week

### Screens from Stitch
- `eduvault_ai_splash_screen` — Loading/splash screen with WebGL animation
- `eduvault_ai_login_gateway` — Login screen (split layout, glassmorphism)
- `eduvault_onboarding_business_info` — Onboarding step 1
- `eduvault_onboarding_workspace_setup` — Onboarding step 2
- `eduvault_onboarding_ai_config` — Onboarding step 3
- `eduvault_onboarding_success` — Onboarding complete

### Backend Work
- Auth endpoints (login, logout, refresh, register)
- Organization creation
- JWT middleware
- Basic user management

### Frontend Work
- React Router setup with route guards
- Zustand auth store
- Splash screen with WebGL shader
- Login page (pixel-accurate to Stitch)
- Multi-step onboarding flow
- `useAuth` hook

### Done Criteria
- User can create account, complete onboarding, and reach dashboard

---

## Phase 2: Main Dashboard (Command Center)
**Duration:** 1 week

### Screens from Stitch
- `eduvault_ai_command_center` — Main dashboard
- `eduvault_ai_sales_hunter` — Sales hunter overview

### Backend Work
- Dashboard analytics endpoint
- Basic KPI aggregations
- Placeholder data for unbuilt modules

### Frontend Work
- AppLayout (top nav + sidebar)
- Dashboard page with:
  - KPI cards (New Schools, Qualified Leads, Emails Sent, Demos Booked, Revenue)
  - AI Workforce status widget
  - Recent activity feed
  - Quick actions panel
- Navigation between sections (routes work, pages are stubs)

### Done Criteria
- Authenticated user sees dashboard with live KPI cards

---

## Phase 3: School Discovery
**Duration:** 2 weeks

### Screens from Stitch
- `ai_school_discovery_center` — Discovery search interface
- `maps_intelligence_agent_eduvault_ai` — Map-based discovery
- `scout_ai_discovery_eduvault_ai` — Scout agent view
- `360_school_intelligence_profile_abc_preparatory_academy` — School profile
- `school_onboarding_intelligence_eduvault_ai` — School intelligence profile
- `website_vision_ai_eduvault_ai` — Website research view

### Backend Work
- Schools CRUD API
- Maps integration (Google Places)
- Discovery job queue
- School deduplication logic
- Website research service (basic)

### Frontend Work
- School Discovery Center page
- Maps Intelligence view (interactive map)
- School list with filters
- School 360° profile page
- Website Intelligence panel
- CSV import

### Done Criteria
- User can discover schools via search + maps, view school profiles, import CSV

---

## Phase 4: Lead Intelligence
**Duration:** 1.5 weeks

### Screens from Stitch
- `ai_lead_intelligence_database` — Lead list/database
- `ai_lead_intelligence_eduvault_ai` — Lead detail/intelligence
- `contact_intelligence_eduvault_ai` — Contact profile
- `ideal_customer_profile_intelligence_eduvault_ai_1` — ICP builder
- `ideal_customer_profile_intelligence_eduvault_ai_2` — ICP detail

### Backend Work
- Leads CRUD API
- Lead scoring engine (rule-based first, AI-enhanced later)
- Contact management API
- ICP configuration API

### Frontend Work
- Lead database page (table with filters)
- Lead detail page with score breakdown
- Contact intelligence profile
- ICP builder
- Lead scoring dashboard widget

### Done Criteria
- Schools converted to leads, leads scored, contacts managed

---

## Phase 5: Communication + Email
**Duration:** 2 weeks

### Screens from Stitch
- `ai_outreach_studio_eduvault_ai` — Email writing/personalization
- `ai_omnichannel_messaging_hub_eduvault_ai` — Unified inbox
- `unified_ai_communication_inbox_eduvault_ai` — Communication inbox
- `ai_reply_assistant_eduvault_ai` — Reply assistant
- `conversation_intelligence_center_eduvault_ai` — Conversation intelligence
- `ai_whatsapp_conversation_studio_eduvault_ai` — WhatsApp studio
- `ai_calling_call_intelligence_eduvault_ai` — Call intelligence

### Backend Work
- Email provider integration
- Message CRUD + send API
- Unified inbox API
- Template management
- Delivery tracking (webhooks)
- Unsubscribe / opt-out handling

### Frontend Work
- Unified inbox
- Email outreach studio
- Reply assistant panel
- Message templates
- WhatsApp conversation view (display only, send in Phase 6)
- Call log view

### Done Criteria
- Emails sent to school contacts, inbox receives replies, templates managed

---

## Phase 6: CRM + Sales Pipeline
**Duration:** 2 weeks

### Screens from Stitch
- `ai_sales_pipeline_eduvault_ai` — Kanban pipeline
- `deal_intelligence_workspace_eduvault_ai` — Deal workspace
- `ai_sales_task_manager_eduvault_ai` — Task manager
- `ai_sales_calendar_eduvault_ai` — Sales calendar
- `ai_meeting_scheduler_eduvault_ai` — Meeting scheduler
- `ai_sales_strategist_eduvault_ai` — Sales strategy

### Backend Work
- Deals CRUD API
- Tasks CRUD API
- Calendar integration (Google/Outlook)
- Meeting scheduling API
- Pipeline analytics

### Frontend Work
- Kanban pipeline (drag-and-drop)
- Deal workspace
- Task manager
- Sales calendar
- Meeting scheduler

### Done Criteria
- Full sales pipeline with deals, tasks, and calendar management

---

## Phase 7: AI Workforce
**Duration:** 2 weeks

### Screens from Stitch
- `ai_agent_command_center_eduvault_ai` — Agent management
- `team_ai_workforce_eduvault_ai` — AI team view
- `ai_control_tower_eduvault_ai` — Control tower
- `workflow_execution_monitor_eduvault_ai` — Execution monitor
- `ai_knowledge_prompt_center_eduvault_ai` — Knowledge & prompt center

### Backend Work
- AI agent infrastructure
- Agent configuration API
- Task queue and execution engine
- Approval system
- AI execution logging

### Frontend Work
- AI Control Tower (real-time dashboard)
- Agent management cards
- Execution monitor
- Approval queue UI
- Agent configuration

### Done Criteria
- AI agents visible, configurable, and monitored. Lead Scoring Agent + Email Personalization Agent working.

---

## Phase 8: Campaigns + Automation
**Duration:** 2 weeks

### Screens from Stitch
- `ai_campaign_builder_eduvault_ai` — Campaign builder
- `ai_campaign_command_center_eduvault_ai` — Campaign center
- `ai_campaign_strategy_generator_eduvault_ai_1` / `_2` — Strategy generator
- `ai_campaign_blueprint_marketplace_eduvault_ai` — Blueprint marketplace
- `ai_sequence_composer_eduvault_ai` — Sequence composer
- `ai_workflow_automation_studio_eduvault_ai` — Automation studio
- `ai_automation_studio_eduvault_ai` — Automation builder

### Backend Work
- Campaign CRUD + launch API
- Email sequence engine
- Workflow automation engine (triggers + actions)
- Campaign analytics

### Frontend Work
- Campaign builder wizard
- Campaign command center
- Sequence composer (visual editor)
- Workflow automation studio (visual canvas)
- Blueprint marketplace

### Done Criteria
- Multi-step email campaigns run automatically, workflows trigger on events

---

## Phase 9: Customer Success
**Duration:** 1.5 weeks

### Screens from Stitch
- `customer_360_intelligence_eduvault_ai` — Customer 360
- `customer_health_churn_prediction_eduvault_ai` — Health & churn
- `ai_customer_success_command_center_eduvault_ai` — CS command center
- `ai_customer_success_strategist_eduvault_ai` — CS strategist
- `customer_feedback_sentiment_intelligence_eduvault_ai` — Feedback intelligence
- `ai_support_copilot_eduvault_ai` — Support copilot

### Backend Work
- Customer records API
- Health score calculation
- Churn prediction model
- Feedback/NPS tracking

### Frontend Work
- Customer 360 view
- Health score dashboard
- CS Command Center
- Churn risk list
- Support Copilot panel

### Done Criteria
- Customer health monitored, at-risk customers identified, CS workflows active

---

## Phase 10: Revenue + Renewals + Expansion
**Duration:** 1.5 weeks

### Screens from Stitch
- `renewal_expansion_center_eduvault_ai` — Renewal & expansion
- `ai_revenue_forecast_center_eduvault_ai` — Revenue forecast
- `ai_upsell_cross_sell_engine_eduvault_ai` — Upsell engine

### Backend Work
- Renewal tracking API
- Expansion opportunity detection
- Revenue forecasting (AI-assisted)
- Subscription management API

### Frontend Work
- Renewal center
- Revenue forecast dashboard
- Upsell/cross-sell opportunity list
- Expansion analytics

### Done Criteria
- Renewals tracked, revenue forecasted, upsell opportunities surfaced

---

## Phase 11: Marketing
**Duration:** 1.5 weeks

### Screens from Stitch
- `ai_marketing_command_center_eduvault_ai_1` / `_2` — Marketing center
- `ai_content_studio_eduvault_ai_1` / `_2` — Content studio
- `ai_audience_builder_eduvault_ai_1` / `_2` — Audience builder
- `ai_landing_page_offer_studio_eduvault_ai_1` / `_2` — Landing page studio
- `ai_marketing_attribution_roi_center_eduvault_ai_1` / `_2` — Attribution & ROI
- `ai_seo_search_intelligence_eduvault_ai` — SEO intelligence
- `ai_growth_experiment_lab_eduvault_ai_1` / `_2` — Growth lab
- `ai_growth_intelligence_center_eduvault_ai` — Growth intelligence

### Frontend Work
- Marketing command center
- AI content studio
- Audience builder
- Landing page & offer studio
- ROI attribution dashboard
- SEO intelligence
- Growth experiment lab

### Done Criteria
- Marketing team can create content, build audiences, and track attribution

---

## Phase 12: Market + Competitor Intelligence
**Duration:** 1 week

### Screens from Stitch
- `ai_market_intelligence_opportunity_radar_eduvault_ai` — Market radar
- `ai_competitor_intelligence_center_eduvault_ai` — Competitor intelligence

### Backend Work
- Market monitoring cron jobs
- Competitor tracking (public signals)
- Opportunity detection AI

### Frontend Work
- Market Opportunity Radar
- Competitor Intelligence Center

### Done Criteria
- Market trends and competitor movements visible

---

## Phase 13: Analytics + Executive Command Center
**Duration:** 1.5 weeks

### Screens from Stitch
- `executive_command_center_eduvault_ai` — Executive command center
- `executive_intelligence_layer` — Intelligence layer
- `ai_sales_training_coaching_center_eduvault_ai` — Training center
- `ai_sales_playbook_builder_eduvault_ai` — Playbook builder
- `ai_sales_simulation_studio_eduvault_ai` — Simulation studio

### Backend Work
- Cross-domain analytics aggregation
- Executive report generation (AI)
- Sales playbook management
- Simulation engine (AI persona agent)

### Frontend Work
- Executive Command Center (30-second business view)
- Sales Training Center
- Playbook Builder
- AI Simulation Studio

### Done Criteria
- Leadership has full business overview; reps can train with AI simulations

---

## Phase 14: Integrations Hub + Settings
**Duration:** 1 week

### Screens from Stitch
- `integrations_hub_eduvault_ai` — Integrations hub
- `platform_settings_governance_eduvault_ai` — Settings & governance

### Work
- Complete Integrations Hub UI
- All Settings pages
- API key management
- User management UI
- Billing integration (Stripe/Razorpay)

### Done Criteria
- Platform is fully configurable and integrations can be connected by admins

---

## Phase 15: Production Hardening
**Duration:** 2+ weeks

### Work
- Performance optimization (query optimization, caching strategy)
- Security audit
- Load testing
- Error boundary coverage
- Comprehensive logging
- Monitoring dashboards (uptime, error rates, AI performance)
- Documentation finalization
- Deployment pipeline (CI/CD)
- Backup and recovery procedures
- GDPR/data privacy compliance review

### Done Criteria
- Platform is production-ready for beta customers

---

## Stitch Screen → Feature Mapping

| Stitch Screen | Phase | Feature Module | Route |
|---|---|---|---|
| `eduvault_ai_splash_screen` | 1 | auth | `/` (loading) |
| `eduvault_ai_login_gateway` | 1 | auth | `/login` |
| `eduvault_onboarding_*` | 1 | onboarding | `/onboarding/*` |
| `eduvault_ai_command_center` | 2 | dashboard | `/dashboard` |
| `eduvault_ai_sales_hunter` | 2 | dashboard | `/dashboard` |
| `ai_school_discovery_center` | 3 | discovery | `/discovery` |
| `maps_intelligence_agent_*` | 3 | discovery | `/discovery/maps` |
| `scout_ai_discovery_*` | 3 | discovery | `/discovery/scout` |
| `360_school_intelligence_*` | 3 | schools | `/schools/:id` |
| `website_vision_ai_*` | 3 | schools | `/schools/:id/website` |
| `ai_lead_intelligence_database` | 4 | leads | `/leads` |
| `ai_lead_intelligence_eduvault_ai` | 4 | leads | `/leads/:id` |
| `contact_intelligence_*` | 4 | contacts | `/contacts/:id` |
| `ideal_customer_profile_*` | 4 | leads | `/leads/icp` |
| `ai_outreach_studio_*` | 5 | communication | `/communication/outreach` |
| `ai_omnichannel_messaging_hub_*` | 5 | communication | `/communication/inbox` |
| `unified_ai_communication_inbox_*` | 5 | communication | `/communication` |
| `ai_reply_assistant_*` | 5 | communication | (panel) |
| `ai_whatsapp_conversation_studio_*` | 5 | communication | `/communication/whatsapp` |
| `ai_calling_call_intelligence_*` | 5 | communication | `/communication/calls` |
| `ai_sales_pipeline_*` | 6 | sales | `/sales/pipeline` |
| `deal_intelligence_workspace_*` | 6 | sales | `/sales/deals/:id` |
| `ai_sales_task_manager_*` | 6 | sales | `/sales/tasks` |
| `ai_sales_calendar_*` | 6 | sales | `/sales/calendar` |
| `ai_meeting_scheduler_*` | 6 | sales | `/sales/meetings` |
| `ai_sales_strategist_*` | 6 | sales | (panel) |
| `ai_agent_command_center_*` | 7 | ai-workforce | `/ai/agents` |
| `team_ai_workforce_*` | 7 | ai-workforce | `/ai/workforce` |
| `ai_control_tower_*` | 7 | ai-workforce | `/ai/control-tower` |
| `workflow_execution_monitor_*` | 7 | ai-workforce | `/ai/executions` |
| `ai_knowledge_prompt_center_*` | 7 | ai-workforce | `/ai/knowledge` |
| `ai_campaign_*` | 8 | campaigns | `/campaigns/*` |
| `ai_sequence_composer_*` | 8 | campaigns | `/campaigns/:id/sequence` |
| `ai_workflow_automation_studio_*` | 8 | automation | `/automation` |
| `ai_automation_studio_*` | 8 | automation | `/automation/studio` |
| `customer_360_intelligence_*` | 9 | customers | `/customers/:id` |
| `customer_health_churn_*` | 9 | customers | `/customers/health` |
| `ai_customer_success_command_*` | 9 | customer-success | `/customer-success` |
| `ai_customer_success_strategist_*` | 9 | customer-success | (panel) |
| `ai_support_copilot_*` | 9 | customer-success | `/support` |
| `renewal_expansion_center_*` | 10 | renewals | `/renewals` |
| `ai_revenue_forecast_center_*` | 10 | revenue | `/revenue/forecast` |
| `ai_upsell_cross_sell_engine_*` | 10 | renewals | `/renewals/expansion` |
| `ai_marketing_command_center_*` | 11 | marketing | `/marketing` |
| `ai_content_studio_*` | 11 | marketing | `/marketing/content` |
| `ai_audience_builder_*` | 11 | marketing | `/marketing/audiences` |
| `ai_landing_page_offer_studio_*` | 11 | marketing | `/marketing/pages` |
| `ai_marketing_attribution_roi_*` | 11 | marketing | `/marketing/attribution` |
| `ai_seo_search_intelligence_*` | 12 | market-intelligence | `/intelligence/seo` |
| `ai_growth_experiment_lab_*` | 11 | marketing | `/marketing/experiments` |
| `ai_market_intelligence_*` | 12 | market-intelligence | `/intelligence/market` |
| `ai_competitor_intelligence_*` | 12 | competitors | `/intelligence/competitors` |
| `executive_command_center_*` | 13 | executive | `/executive` |
| `executive_intelligence_layer` | 13 | executive | `/executive/intelligence` |
| `ai_sales_training_coaching_*` | 13 | training | `/training` |
| `ai_sales_playbook_builder_*` | 13 | training | `/training/playbooks` |
| `ai_sales_simulation_studio_*` | 13 | simulations | `/training/simulation` |
| `integrations_hub_*` | 14 | settings | `/settings/integrations` |
| `platform_settings_governance_*` | 14 | settings | `/settings` |

---

## Experimental / Alternative Designs

These screens in the Stitch project appear to be design explorations/variants, not primary screens:

- `cognitive_enterprise` / `cognitive_enterprise_ai_os`
- `lumina_enterprise` / `lumina_enterprise_ai_command_center`
- `lumina_mission_control_1` / `_2`
- `lumina_sales_execution`
- `luminous_enterprise`
- `synthetic_intelligence_os`
- `shader_1` / `shader_2` / `shader_3`
- `three.js_1` / `three.js_2`

These can be used as **inspiration for animations and visual effects** but are not separate pages to implement.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI provider rate limits | Medium | High | Implement queuing + retry with exponential backoff |
| Google Maps API costs | Medium | Medium | Cache results, deduplicate aggressively |
| Email deliverability | Medium | High | Use reputable provider, warm up sending identity |
| WhatsApp API compliance | High | High | Only use official WABA, template-first approach |
| Data privacy / GDPR | Medium | High | Build opt-out from day 1, data retention policies |
| Performance at scale | Low | High | Design for horizontal scaling from start |
| Team knowledge of AI ops | Medium | Medium | Extensive logging + AI control tower visibility |
