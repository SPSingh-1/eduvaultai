# EduVault AI — Design System

## Overview

The EduVault AI design system is derived directly from the Stitch design files. All implementations must reference these tokens. Do NOT hardcode color values or typography directly in components.

---

## Design Identity

**Theme:** Dark mode first, enterprise-grade, AI-forward
**Aesthetic:** Glassmorphism + deep navy backgrounds + blue/violet/emerald accents
**Feel:** High-density professional workspace with subtle animations

---

## Color Palette

The palette is based on Material Design 3 with a custom dark scheme.

### Core Background Scale

| Token | Hex Value | Usage |
|---|---|---|
| `background` | `#0b1326` | Page background, main surface |
| `surface` | `#0b1326` | Same as background |
| `surface-dim` | `#0b1326` | Lowest elevation |
| `surface-container-lowest` | `#060e20` | Deepest recessed areas |
| `surface-container-low` | `#131b2e` | Sidebar, nav backgrounds |
| `surface-container` | `#171f33` | Card backgrounds |
| `surface-container-high` | `#222a3d` | Elevated cards, hover states |
| `surface-container-highest` | `#2d3449` | Highest elevation elements |
| `surface-bright` | `#31394d` | Highlighted areas |
| `surface-variant` | `#2d3449` | Input borders, dividers |

### Brand Colors

| Token | Hex Value | Usage |
|---|---|---|
| `primary` | `#b4c5ff` | Primary text, icons, active states |
| `primary-container` | `#2563eb` | Primary buttons, active backgrounds |
| `on-primary` | `#002a78` | Text on primary-container |
| `on-primary-container` | `#eeefff` | Text inside primary containers |
| `primary-fixed` | `#dbe1ff` | Light primary for special uses |
| `primary-fixed-dim` | `#b4c5ff` | Dimmed primary |

### Secondary / Accent

| Token | Hex Value | Usage |
|---|---|---|
| `secondary` | `#4edea3` | Success, growth, AI active states |
| `secondary-container` | `#00a572` | Secondary button backgrounds |
| `tertiary` | `#d0bcff` | Alternative accent, purple tones |
| `tertiary-container` | `#571bc1` | Tertiary highlights |

### Semantic Colors

| Token | Hex Value | Usage |
|---|---|---|
| `error` | `#ffb4ab` | Error states |
| `error-container` | `#93000a` | Error backgrounds |
| `warning` | `#f59e0b` | Warning indicators |

### Text Colors

| Token | Hex Value | Usage |
|---|---|---|
| `on-surface` | `#dae2fd` | Primary body text |
| `on-surface-variant` | `#c3c6d7` | Secondary/muted text |
| `on-background` | `#dae2fd` | Same as on-surface |
| `outline` | `#8d90a0` | Borders, placeholder text |
| `outline-variant` | `#434655` | Subtle borders |

---

## Typography

### Font Families

| Role | Font | Usage |
|---|---|---|
| Primary UI | **Inter** | All display, headline, body text |
| Monospace Data | **JetBrains Mono** | Code, AI outputs, data labels, terminal-style text |
| Icons | **Material Symbols Outlined** | All icons (variable font) |

### Type Scale

| Token | Size | Line Height | Weight | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `display-lg` | 48px | 1.1 | 700 | -0.02em | Hero headings |
| `display-md` | 32px | 1.2 | 600 | 0 | Page titles |
| `headline-lg` | 32px | 40px | 600 | -0.01em | Section headers |
| `headline-md` | 24px | 32px | 600 | -0.01em | Card titles |
| `headline-sm` | 18-24px | 24-32px | 600 | 0 | Small section titles |
| `body-lg` | 18px | 1.6 | 400 | 0 | Long-form text |
| `body-md` | 16px | 1.5 | 400 | 0 | Standard body |
| `body-sm` | 14px | 20px | 400 | 0 | Secondary body |
| `label-lg` | 14px | 20px | 500 | 0 | Navigation labels |
| `label-md` | 12-14px | 16-20px | 500 | 0.02em | Tags, chips |
| `label-sm` | 11-13px | 1 | 500-600 | 0.05em | Caps labels, metadata |
| `mono-data` | 13px | 18px | 500 | 0.02em | Data values, live feeds |

---

## Spacing System

Base unit: **4px**

