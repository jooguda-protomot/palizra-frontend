import { test, expect } from "@playwright/test";

const API_BASE = "https://palizraanalyzator-production.up.railway.app";

const MOCK_EXTRACT_RESPONSE = {
  claims: [
    {
      id: 1,
      original_text: "Test claim: at least 10 people were reported killed in a strike on January 1, 2026.",
      type: "factual_claim",
      entities: ["test entity"],
      location: "Test City",
      date: "January 1, 2026",
      numbers: ["10"],
      search_query: "test entity strike January 1 2026 casualties",
      search_query_native: null,
    },
  ],
};

const MOCK_CONSISTENCY_RESPONSE = { issues: [] };

test.describe("Extrakcia tvrdení (mockovaný backend)", () => {
  test.beforeEach(async ({ page }) => {
    // Zachytí VŠETKY requesty na backend - žiadny skutočný Claude/SerpAPI call sa nekoná
    await page.route(`${API_BASE}/api/claims/extract`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_EXTRACT_RESPONSE) })
    );
    await page.route(`${API_BASE}/api/claims/check-consistency`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_CONSISTENCY_RESPONSE) })
    );
  });

  test("zadanie textu a klik na BREAK DOWN CLAIMS zobrazí breakdown kartu", async ({ page }) => {
    await page.goto("/?lang=en");

    await page.locator("textarea").first().fill(MOCK_EXTRACT_RESPONSE.claims[0].original_text);
    await page.getByRole("button", { name: /break down claims/i }).click();

    // Breakdown sekcia sa musí objaviť s počtom zodpovedajúcim mockovanej odpovedi
    await expect(page.getByText(/breakdown \(1\)/i)).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("button", { name: MOCK_EXTRACT_RESPONSE.claims[0].original_text })
    ).toBeVisible();
  });

  test("žiadny skutočný request neopustí mockovaný okruh (kontrola network)", async ({ page }) => {
    const unmockedRequests = [];
    page.on("request", (req) => {
      if (req.url().startsWith(API_BASE) && !req.url().includes("/api/claims/")) {
        unmockedRequests.push(req.url());
      }
    });

    await page.goto("/?lang=en");
    await page.locator("textarea").first().fill("Test claim text.");
    await page.getByRole("button", { name: /break down claims/i }).click();
    await expect(page.getByText(/breakdown \(1\)/i)).toBeVisible({ timeout: 10_000 });

    expect(unmockedRequests, "Test zavolal neočakávaný backend endpoint mimo mockov").toHaveLength(0);
  });
});
