/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Neutral palette for ChatGPT-style UI
                sidebar: {
                    light: '#f9fafb',  // gray-50
                    dark: '#171717',   // neutral-900
                },
                surface: {
                    light: '#ffffff',
                    dark: '#212121',
                },
                border: {
                    light: '#e5e7eb',  // gray-200
                    dark: '#2f2f2f',
                },
                text: {
                    primary: {
                        light: '#111827', // gray-900
                        dark: '#f9fafb',  // gray-50
                    },
                    secondary: {
                        light: '#6b7280', // gray-500
                        dark: '#9ca3af',  // gray-400
                    },
                },
                accent: {
                    DEFAULT: '#10a37f', // ChatGPT green
                    hover: '#0d8a6a',
                },
            },
            fontFamily: {
                sans: ['Söhne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['Söhne Mono', 'Monaco', 'Consolas', 'monospace'],
            },
        },
    },
    plugins: [],
}
