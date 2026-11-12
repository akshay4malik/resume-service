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
        canvas: {
          DEFAULT: '#F1F3F5',    // Refined concrete/warm-slate canvas
          subtle: '#E9ECEF',     // Distinct section break
          card: '#FFFFFF',       // Crisp white floating cards
        },
        ink: {
          DEFAULT: '#1E293B',    // Slate ink text
          muted: '#64748B',      // Editorial grey
          subtle: '#94A3B8',     // Muted grey
          dark: '#0F172A',       // Deep midnight headlines
        },
        sand: {
          border: '#DDE2E5',     // Clearly delineated borders
          hover: '#CED4DA',
        },
      },
    },
  },
  plugins: [],
};

export default config;

