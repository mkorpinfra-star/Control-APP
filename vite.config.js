import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/login/', // Caminho relativo para funcionar no Android
  plugins: [react(), tailwindcss()],
  build: {
    emptyOutDir: true, // Limpa a pasta dist antes de buildar
  },
})
