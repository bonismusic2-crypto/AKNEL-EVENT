/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#E5C158',
          DEFAULT: '#D4AF37',
          dark: '#B49326',
        },
        dark: '#000000',
        light: '#FFFFFF',
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          800: '#1F2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Montserrat', 'sans-serif'],
        serif: ['Playfair Display', 'Lora', 'serif'],
      },
    },
  },
  plugins: [],
}
