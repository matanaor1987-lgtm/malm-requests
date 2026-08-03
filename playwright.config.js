// תצורת בדיקות E2E למערכת בקשות מלמ.
// שים לב: כל הבדיקות מריצות מול Firebase מדומה (page.route) ולעולם לא נוגעות בנתונים אמיתיים.
const fs = require('fs');
const { defineConfig, devices } = require('@playwright/test');

// בסביבת הפיתוח המקומית (sandbox) יש כרום מותקן מראש בנתיב קבוע - נשתמש בו אם קיים.
// ב-CI (GitHub Actions) הנתיב הזה לא קיים, ואז Playwright ישתמש בדפדפן שהתקין בעצמו.
const localChromium = '/opt/pw-browsers/chromium';
const launchOptions = fs.existsSync(localChromium) ? { executablePath: localChromium } : {};

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:8791',
    trace: 'retain-on-failure',
    launchOptions,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'python3 -m http.server 8791',
    url: 'http://127.0.0.1:8791/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
