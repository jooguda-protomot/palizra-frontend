import { test, expect } from "@playwright/test";

/**
 * REÁLNE testy proti ŽIVEJ produkcii (palizra.org + skutočný backend).
 *
 * NEBEŽIA v bežnom "npm test" príkaze (viď playwright.config.js -
 * testIgnore). Spúšťaj ich len:
 *   - ručne: INCLUDE_REAL_SMOKE=1 npx playwright test real-smoke
 *   - alebo cez samostatný scheduled GitHub Actions workflow (1x denne)
 *
 * Test "backend health" je úplne zadarmo (žiadne Claude/SerpAPI volanie).
 * Test "plná analýza" STOJÍ malé množstvo reálnych API kreditov
 * (1x Claude extract + 1x Claude verify + 1x SerpAPI search) - zámerne
 * beží len raz denne, nie pri každom pushi.
 */

const PRODUCTION_URL = "https://palizra.org";
const API_BASE = "https://palizraanalyzator-production.up.railway.app";

test.describe("Real smoke test (živá produkcia)", () => {
  test("backend /api/health odpovedá (zadarmo, žiadne AI volanie)", async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/health`);
    expect(response.ok()).toBeTruthy();
  });

  test("hlavná stránka palizra.org sa načíta", async ({ page }) => {
    const response = await page.goto(PRODUCTION_URL);
    expect(response.status()).toBeLessThan(400);
    await expect(page.locator("textarea").first()).toBeVisible({ timeout: 10_000 });
  });

  test("plná analýza jednoduchého tvrdenia prejde end-to-end (stojí malý API kredit)", async ({ page }) => {
    test.slow(); // reálne API volania trvajú dlhšie než mockované testy

    await page.goto(`${PRODUCTION_URL}/?lang=en`);
    await page
      .locator("textarea")
      .first()
      .fill("The ceasefire in Gaza began on October 11, 2025.");
    await page.getByRole("button", { name: /break down claims/i }).click();

    // Extrakcia musí vrátiť aspoň 1 breakdown kartu do 30s (reálne Claude API volanie)
    await expect(page.getByText(/breakdown \(\d+\)/i)).toBeVisible({ timeout: 30_000 });
  });
});
