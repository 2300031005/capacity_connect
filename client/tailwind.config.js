/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Legacy tokens (preserved to avoid breaking existing pages) ---
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb', // Primary Blue
          700: '#1d4ed8', // Blue Hover
          800: '#1e40af',
          900: '#1e3a8a',
        },
        navy: {
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
        'pragati-surface': '#FFFFFF', // Card / panel surface
        background: '#F7F9FB',       // App background
        'pragati-border': '#D7E0E7', // Borders and dividers
        // Additive upstream scale tokens
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0f766e',
          700: '#0f766e',
          800: '#115e59',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          600: '#b45309',
          700: '#92400e',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          600: '#b91c1c',
          700: '#991b1b',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          600: '#0369a1',
          700: '#075985',
        },
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'dropdown': '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
        'modal': '0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}

