/* eslint-disable import/no-default-export */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    // Browser Tests
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /.*\.e2e\.spec\.ts/,
    },

    // API Tests (no browser needed)
    {
      name: 'api',
      use: {
        baseURL: 'http://localhost:3000',
      },
      testMatch: /.*\.api\.spec\.ts/,
    },

    // Workers Preview Tests (validate Cloudflare behavior)
    {
      name: 'workers-preview',
      use: {
        baseURL: 'http://localhost:8788',
      },
      testMatch: /.*\.preview\.spec\.ts/,
    },
  ],

  webServer: {
    command: 'next dev',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
