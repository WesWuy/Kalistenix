import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: 'http://127.0.0.1:4174', browserName: 'chromium' },
  webServer: { command: 'PORT=4174 node server.js', url: 'http://127.0.0.1:4174', reuseExistingServer: false },
});
