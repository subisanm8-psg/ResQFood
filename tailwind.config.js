/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FFFBEA',
          page: '#FFFBEA',
          card: '#FFFFFF',
        },
        butter: {
          50: '#FFFAED',
          100: '#FFF3C4', // Soft background
          200: '#F9E08B', // Main accent
          300: '#F2C94C', // Buttons, highlights
          DEFAULT: '#F2C94C',
        },
        brown: {
          primary: '#5A3A22',   // Primary text and buttons
          secondary: '#7B5233', // Secondary
          caramel: '#B8793A',   // Caramel accent
          border: '#E8D9B5',    // Borders
          50: '#FBF8F3',
          100: '#F4ECE1',
          200: '#E8D9B5',
          300: '#D4BD91',
          400: '#B8793A',
          500: '#96602F',
          600: '#7B5233',
          700: '#5A3A22',
          800: '#422A17',
          900: '#2A1A0D',
          DEFAULT: '#5A3A22',
        },
        status: {
          green: '#4F8A5B', // Safe
          amber: '#E0A100', // Warning
          red: '#C0492F',   // Critical
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Noto Sans Tamil', 'system-ui', '-apple-system', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 8px -2px rgba(90, 58, 34, 0.06), 0 1px 3px 0 rgba(90, 58, 34, 0.04)',
        'card': '0 6px 18px -4px rgba(90, 58, 34, 0.08), 0 2px 6px -2px rgba(90, 58, 34, 0.04)',
        'card-hover': '0 12px 28px -6px rgba(90, 58, 34, 0.12), 0 4px 10px -2px rgba(90, 58, 34, 0.06)',
        'elevation': '0 16px 36px -6px rgba(90, 58, 34, 0.14), 0 6px 14px -4px rgba(90, 58, 34, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
