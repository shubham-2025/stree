/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './constants/**/*.{js,jsx,ts,tsx}',
    './contexts/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#7B1E3A',
        secondary: '#C9A84C',
        background: '#FAF7F2',
        surface: '#FFFFFF',
        text: '#2C2C2C',
        muted: '#666666',
        border: '#E0E0E0',
        success: '#2F855A',
        error: '#C53030',
      },
      borderRadius: {
        card: '20px',
        panel: '28px',
      },
      boxShadow: {
        luxe: '0px 16px 40px rgba(123, 30, 58, 0.08)',
      },
      spacing: {
        4.5: '18px',
      },
      letterSpacing: {
        brand: '0.3px',
        overline: '1.6px',
      },
    },
  },
  plugins: [],
};
