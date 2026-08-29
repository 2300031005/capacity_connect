/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Legacy tokens (preserved to avoid breaking existing pages) ---
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          900: '#0f172a',
        },
        // --- PRAGATI SIH 2026 Institutional Color System ---
        institutional: '#0B3D62',   // Deep institutional blue — headings, identity
        action: '#005A8D',           // Action blue — buttons, links, active states
        accent: '#E8751A',           // Saffron — warnings, attention, accent
        success: '#16834B',          // Government green — verified, completed, certified
        'dark-text': '#172B3A',      // Primary body text
        muted: '#526575',            // Secondary / muted text
        surface: '#FFFFFF',          // Card / panel surface
        background: '#F7F9FB',       // App background
        'pragati-border': '#D7E0E7', // Borders and dividers
      }
    },
  },
  plugins: [],
}

