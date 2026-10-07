import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:4173/bnuuy/' },
  projects: [{ name: 'pixel-7', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173/bnuuy/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
