/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // Overwrite the entire color palette to strictly ban default Tailwind colors
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      paper: '#F6F4EF',
      surface: '#FFFFFF',
      ink: '#14202E',
      'ink-muted': '#4B5666',
      'ink-subtle': '#647084',
      line: '#DAD5CA',
      'line-strong': '#B9B2A3',
      navy: {
        900: '#0E2542',
        700: '#17375E',
        600: '#1F487C',
        100: '#D6E2F0',
        50: '#EAF0F7'
      },
      saffron: {
        700: '#9A4308',
        400: '#F59240',
        50: '#FDF0E1'
      },
      success: {
        700: '#1B5E3C',
        50: '#E6F2EB'
      },
      warning: {
        700: '#7A5200',
        50: '#FBF0D5'
      },
      danger: {
        700: '#9B2218',
        50: '#FBE8E5'
      }
    },
    fontFamily: {
      serif: ['"Source Serif 4"', '"Noto Serif Devanagari"', 'Georgia', 'serif'],
      sans: ['"IBM Plex Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      mono: ['"IBM Plex Mono"', 'monospace']
    },
    fontSize: {
      caption: ['12px', '16px'],
      small: ['14px', '20px'],
      body: ['16px', '24px'],
      lead: ['18px', '28px'],
      h3: ['22px', '30px'],
      h2: ['28px', '36px'],
      h1: ['36px', '44px']
    },
    borderRadius: {
      none: '0px',
      sm: '2px',
      DEFAULT: '4px',
      md: '6px',
      lg: '8px' // Hard ban: nothing above 8px except rounded-full for avatars
    },
    boxShadow: {
      none: 'none',
      overlay: '0 8px 24px rgba(14, 37, 66, 0.12)'
    },
    extend: {
      spacing: {
        18: '4.5rem',
        58: '14.5rem'
      }
    }
  },
  plugins: []
};
