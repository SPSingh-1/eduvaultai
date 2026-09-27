---
name: Cognitive Enterprise AI OS
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394e'
  surface-container-lowest: '#060d20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3e'
  surface-container-highest: '#2d3449'
  on-surface: '#dbe2fd'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#dbe2fd'
  inverse-on-surface: '#283044'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#ffc176'
  on-tertiary: '#472a00'
  tertiary-container: '#f1a02b'
  on-tertiary-container: '#613b00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb960'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dbe2fd'
  surface-variant: '#2d3449'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1600px
---

## Brand & Style

The design system is engineered for high-stakes enterprise decision-making, specifically within the Customer Success domain. The brand personality is authoritative yet assistive, functioning as an "AI Operating System" that clarifies complex data. 

The visual style blends **Minimalism** with **Glassmorphism**. It prioritizes high information density to allow CSMs to monitor large portfolios without excessive scrolling. The interface uses deep slate surfaces and vibrant, meaningful accents to guide the eye toward critical customer health metrics. Every element is designed to feel like a precise instrument: purposeful, translucent, and interconnected.

## Colors

The palette is anchored in a deep slate dark mode to reduce eye strain during extended analysis.

- **Core Surfaces**: The base background uses `#0b1326`. Elevated containers use a slightly lighter slate with variable opacity to create the glass effect.
- **Primary Action**: A bright sky blue (`#38bdf8`) represents the AI's "cognitive" presence and primary interactions.
- **Domain Status**:
    - **Healthy**: Emerald (`#10b981`) indicates high product adoption and positive sentiment.
    - **At Risk**: Amber (`#f59e0b`) flags accounts with declining usage or overdue renewals.
    - **Churn Risk**: Rose (`#ef4444`) signals urgent intervention required.
    - **Expansion**: Violet (`#8b5cf6`) highlights upsell opportunities identified by AI.

## Typography

This design system utilizes **Inter** for all primary UI and editorial content due to its exceptional legibility in high-density environments. To reinforce the "AI OS" aesthetic, **JetBrains Mono** is introduced for metadata, status labels, and telemetry data.

- **Hierarchy**: Use `display` only for high-level dashboard summaries.
- **Labels**: Use `label-caps` for section headers and table column headers to create a structured, technical feel.
- **Density**: Favor `body-sm` for sidebar navigation and secondary data points to maintain high information density without sacrificing clarity.

## Layout & Spacing

The system follows a **4px baseline grid** to ensure precise alignment. The layout model is a **Fluid Grid** that prioritizes horizontal real estate for data tables and multi-column analytics.

- **Breakpoints**: 
  - Mobile (<768px): Single column, full-width cards, 16px margins.
  - Tablet (768px - 1280px): 8-column grid, condensed sidebars.
  - Desktop (>1280px): 12-column grid, permanent "AI Insights" right-rail, 32px margins.
- **Density**: Spacing between related items should default to 8px or 12px to keep the UI compact and professional.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Glassmorphism**. 

1. **Background**: The base layer is a solid `#0b1326`.
2. **Plates (Cards)**: Elevated surfaces use a semi-transparent slate (e.g., `rgba(30, 41, 59, 0.7)`) with a 12px `backdrop-filter: blur()`.
3. **Borders**: Instead of heavy shadows, use **Low-contrast outlines**. Apply a 1px solid border with 10% white opacity to define edges.
4. **Active State**: Use a subtle inner glow (box-shadow: inset) in the primary blue color to indicate the currently focused AI task or selected customer profile.

## Shapes

The shape language balances modern approachability with technical precision. 

- **Cards**: All primary dashboard containers must use a **20px corner radius** as requested. This softens the high-density data and gives the UI a "premium hardware" feel.
- **Small Elements**: Buttons, input fields, and tags use a tighter **8px radius** to maintain a sharp, functional appearance within the larger cards.
- **Status Indicators**: Use circular "pips" for health status to differentiate from rectangular UI components.

## Components

- **AI Insights Cards**: Large-radius cards with a 2px left-border accent colored by the status (e.g., Violet for expansion). Use glassmorphism background effects.
- **Health Chips**: Compact labels with a subtle background tint and high-contrast text. Example: Emerald text on 10% Emerald background.
- **Data Tables**: Zero-border tables. Use alternating row highlights with 5% white opacity. Headers must use `label-caps`.
- **Command Bar**: A centered, floating input field with a heavy backdrop blur and a primary blue glow, acting as the global AI interface.
- **Buttons**:
  - **Primary**: Solid sky blue with white text.
  - **Ghost**: Transparent background with 1px white (15%) border.
- **Activity Feed**: Monospaced timestamping using `data-mono` with vertical connecting lines to show the chronological sequence of AI-detected events.