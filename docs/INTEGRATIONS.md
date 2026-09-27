# EduVault AI — Integrations Architecture

## Design Principle

All external integrations are **isolated behind adapter interfaces**. Domain code never imports provider SDKs directly. This allows switching providers without touching business logic.

---

## Integration Pattern

```typescript
// Define the interface in domain layer
interface EmailProvider {
  sendEmail(params: SendEmailParams): Promise<EmailResult>;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
  createSendingIdentity(params: IdentityParams): Promise<Identity>;
}

// Implement in infrastructure layer
class SendgridEmailProvider implements EmailProvider { ... }
class ResendEmailProvider implements EmailProvider { ... }
class AWSEmailProvider implements EmailProvider { ... }

// Domain service uses the interface only
class EmailService {
  constructor(private provider: EmailProvider) {}
  async send(params: SendEmailParams) {
    return this.provider.sendEmail(params);
  }
}
```

---

## Integration Catalog

### Email Delivery

**Purpose:** Transactional and campaign email delivery

**Recommended provider:** Resend (developer-friendly) or SendGrid

**Interface:**
```typescript
interface EmailProvider {
  sendEmail(params: {
    to: string | string[];
    from: string;
    replyTo?: string;
    subject: string;
    html: string;
    text?: string;
    headers?: Record<string, string>;
    tags?: Record<string, string>;
  }): Promise<{ messageId: string }>;

  trackDelivery(webhookPayload: any): DeliveryEvent;
  processUnsubscribe(email: string): Promise<void>;
  processBounce(email: string, bounceType: string): Promise<void>;
}
```

**Webhook events handled:** delivered, opened, clicked, bounced, spam_complaint, unsubscribed

---

### Google Maps / Places API

**Purpose:** School discovery via geographic search

**Usage:** Search for "schools in [city/area]" → return business listings with location data

**Interface:**
```typescript
interface MapsProvider {
  searchNearby(params: {
    location: { lat: number; lng: number };
    radius: number;         // meters
    type: string;           // 'school'
    keyword?: string;
  }): Promise<PlaceResult[]>;

  getPlaceDetails(placeId: string): Promise<PlaceDetail>;
  geocodeAddress(address: string): Promise<GeoResult>;
}
```

**Implementation:** Google Places API (New)

**Rate limits:** 100 requests/minute (configurable)
**Cost note:** Each request costs API credits — implement caching and deduplication

---

### AI Model Providers

**Purpose:** Power all AI agents

| Provider | Use Case | SDK |
|---|---|---|
| OpenAI | GPT-4o, GPT-4o mini | `openai` npm package |
| Anthropic | Claude 3.5 Sonnet | `@anthropic-ai/sdk` |
| Google AI | Gemini 1.5 Pro/Flash | `@google/generative-ai` |

**Interface:**
```typescript
interface AIModelProvider {
  complete(request: {
    model: string;
    messages: Message[];
    tools?: Tool[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<{
    content: string;
    toolCalls?: ToolCall[];
    usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  }>;
}
```

---

### Web Search / Research

**Purpose:** School discovery, competitor monitoring, market intelligence

**Provider options:**
- Tavily (purpose-built for AI agents)
- Serper (Google Search API)
- Bing Search API

**Interface:**
```typescript
interface WebSearchProvider {
  search(query: string, options?: {
    maxResults?: number;
    region?: string;
    dateFilter?: 'day' | 'week' | 'month';
  }): Promise<SearchResult[]>;

  fetchPage(url: string): Promise<{ content: string; title: string; }>;
}
```

---

### Calendar Integration

**Purpose:** Meeting scheduling and sync

**Providers:** Google Calendar, Microsoft Outlook/Teams

**Interface:**
```typescript
interface CalendarProvider {
  getAvailability(userId: string, dateRange: DateRange): Promise<TimeSlot[]>;
  createEvent(params: CalendarEventParams): Promise<CalendarEvent>;
  updateEvent(eventId: string, params: Partial<CalendarEventParams>): Promise<CalendarEvent>;
  deleteEvent(eventId: string): Promise<void>;
  generateBookingLink(userId: string, config: BookingConfig): Promise<string>;
}
```

---

### WhatsApp Business API

**Purpose:** WhatsApp messaging for outreach and customer communication

**Provider:** Meta WhatsApp Business Platform (official) or via BSP (Twilio, Wati, etc.)

**Phase:** Designed in architecture, implemented in Phase 5+

**Interface:**
```typescript
interface WhatsAppProvider {
  sendMessage(params: {
    to: string;
    template?: { name: string; language: string; components: any[] };
    text?: string;
  }): Promise<{ messageId: string }>;

  sendMedia(params: {
    to: string;
    mediaType: 'image' | 'document' | 'video';
    mediaUrl: string;
    caption?: string;
  }): Promise<{ messageId: string }>;

  processWebhook(payload: any): WhatsAppEvent;
}
```

**Compliance:** Template-only outreach for new contacts. Free-form only within 24h window.

---

### CRM Export / Import

**Purpose:** Bidirectional sync with external CRMs if customer uses one

**Phase:** Integration Hub (later phase)

**Supported (planned):**
- Salesforce
- HubSpot
- Zoho CRM

**Pattern:** Webhook-based sync with conflict resolution strategy

---

### Analytics & Tracking

**Purpose:** Product analytics and error tracking

| Tool | Purpose |
|---|---|
| PostHog | Product analytics, feature flags, session recording |
| Sentry | Error tracking (frontend + backend) |
| LogRocket | Session replay (optional) |

---

### Payment / Billing

**Purpose:** Managing EduVault AI subscriptions

**Phase:** Phase 10+

**Planned provider:** Stripe (or Razorpay for India)

---

## Integration Hub (UI)

The Integrations Hub screen (from Stitch) provides users with:

- Visual list of all available integrations
- Connection status (connected / not connected / error)
- OAuth flow initiation
- API key configuration
- Sync status and last sync time
- Test connection button
- Disconnect option

---

## Secrets Management

All integration API keys and secrets are:
- Stored in the database encrypted at rest (using AES-256)
- Never exposed in API responses
- Accessible only to the integration service layer
- Rotatable without system restart
- Audited on access

```typescript
interface IntegrationCredential {
  organizationId: string;
  provider: IntegrationProvider;
  credentials: EncryptedJSON;   // decrypted only when needed
  scopes: string[];
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```
