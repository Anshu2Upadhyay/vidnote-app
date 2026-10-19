/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1E293B',
          teal: '#0EA5E9',
          blue: '#2563EB',
          blue50: '#EFF6FF',
          red: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'toast-in': 'toastIn 0.3s ease-out forwards',
        'toast-out': 'toastOut 0.3s ease-in forwards',
      },
      keyframes: {
        toastIn: {
          '0%': { transform: 'translateY(100px) scale(0.9)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        toastOut: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(100px) scale(0.9)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}