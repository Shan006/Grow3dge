import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          surface: 'var(--color-bg-surface)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          default: 'var(--color-border-default)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-accent-primary)',
          'gradient-start': 'var(--color-accent-gradient-start)',
          'gradient-end': 'var(--color-accent-gradient-end)',
        },
        badge: {
          'earned-bg': 'var(--color-badge-earned-bg)',
          'earned-text': 'var(--color-badge-earned-text)',
          'locked-bg': 'var(--color-badge-locked-bg)',
          'locked-text': 'var(--color-badge-locked-text)',
          'needs-attention-bg': 'var(--color-badge-needs-attention-bg)',
          'needs-attention-text': 'var(--color-badge-needs-attention-text)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        full: 'var(--radius-full)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
