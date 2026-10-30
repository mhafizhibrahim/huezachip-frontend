/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hueza-bg': '#0A0516',
        'hueza-panel': '#15082A',
        'hueza-machine-outer': '#2A104E',
        'hueza-machine-inner': '#16082A',
        'hueza-gold': '#FACC15',
        'hueza-pink': '#E922FF',
        'hueza-purple': '#8B31FF'
      }
    },
  },
  plugins: [],
}