| Token | Value | Usage |
|---|---|---|
| `xs` / `unit` | 4px | Micro gaps |
| `sm` | 8px | Tight spacing |
| `md` / `gutter` | 16-24px | Standard gaps |
| `lg` | 24-32px | Section padding |
| `xl` | 40-48px | Large section gaps |
| `container-padding` | 24px | Page edge padding |
| `max-width` | 1440-1600px | Content max width |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `DEFAULT` | 4px | Micro elements |
| `lg` | 8px | Chips, tags |
| `xl` | 12px | Cards, inputs |
| `2xl` / `24` | 24px | Large cards, modals |
| `full` | 9999px | Avatars, pills |

---

## Glassmorphism Utilities

These are the core visual layer components found throughout all Stitch screens:

### `.glass-panel`
```css
background: rgba(11, 19, 38, 0.4);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-top: 1px solid rgba(255, 255, 255, 0.15);
box-shadow: 0 24px 64px -12px rgba(0, 0, 0, 0.5);
```

### `.glass-card`
```css
background: rgba(19, 27, 46, 0.5);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.05);
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### `.glass-card:hover`
```css
background: rgba(19, 27, 46, 0.7);
border: 1px solid rgba(180, 197, 255, 0.2);
transform: translateY(-2px);
box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
```

---

## Animations

### Standard Animations

| Name | Description | Usage |
|---|---|---|
| `fade-up` | opacity 0→1, translateY 20px→0 | Page entry, card appearance |
| `pulse-slow` | Slow scale + glow pulse | AI active indicators, logo |
| `spin-slow` | 8s linear infinite rotation | Loading rings, AI scanners |
| `pulse-emerald` | Box shadow pulse in emerald | Active/online status dots |

### Motion Principles
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard)
- **Fast interactions:** 150-200ms
- **Component transitions:** 300ms
- **Page transitions:** 400-500ms
- **AI animations:** 2-3s slow pulse cycles

---

## Scrollbar

Custom webkit scrollbar used throughout:
```css
::-webkit-scrollbar { width: 6-8px; }
::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
```

---

## Icon System

**Library:** Material Symbols Outlined (variable font)

**Variable font settings:**
- Standard: `font-variation-settings: 'FILL' 0, 'wght' 400`
- Filled/Active: `font-variation-settings: 'FILL' 1`
- Icon size follows text scale — use `text-[18px]`, `text-[20px]`, `text-2xl` etc.

---

## Component Catalog

### Buttons

**Primary Button**
```
background: linear-gradient(135deg, #2563eb, #1d4ed8)
hover: scale(1.02) + glow shadow
height: 48-56px, rounded-xl
```

**Secondary/Ghost Button**
```
background: transparent
border: 1px solid rgba(255,255,255,0.1)
hover: background rgba(255,255,255,0.05)
```

**AI/Action Button**
```
background: gradient from primary to secondary
text: on-primary
Used for: "Deploy Hunter", "Launch Agent", "New Lead"
```

### Form Inputs (`.premium-input`)
```
background: rgba(23, 31, 51, 0.5)
border: 1px solid rgba(255, 255, 255, 0.1)
color: #dae2fd
focus: border-color #2563eb + box-shadow ring
placeholder: #8d90a0
height: 48px, rounded-xl
```

### KPI Cards (Dashboard)
```
glass-panel + rounded-xl
Contains: label (grid-header, uppercase, muted) + value (kpi-md/kpi-xl) + trend
Ambient glow: absolute circle with primary/secondary color at 10% opacity
```

### Status Indicators

| Color | Meaning |
|---|---|
| Emerald `#4edea3` | Online, Active, Success, Growth |
| Blue `#b4c5ff` / `#2563eb` | Primary actions, Processing |
| Purple `#d0bcff` | AI-specific, Intelligence |
| Amber `#f59e0b` | Warning, Pending |
| Red `#ffb4ab` | Error, Blocked |

---

## Layout Grid

- **12-column grid** used on dashboard/complex screens
- **`gap-gutter`** (16-24px) between columns
- **Bento grid pattern** — cards span different column counts for visual hierarchy
- Typical breakpoints: `lg:col-span-4`, `lg:col-span-8` etc.

---

## WebGL Shaders

Several screens use WebGL canvas shaders for animated backgrounds (simplex noise, neural network particles). These are identified with `STITCH_SHADER_START` / `STITCH_SHADER_END` comments.

In the React implementation, encapsulate these as a `<ShaderBackground />` component using a custom hook that manages the WebGL context lifecycle.

---

## Three.js Animations

Splash and some marketing screens use Three.js brain/neural network 3D visualizations. Encapsulate as `<NeuralNetworkVisualization />` component using `@react-three/fiber`.

---

## Dark Mode

The application is **dark mode only** (enforced via `html.dark` class). No light mode toggle is required in Phase 1.
