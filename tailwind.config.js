import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,tsx}'],
  /* shadcn/ui expects Tailwind preflight for correct borders, box-sizing, and form defaults */
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        base: ['15px', { lineHeight: '20px' }],
      },
      colors: {
        border: 'hsl(var(--shadcn-border) / <alpha-value>)',
        input: 'hsl(var(--shadcn-input) / <alpha-value>)',
        ring: 'hsl(var(--shadcn-ring) / <alpha-value>)',
        background: 'hsl(var(--shadcn-background) / <alpha-value>)',
        foreground: 'hsl(var(--shadcn-foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--shadcn-primary) / <alpha-value>)',
          foreground: 'hsl(var(--shadcn-primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--shadcn-secondary) / <alpha-value>)',
          foreground: 'hsl(var(--shadcn-secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--shadcn-destructive) / <alpha-value>)',
          foreground: 'hsl(var(--shadcn-destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--shadcn-muted) / <alpha-value>)',
          foreground: 'hsl(var(--shadcn-muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--shadcn-accent) / <alpha-value>)',
          foreground: 'hsl(var(--shadcn-accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--shadcn-popover) / <alpha-value>)',
          foreground: 'hsl(var(--shadcn-popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--shadcn-card) / <alpha-value>)',
          foreground: 'hsl(var(--shadcn-card-foreground) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--shadcn-radius)',
        md: 'calc(var(--shadcn-radius) - 2px)',
        sm: 'calc(var(--shadcn-radius) - 4px)',
        control: 'var(--shadcn-radius-control)',
        pill: 'var(--shadcn-radius-pill)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
