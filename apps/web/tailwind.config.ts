/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
    extend: {
        keyframes: {
            blink: {
                "0%, 100%": { opacity: "1" },
                "50%": { opacity: "0" },
            },
        },
        animation: {
            blink: "blink 0.75s step-end infinite",
        },
    },
},
    plugins: [],
};

export default config;