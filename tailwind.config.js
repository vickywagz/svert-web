/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2E7D32',
        'primary-light': '#4CAF50',
        'primary-bg': '#F1F8F1',
        background: '#F5F0E8',
        surface: '#FFFFFF',
        'text-primary': '#1A1A1A',
        'text-secondary': '#757575',
        error: '#D32F2F',
        success: '#81C784',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}