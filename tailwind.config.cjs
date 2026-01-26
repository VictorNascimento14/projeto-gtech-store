
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#C92071",
                "primary-hover": "#991956",
                "background-light": "#F5F5F5",
                "light-gray": "#F5F5F5",
                "accent-yellow": "#E7FF86",
                "dark-footer": "#1E1E1E",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(-25deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(-20deg)' },
                },
                'float-particles': {
                    '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
                    '10%': { opacity: '1' },
                    '90%': { opacity: '1' },
                    '100%': { transform: 'translateY(-100vh) translateX(50px)', opacity: '0' },
                },
                'ping-slow': {
                    '0%': { transform: 'scale(1)', opacity: '0.5' },
                    '50%, 100%': { transform: 'scale(1.5)', opacity: '0' },
                },
                'ping-slower': {
                    '0%': { transform: 'scale(1)', opacity: '0.3' },
                    '50%, 100%': { transform: 'scale(1.5)', opacity: '0' },
                },
                'ping-slowest': {
                    '0%': { transform: 'scale(1)', opacity: '0.2' },
                    '50%, 100%': { transform: 'scale(1.5)', opacity: '0' },
                },
                'bounce-slow': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'spin-reverse': {
                    from: { transform: 'rotate(360deg)' },
                    to: { transform: 'rotate(0deg)' },
                },
                'gradient-x': {
                    '0%, 100%': { 'background-position': '0% 50%' },
                    '50%': { 'background-position': '100% 50%' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                'scan-line': {
                    '0%': { top: '0%' },
                    '100%': { top: '100%' },
                },
            },
            animation: {
                float: 'float 6s ease-in-out infinite',
                'float-particles': 'float-particles linear infinite',
                'ping-slow': 'ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite',
                'ping-slower': 'ping-slower 4s cubic-bezier(0, 0, 0.2, 1) infinite',
                'ping-slowest': 'ping-slowest 5s cubic-bezier(0, 0, 0.2, 1) infinite',
                'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
                'spin-reverse': 'spin-reverse 3s linear infinite',
                'gradient-x': 'gradient-x 3s ease infinite',
                shimmer: 'shimmer 2s infinite',
                'scan-line': 'scan-line 3s linear infinite',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
}
