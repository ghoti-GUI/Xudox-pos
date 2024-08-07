/** @type {import('tailwindcss').Config} */

module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: false, 
    content: [],
    theme: {
        extend: {
            colors:{
                buttonBleu:'#3b82f6',
                buttonBleuHover:'#1d4ed8',
                buttonRed:'#ef4444',
                buttonRedHover:'#b91c1c',
                buttonGray:'#6b7280',
                buttonGrayHover:'#4b5563', 
            }
        },
    },
    plugins: [],
}

