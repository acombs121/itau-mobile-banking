/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#FF6423',
        'brand-orange-hover': '#D2531C',
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
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        arimo: ['Arimo', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
