/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        atlassian: {
          brand: '#0052CC', 
          brandHover: '#0747A6',
          success: '#16AB16', 
          error: '#A4262C', 
          warning: '#FFB900', 
          info: '#0078D4', 
          bg: '#F5F5F5', 
          surface: '#FFFFFF', 
          text: '#242424', 
          subtext: '#616161', 
          border: '#EDEBE9', 
          darkBg: '#1B1B1B', 
          darkSurface: '#242424', 
          darkBorder: '#323130', 
          darkText: '#FFFFFF', 
          darkSubtext: '#ADADAD' 
        }
      },
      fontFamily: {
        sans: ['Inter Tight', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter Tight', 'sans-serif'],
      },
      boxShadow: {
        'atl-card': '0px 1px 2px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.1)',
        'atl-hover': '0px 4px 8px rgba(0, 0, 0, 0.08), 0px 0px 1px rgba(0, 0, 0, 0.1)',
      }
    }
  },
  plugins: [],
}