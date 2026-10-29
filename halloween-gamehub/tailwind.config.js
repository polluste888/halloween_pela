/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spooky: {
          dark: '#0a0512',
          card: 'rgba(20, 10, 35, 0.85)',
          orange: '#ff6600',
          glow: '#ff8533',
          purple: '#660099',
          slime: '#39ff14',
        }
      },
      fontFamily: {
        creepster: ['Creepster', 'cursive'],
      }
    },
  },
  plugins: [],
}
