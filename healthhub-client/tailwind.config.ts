import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7ff',
          100: '#b3e0ff',
          200: '#80caff',
          300: '#4db3ff',
          400: '#1a9cff',
          500: '#0088ff',
          600: '#0066cc',
          700: '#004499',
          800: '#002266',
          900: '#001133',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};

export default config;