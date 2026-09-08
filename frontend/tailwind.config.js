/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': 'rgb(var(--brand-orange-rgb, 255 100 35) / <alpha-value>)',
        'brand-orange-hover': 'rgb(var(--brand-orange-hover-rgb, 210 83 28) / <alpha-value>)',
        'brand-primary': 'var(--brand-primary, #FF6423)',
        'brand-secondary': 'var(--brand-secondary, #002D62)',
        'hero-bg': '#070707',
        'body-bg': '#F3F3F3',
        'text-main': '#070707',
        'text-inverse': '#FFFFFF',
        'text-muted': '#798B97',
      },
      borderRadius: {
        'btn': '4px',
        'card': '8px',
      },
      fontFamily: {
        itau: ['"Itau Text"', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        itauDisplay: ['"Itau Display"', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        sans: ['"Itau Text"', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        arimo: ['Arimo', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
