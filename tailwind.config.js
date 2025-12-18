
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Deep Space Dark Theme Base
                background: '#0f172a', // Slate 900
                surface: '#1e293b',    // Slate 800
                surfaceHighlight: '#334155', // Slate 700

                // Aurora Brand Colors
                primary: {
                    DEFAULT: '#6366f1', // Indigo 500
                    glow: '#818cf8',    // Indigo 400
                    dim: '#4338ca',     // Indigo 700
                },
                secondary: {
                    DEFAULT: '#a855f7', // Purple 500
                    glow: '#c084fc',    // Purple 400
                },
                accent: {
                    DEFAULT: '#ec4899', // Pink 500
                    glow: '#f472b6',    // Pink 400
                },

                grid: '#334155', // Grid line color
            },
            fontFamily: {
                sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shine': 'shine 2s linear infinite',
                'aurora': 'aurora 10s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                shine: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                aurora: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                }
            },
            backgroundImage: {
                'aurora-gradient': 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)',
                'glass': 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
                'glass-hover': 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            }
        },
    },
    plugins: [],
}
