/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'df-bg': '#f8f9fa',
        'df-bg-raised': '#ffffff',
        'df-bg-sunken': '#f0ede6',
        'df-fg': '#1a1a1a',
        'df-ink': '#0d1117',
        'df-border': 'rgba(0, 0, 0, 0.09)',
        'df-yellow': '#fbbc05',
        'df-blue': '#4285f4',
        'df-red': '#ea4335',
        'df-green': '#34a853',
        'df-purple': '#a142f4',
        'df-lake': '#1a7f8e',
        'google-blue': '#4285F4',
        'google-red': '#EA4335',
        'google-yellow': '#FBBC04',
        'google-green': '#34A853',
      },
      fontFamily: {
        sans: ['"Google Sans"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
        display: ['"Google Sans"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'badge-warm': 'rgba(158, 42, 31, 0.45) 0px 30px 70px -20px',
        'badge-cloud': 'rgba(66, 133, 244, 0.35) 0px 30px 70px -20px',
        'badge-builder': 'rgba(161, 66, 244, 0.4) 0px 30px 70px -20px',
        'badge-campus': 'rgba(234, 67, 53, 0.35) 0px 30px 70px -20px',
      }
    },
  },
  plugins: [],
}
