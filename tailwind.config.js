/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0f172a',
          800: '#172554', // Primary navy
          700: '#1e3a8a',
        },
        brand: {
          blue: '#2563EB', // Primary blue
          lightBlue: '#DBEAFE', // Light blue
          bg: '#F8FAFC',
          card: '#FFFFFF',
          text: '#1E293B',
          muted: '#64748B',
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
