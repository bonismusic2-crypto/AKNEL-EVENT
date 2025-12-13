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
                    light: '#D4AF37', // Classic Gold
                    DEFAULT: '#C5A028',
                    dark: '#B08D22',
                },
                dark: {
                    DEFAULT: '#1A1A1A',
                    lighter: '#2D2D2D',
                },
                gray: {
                    muted: '#F5F5F7',
                }
            },
            fontFamily: {
                serif: ['Playfair Display', 'serif'],
                sans: ['Poppins', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
