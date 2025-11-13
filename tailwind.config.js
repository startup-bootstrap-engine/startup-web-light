/* eslint-disable import/no-default-export */
/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/react-daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.jsx',
  ],
  theme: {
    extend: {
      colors: {
        reddit: {
          orange: '#FF4500',
          'orange-dark': '#CC3700',
          'orange-light': '#FF5722',
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        reddit: {
          ...require('daisyui/src/theming/themes')['dark'],
          primary: '#FF4500', // Reddit orange
          'primary-focus': '#CC3700',
          'base-100': '#000000', // Black background
          'base-200': '#0a0a0a',
          'base-300': '#1a1a1a',
          'base-content': '#ffffff',
          accent: '#9333ea', // Purple accent
          'accent-focus': '#7c3aed',
          secondary: '#ec4899', // Pink secondary
          'secondary-focus': '#db2777',
        },
      },
    ],
    darkTheme: 'reddit',
  },
};
