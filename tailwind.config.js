/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // J2S Brand Colors - ESTILO BRASILEIRO FORTE
        j2s: {
          red: '#CE0201',
          'red-dark': '#a00000',
          'red-light': '#ff0000',
          black: '#000000',
          'gray-dark': '#1a1a1a',
        },
        // Aliases
        primary: '#CE0201',
        'primary-dark': '#a00000',

        // Sistema Brasileiro - Fundo Preto, Cards Brancos
        background: {
          DEFAULT: '#000000',
          secondary: '#1a1a1a',
        },

        // Status colors
        success: '#16a34a',
        'success-light': '#dcfce7',
        warning: '#f59e0b',
        'warning-light': '#fef3c7',
        danger: '#dc2626',
        'danger-light': '#fee2e2',
        error: '#dc2626',
        'error-light': '#fee2e2',
        info: '#3b82f6',
        'info-light': '#dbeafe',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(206, 2, 1, 0.05)',
        DEFAULT: '0 1px 3px rgba(206, 2, 1, 0.1)',
        'md': '0 4px 6px rgba(206, 2, 1, 0.15)',
        'lg': '0 10px 15px rgba(206, 2, 1, 0.2)',
        'xl': '0 20px 25px rgba(206, 2, 1, 0.25)',
        'j2s': '0 0 0 3px rgba(206, 2, 1, 0.2)',
      },
    },
  },
  plugins: [],
}
