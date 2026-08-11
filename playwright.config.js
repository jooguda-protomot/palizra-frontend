import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright konfigurácia pre Palizra Analyzator.
 *
 * DVE SKUPINY TESTOV:
 * 1. Mockované testy (tests/*.spec.js, okrem "real-smoke") - nikdy nevolajú
 *    živý backend/Claude API/SerpAPI. Bezpečné spúšťať pri každom pushi,
 *    nulový API náklad.
 * 2. tests/real-smoke.spec.js - volá skutočný živý backend (palizra.org).
 *    Zámerne NEbeží v bežnom "test" príkaze - spúšťaj ho len ručne alebo
 *    cez samostatný scheduled workflow (viď .github/workflows/e2e-real-smoke.yml).
 *
 * Testy bežia proti lokálnemu "vite preview" buildu (npm run build && npm run preview),
 * nie proti produkcii - takže aj keby mock zlyhal, nič sa nedeje s ostrým webom.
 */
export default defineConfig({
  testDir: "./tests",
  testIgnore: process.env.INCLUDE_REAL_SMOKE ? [] : ["**/real-smoke.spec.js"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  webServer: {
    command: "npm run build && npm run preview -- --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
