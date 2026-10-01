import { defineConfig, devices } from '@playwright/test';

const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: executablePath ? { executablePath } : {},
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], launchOptions: executablePath ? { executablePath } : {} } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 }, launchOptions: executablePath ? { executablePath } : {} } },
  ],
});
