// E2E contra o ambiente LOCAL (vite preview + Supabase local com dados fictícios).
//   BASE_URL=http://127.0.0.1:5173 SERVICE_KEY=... npx playwright test -c playwright.local.config.js
import { defineConfig, devices } from '@playwright/test';

const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: './tests/e2e-local',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:5173',
    screenshot: 'only-on-failure',
    launchOptions: executablePath ? { executablePath } : {},
    geolocation: { latitude: -23.5505, longitude: -46.6333 },
    permissions: ['geolocation'],
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
});
