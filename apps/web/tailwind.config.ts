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
        'deep-green': '#203D2E',
        forest: '#2D5F2D',
        leaf: '#6B9A4F',
        lime: '#9BC15D',
        teal: '#20707A',
        earth: '#8C6B45',
        mist: '#F3F5EE',
        ink: '#1F2A24',
        muted: '#66726B',
      },
    },
  },
  plugins: [],
};

export default config;
