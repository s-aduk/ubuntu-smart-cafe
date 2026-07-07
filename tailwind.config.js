/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core brand palette — deliberately restrained, "earth-luxury" tones.
        charcoal: {
          DEFAULT: '#1A1A1A',
          light: '#2A2A28',
          soft: '#242422',
          dark: '#121211',
        },
        terracotta: {
          DEFAULT: '#C85A32',
          light: '#D97A54',
          dark: '#A64827',
        },
        ivory: {
          DEFAULT: '#FDFBF7',
          dim: '#F3EFE7',
        },
        emerald: {
          DEFAULT: '#2C4A3E',
          light: '#3B6153',
          dark: '#1E332A',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E4C766',
          dark: '#A6871F',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      backgroundImage: {
        'kente-line': 'repeating-linear-gradient(90deg, var(--tw-gradient-stops))',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.28)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
