import { defineConfig, devices } from '@playwright/test';

// URL do app: por padrão o ambiente LOCAL. Testes E2E criam dados — não rode contra produção.
const baseURL = process.env.BASE_URL || 'http://localhost:5173';

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
