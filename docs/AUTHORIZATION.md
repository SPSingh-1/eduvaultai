# EduVault AI — Authorization Architecture

## Overview

EduVault AI uses Role-Based Access Control (RBAC) with permission-based fine-grained control. Roles are assigned per organization (not globally), supporting multi-tenant isolation.

---

## Roles

| Role | Description |
|---|---|
| `owner` | Full access. Billing, org deletion. One per org. |
| `admin` | Full access except billing. Can manage users. |
| `manager` | Manage their team. View all data in their scope. |
| `sales` | Full access to sales pipeline, leads, contacts. |
| `marketing` | Full access to campaigns, content. View leads. |
| `customer_success` | Full access to customer records, renewals. |
| `support` | View customer records. Create support tasks. |
| `analyst` | Read-only access to all analytics. Cannot modify data. |
| `viewer` | Read-only across all modules. |
| `ai_operator` | Manage AI agents, review/approve AI actions. |

---

## Permission Matrix

### School Discovery

| Action | owner | admin | manager | sales | marketing | cs | support | analyst | viewer | ai_operator |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View schools | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Create/edit schools | Y | Y | Y | Y | N | N | N | N | N | N |
| Delete schools | Y | Y | Y | N | N | N | N | N | N | N |
| Trigger discovery | Y | Y | Y | Y | N | N | N | N | N | Y |

### Leads

| Action | owner | admin | manager | sales | marketing | cs | support | analyst | viewer | ai_operator |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View all leads | Y | Y | Y | Y | Y | Y | N | Y | Y | N |
| View assigned leads only | - | - | - | Y | - | - | - | - | - | - |
| Create leads | Y | Y | Y | Y | Y | N | N | N | N | N |
| Edit lead status | Y | Y | Y | Y | N | N | N | N | N | N |
| Delete leads | Y | Y | Y | N | N | N | N | N | N | N |

### Communication

| Action | owner | admin | manager | sales | marketing | cs | support | analyst | viewer | ai_operator |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View messages | Y | Y | Y | Y | Y | Y | Y | Y | N | N |
| Send messages | Y | Y | Y | Y | Y | Y | N | N | N | N |
| Manage templates | Y | Y | Y | N | Y | N | N | N | N | N |

### Campaigns

| Action | owner | admin | manager | sales | marketing | cs | support | analyst | viewer | ai_operator |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View campaigns | Y | Y | Y | Y | Y | Y | N | Y | Y | N |
| Create/edit campaigns | Y | Y | Y | N | Y | N | N | N | N | N |
| Launch campaigns | Y | Y | Y | N | Y | N | N | N | N | N |

### Sales Pipeline

| Action | owner | admin | manager | sales | marketing | cs | support | analyst | viewer | ai_operator |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View pipeline | Y | Y | Y | Y | N | N | N | Y | Y | N |
| Manage deals | Y | Y | Y | Y | N | N | N | N | N | N |
| View forecast | Y | Y | Y | Y | N | N | N | Y | N | N |

### Customers & CS

| Action | owner | admin | manager | sales | marketing | cs | support | analyst | viewer | ai_operator |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View customers | Y | Y | Y | Y | Y | Y | Y | Y | Y | N |
| Edit customer records | Y | Y | Y | N | N | Y | N | N | N | N |
| View health scores | Y | Y | Y | Y | N | Y | Y | Y | Y | N |

### AI & Automation

| Action | owner | admin | manager | sales | marketing | cs | support | analyst | viewer | ai_operator |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View AI control tower | Y | Y | Y | N | N | N | N | Y | N | Y |
| Configure agents | Y | Y | N | N | N | N | N | N | N | Y |
| Approve AI actions | Y | Y | Y | Y | Y | Y | N | N | N | Y |
| Manage workflows | Y | Y | Y | N | Y | Y | N | N | N | Y |

### Settings

| Action | owner | admin | manager | sales | marketing | cs | support | analyst | viewer | ai_operator |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Manage users | Y | Y | N | N | N | N | N | N | N | N |
| Manage integrations | Y | Y | N | N | N | N | N | N | N | N |
| Billing | Y | N | N | N | N | N | N | N | N | N |
| Org settings | Y | Y | N | N | N | N | N | N | N | N |

---

## Implementation Architecture

### Permission Checking

Permissions are **never** hardcoded in React components. Instead:

```typescript
// Frontend — use a hook
const { can } = usePermissions();
if (can('leads:create')) { ... }
if (can('ai:approve_actions')) { ... }

// Backend — use middleware
router.post('/leads', requirePermission('leads:create'), createLeadHandler);
router.post('/ai/approvals/:id/approve', requirePermission('ai:approve_actions'), approveHandler);
```

### Permission Definition

```typescript
const PERMISSIONS = {
  // Schools
  'schools:view': ['owner', 'admin', 'manager', 'sales', 'marketing', 'cs', 'support', 'analyst', 'viewer', 'ai_operator'],
  'schools:create': ['owner', 'admin', 'manager', 'sales'],
  'schools:edit': ['owner', 'admin', 'manager', 'sales'],
  'schools:delete': ['owner', 'admin', 'manager'],

  // Leads
  'leads:view_all': ['owner', 'admin', 'manager', 'marketing', 'analyst', 'viewer'],
  'leads:view_assigned': ['sales'],
  'leads:create': ['owner', 'admin', 'manager', 'sales', 'marketing'],
  'leads:edit': ['owner', 'admin', 'manager', 'sales'],
  'leads:delete': ['owner', 'admin', 'manager'],

  // AI
  'ai:view_control_tower': ['owner', 'admin', 'manager', 'analyst', 'ai_operator'],
  'ai:configure_agents': ['owner', 'admin', 'ai_operator'],
  'ai:approve_actions': ['owner', 'admin', 'manager', 'sales', 'marketing', 'cs', 'ai_operator'],

  // Settings
  'settings:manage_users': ['owner', 'admin'],
  'settings:billing': ['owner'],
  'settings:integrations': ['owner', 'admin'],
} as const;
```

### Data Scoping (Row-Level Security)

Beyond role permissions, data visibility is scoped:

- **sales** role: Sees only leads/deals assigned to them by default (manager can grant "view all")
- **cs** role: Sees only customers in their portfolio by default
- All roles: Always scoped to their organization (enforced at service layer)

### Token Structure

```typescript
interface JWTPayload {
  sub: string;           // userId
  org: string;           // organizationId
  role: UserRole;        // primary role
  permissions: string[]; // explicit permission overrides (optional)
  iat: number;
  exp: number;
}
```

---

## Organization Switching

When a user belongs to multiple organizations:

1. JWT contains `org` for the active organization
2. User can call `POST /auth/organizations/switch` to get a new token for another org
3. All API calls are scoped to the org in the active token

---

## Superadmin

EduVault internal team members can have a `superadmin` flag that allows cross-organization access. This is:
- Stored separately from the normal user/role system
- All actions logged with elevated audit detail
- Time-limited access tokens (max 4 hours per session)
- Not exposed to customer organizations
