import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        duo: {
          green: '#58CC02',
          greenDark: '#46A302',
          blue: '#1CB0F6',
          blueDark: '#1899D6',
          red: '#FF4B4B',
          redDark: '#EA2B2B',
          gold: '#FFC800',
          goldDark: '#E5A500',
          purple: '#CE82FF',
          purpleDark: '#A55EEA',
          gray: '#E5E5E5',
          grayDark: '#AFAFAF',
          muted: '#777777',
          charcoal: '#4B4B4B',
          canvas: '#F7F7F7',
          border: '#E5E5E5',
        },
      },
      fontFamily: {
        nunito: ['var(--font-nunito)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;