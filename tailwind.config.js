/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Public Palette (Violet)
        primary: {
          light: '#A78BFA', // violet-400
          DEFAULT: '#7C3AED', // violet-600
          dark: '#5B21B6', // violet-800
        },
        // Admin Palette (Violet variant)
        admin: {
          light: '#8B5CF6', // violet-500
          DEFAULT: '#6D28D9', // violet-700
          dark: '#4C1D95', // violet-900
          navy: '#2E1065', // violet-950
          sidebar: '#1E1B4B', // indigo-950 (dark complementary)
        },
        background: {
          public: '#F5F3FF', // violet-50
          admin: '#EDE9FE',  // violet-100
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
