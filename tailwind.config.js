/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Noto Sans Thai UI"', '"Noto Sans Thai"', '"Leelawadee UI"', 'Tahoma', 'sans-serif'],
        display: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI Semibold"', '"Segoe UI"', '"Noto Sans Thai UI"', '"Noto Sans Thai"', '"Leelawadee UI"', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
