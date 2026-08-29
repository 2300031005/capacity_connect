/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
          950: '#080f1d',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0f766e', // Secondary Teal
          700: '#0f766e',
          800: '#115e59',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          600: '#15803d',
          700: '#166534',
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
        surface: {
          light: '#ffffff',
          dark: '#111827',
          elevated: '#172033',
        },
        border: {
          light: '#e2e8f0',
          dark: '#263244',
        }
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
