import { test, expect } from "@playwright/test";

const API_BASE = "https://palizraanalyzator-production.up.railway.app";

const MOCK_CLAIM = {
  id: 1,
  original_text: "Test claim: at least 10 people were reported killed in a strike on January 1, 2026.",
  type: "factual_claim",
  entities: ["test entity"],
  location: "Test City",
  date: "January 1, 2026",
  numbers: ["10"],
  search_query: "test entity strike January 1 2026 casualties",
  search_query_native: null,
};

const MOCK_EXTRACT_RESPONSE = { claims: [MOCK_CLAIM] };
const MOCK_CONSISTENCY_RESPONSE = { issues: [] };

const MOCK_VERIFY_RESPONSE = {
  claim: MOCK_CLAIM,
  comparison: {
    claim_text: MOCK_CLAIM.original_text,
    consensus_points: [
      { point: "Test consensus point.", supporting_sources: [{ source: "Test Wire Agency", url: "https://example.com" }] },
    ],
    discrepancies: [],
    framing_differences: [],
    unsupported_by_independent_sources: [],
    confidence_level: "medium",
    summary_note: "Test summary note for E2E mock verification.",
  },
};

const MOCK_VERIFY_SKIPPED_RESPONSE = {
  claim: { ...MOCK_CLAIM, type: "unverifiable", search_query: null },
  status: "skipped",
  note: "Tvrdenie nemá vyhľadávací dotaz (typ: unverifiable)",
  fromCache: false,
};

test.describe("Porovnanie zdrojov (mockovaný backend)", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API_BASE}/api/claims/extract`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_EXTRACT_RESPONSE) })
    );
    await page.route(`${API_BASE}/api/claims/check-consistency`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_CONSISTENCY_RESPONSE) })
    );
  });

  test("klik na kartu s výsledkom zobrazí confidence level", async ({ page }) => {
    await page.route(`${API_BASE}/api/claims/verify`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_VERIFY_RESPONSE) })
    );

    await page.goto("/?lang=en");
    await page.locator("textarea").first().fill(MOCK_CLAIM.original_text);
    await page.getByRole("button", { name: /break down claims/i }).click();
    await expect(page.getByText(/breakdown \(1\)/i)).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: MOCK_CLAIM.original_text }).click();

    await expect(page.getByText(/confidence level/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/medium/i)).toBeVisible();
    await expect(page.getByText("Test consensus point.")).toBeVisible();
  });

  test("skipped stav (napr. unverifiable bez search_query) nezostane v nekonečnom loadingu", async ({ page }) => {
    await page.route(`${API_BASE}/api/claims/verify`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_VERIFY_SKIPPED_RESPONSE) })
    );

    await page.goto("/?lang=en");
    await page.locator("textarea").first().fill(MOCK_CLAIM.original_text);
    await page.getByRole("button", { name: /break down claims/i }).click();
    await expect(page.getByText(/breakdown \(1\)/i)).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: MOCK_CLAIM.original_text }).click();

    // Musí prestať "loadovať" do pár sekúnd - buď zobrazí info o preskočení,
    // alebo sa aspoň vráti do pôvodného placeholder stavu. Overujeme, že
    // spinner/loading indikátor nezostane viditeľný natrvalo.
    await page.waitForTimeout(2000);
    const loadingIndicator = page.getByText(/loading|načítava/i);
    await expect(loadingIndicator).toHaveCount(0);
  });
});
