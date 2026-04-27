/** @type {import('tailwindcss').Config} */
export default {
  content: [
     "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        brand: {
          primary: '#C9653B',    // Burnt Orange
          bg: '#FFF9F4',         // Warm Cream
          card: '#FFFFFF',       // Pure White
          heading: '#1F1F1F',    // Dark Gray/Black
          label: '#6B6B6B',      // Soft Gray
          border: '#E6E0DA',     // Divider
        },
        // Status Accents (Non-harsh)
        status: {
          success: '#A7C4A0',    // Soft Green
          warning: '#E2B07E',    // Muted Amber
          danger: '#D98880',     // Soft Red
        }
      }
    },
  },
  plugins: [],
}

