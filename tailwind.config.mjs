/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0F1117',
        'surface-low': '#181B22',
        'surface-mid': '#212631',
        'surface-high': '#2D3342',
        hairline: '#333A48',
        'hairline-strong': '#475569',
        fg: '#F1F5F9',
        'fg-muted': '#94A3B8',
        'fg-subtle': '#7C8AA0', // was #64748B — lifted to pass WCAG AA (4.5:1) on canvas
        focus: '#10B981',
        'focus-soft': '#34D399',
        recovery: '#F59E0B',
        'recovery-soft': '#FBBF24',
        plan: '#6366F1',
        'plan-soft': '#A5B4FC',
        danger: '#FB7185',
        'danger-strong': '#E11D48',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans Variable"', 'Segoe UI', 'sans-serif'],
        // `font-heading` is used throughout the markup but was never defined,
        // so every heading silently fell back to Inter.
        heading: ['"Plus Jakarta Sans Variable"', 'Segoe UI', 'sans-serif'],
        sans: ['"Inter Variable"', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'Consolas', 'monospace'],
      },
      // Size-specific tracking + leading (Apple: tighten as type grows, loosen as it shrinks)
      fontSize: {
        'display-xl': ['clamp(2.5rem, 6vw, 4.25rem)', { lineHeight: '1.05', letterSpacing: '-0.028em' }],
        'display-lg': ['clamp(2.125rem, 4.4vw, 3.25rem)', { lineHeight: '1.08', letterSpacing: '-0.024em' }],
        'display-md': ['clamp(1.5rem, 2.6vw, 1.875rem)', { lineHeight: '1.2', letterSpacing: '-0.016em' }],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 4px 16px -2px rgba(0, 0, 0, 0.45)',
        pop: '0 8px 24px -4px rgba(0, 0, 0, 0.65)',
        'focus-glow': '0 0 0 1px #10B981, 0 0 16px -4px rgba(16, 185, 129, 0.25)',
        'glow-amber': '0 0 0 1px rgba(245, 158, 11, 0.35), 0 24px 60px -20px rgba(245, 158, 11, 0.22)',
        window: '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 40px 80px -24px rgba(0,0,0,0.75), 0 12px 24px -12px rgba(0,0,0,0.5)',
      },
      transitionTimingFunction: {
        // critically-damped-feeling ease-out (no overshoot) for non-gesture UI
        calm: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
