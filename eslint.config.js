import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'android', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // `motion` é usado como <motion.div> (JSX member expression), que esta config não detecta
      'no-unused-vars': ['error', { varsIgnorePattern: '^(?:[A-Z_]|motion$)' }],
      // regras de estilo do React Compiler / HMR: sinalizam, mas não bloqueiam o build
      'react-hooks/set-state-in-effect': 'warn',
      'react-refresh/only-export-components': 'warn',
    },
  },
  {
    files: ['*.config.js', 'tests/**/*.{js,mjs}'],
    languageOptions: { globals: { ...globals.node } },
  },
])
