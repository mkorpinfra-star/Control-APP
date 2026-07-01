import { defineConfig, devices } from '@playwright/test';

// URL do app: por padrão a produção; troque com BASE_URL=http://localhost:5173
const baseURL = process.env.BASE_URL || 'https://app.mkorp.com.br';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
});
