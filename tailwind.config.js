/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A73E8',
        secondary: '#0F172A',
        success: '#34A853',
        warning: '#FBBC05',
        danger: '#EA4335',
        background: {
          light: '#F5F7FB',
          dark: '#0B1020'
        }
      },
    },
  },
  plugins: [],
}
