/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ============================================================
      // EDUVAULT AI DESIGN SYSTEM — Extracted from Stitch designs
      // ============================================================
      colors: {
        // Background scale
        'background':                  '#0b1326',
        'surface':                     '#0b1326',
        'surface-dim':                 '#0b1326',
        'surface-container-lowest':    '#060e20',
        'surface-container-low':       '#131b2e',
        'surface-container':           '#171f33',
        'surface-container-high':      '#222a3d',
        'surface-container-highest':   '#2d3449',
        'surface-bright':              '#31394d',
        'surface-variant':             '#2d3449',

        // Primary — Blue (CTA, active states)
        'primary':                     '#b4c5ff',
        'primary-container':           '#2563eb',
        'on-primary':                  '#002a78',
        'on-primary-container':        '#eeefff',
        'primary-fixed':               '#dbe1ff',
        'primary-fixed-dim':           '#b4c5ff',
        'on-primary-fixed':            '#00174b',
        'on-primary-fixed-variant':    '#003ea8',
        'inverse-primary':             '#0053db',

        // Secondary — Emerald Green (AI active, success)
        'secondary':                   '#4edea3',
        'secondary-container':         '#00a572',
        'on-secondary':                '#003824',
        'on-secondary-container':      '#00311f',
        'secondary-fixed':             '#6ffbbe',
        'secondary-fixed-dim':         '#4edea3',
        'on-secondary-fixed':          '#002113',
        'on-secondary-fixed-variant':  '#005236',

        // Tertiary — Purple/Lavender (AI intelligence, alternate accent)
        'tertiary':                    '#d0bcff',
        'tertiary-container':          '#7d4ce7',
        'on-tertiary':                 '#3c0091',
        'on-tertiary-container':       '#f6edff',
        'tertiary-fixed':              '#e9ddff',
        'tertiary-fixed-dim':          '#d0bcff',
        'on-tertiary-fixed':           '#23005c',
        'on-tertiary-fixed-variant':   '#5516be',

        // Text
        'on-surface':                  '#dae2fd',
        'on-surface-variant':          '#c3c6d7',
        'on-background':               '#dae2fd',

        // Borders
        'outline':                     '#8d90a0',
        'outline-variant':             '#434655',

        // Surface text inversions
        'inverse-surface':             '#dae2fd',
        'inverse-on-surface':          '#283044',

        // Semantic
        'error':                       '#ffb4ab',
        'error-container':             '#93000a',
        'on-error':                    '#690005',
        'on-error-container':          '#ffdad6',
        'warning':                     '#f59e0b',
        'success':                     '#4edea3',

        // Surface tint
        'surface-tint':                '#b4c5ff',
      },

      borderRadius: {
        DEFAULT: '0.25rem',
        'sm':    '0.25rem',
        'md':    '0.375rem',
        'lg':    '0.5rem',
        'xl':    '0.75rem',
        '2xl':   '1rem',
        '3xl':   '1.5rem',
        '24':    '24px',
        '20':    '20px',
        'glass': '20px',
        'full':  '9999px',
      },

      spacing: {
        'unit':               '4px',
        'xs':                 '4px',
        'sm':                 '8px',
        'md':                 '16px',
        'lg':                 '24px',
        'xl':                 '40px',
        '2xl':                '64px',
        'gutter':             '16px',
        'container-padding':  '24px',
        'margin-page':        '24px',
        'max-width':          '1440px',
      },

      fontFamily: {
        'sans':       ['Inter', 'system-ui', 'sans-serif'],
        'mono':       ['JetBrains Mono', 'monospace'],
        'display-lg': ['Inter', 'sans-serif'],
        'display-md': ['Inter', 'sans-serif'],
        'headline-lg':['Inter', 'sans-serif'],
        'headline-md':['Inter', 'sans-serif'],
        'headline-sm':['Inter', 'sans-serif'],
        'body-lg':    ['Inter', 'sans-serif'],
        'body-md':    ['Inter', 'sans-serif'],
        'body-sm':    ['Inter', 'sans-serif'],
        'label-lg':   ['Inter', 'sans-serif'],
        'label-md':   ['Inter', 'sans-serif'],
        'label-sm':   ['Inter', 'sans-serif'],
        'mono-data':  ['JetBrains Mono', 'monospace'],
        'mono-label': ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        'display-lg':   ['48px', { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md':   ['32px', { lineHeight: '1.2',  letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg':  ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md':  ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-sm':  ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg':      ['18px', { lineHeight: '1.6',  fontWeight: '400' }],
        'body-md':      ['16px', { lineHeight: '1.5',  fontWeight: '400' }],
        'body-sm':      ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-lg':     ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-md':     ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
        'label-sm':     ['11px', { lineHeight: '1',    letterSpacing: '0.05em', fontWeight: '600' }],
        'mono-data':    ['13px', { lineHeight: '18px', fontWeight: '500' }],
        'mono-label':   ['12px', { lineHeight: '1',    fontWeight: '400' }],
        'kpi-xl':       ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'kpi-md':       ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
      },

      boxShadow: {
        'glass':        '0 24px 64px -12px rgba(0,0,0,0.5)',
        'glass-sm':     '0 10px 30px -10px rgba(0,0,0,0.5)',
        'glow-primary': '0 0 20px rgba(180,197,255,0.15)',
        'glow-emerald': '0 0 20px rgba(78,222,163,0.15)',
        'glow-purple':  '0 0 20px rgba(208,188,255,0.15)',
        'glow-blue':    '0 0 30px rgba(37,99,235,0.2)',
        'ai-glow':      '0 0 40px rgba(37,99,235,0.3)',
        'inner-glow':   'inset 0 1px 0 rgba(255,255,255,0.1)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glass':  'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
        'gradient-primary':'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        'gradient-hero':   'linear-gradient(135deg, #0b1326 0%, #171f33 50%, #0b1326 100%)',
      },

      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-slow': {
          '0%':   { opacity: '0.7', transform: 'scale(0.98)', boxShadow: '0 0 20px rgba(37,99,235,0.2)' },
          '100%': { opacity: '1',   transform: 'scale(1.02)', boxShadow: '0 0 50px rgba(37,99,235,0.5)' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-emerald': {
          '0%':   { boxShadow: '0 0 0 0 rgba(78,222,163,0.4)' },
          '70%':  { boxShadow: '0 0 0 8px rgba(78,222,163,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(78,222,163,0)' },
        },
        'shimmer': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },

      animation: {
        'fade-up':        'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up-slow':   'fade-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in':        'fade-in 0.5s ease-out forwards',
        'pulse-slow':     'pulse-slow 3s infinite alternate',
        'spin-slow':      'spin-slow 8s linear infinite',
        'pulse-emerald':  'pulse-emerald 2s infinite',
        'shimmer':        'shimmer 2s infinite',
      },

      transitionTimingFunction: {
        'material': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring':   'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
