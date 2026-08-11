import { test, expect } from "@playwright/test";

const API_BASE = "https://palizraanalyzator-production.up.railway.app";

test.describe("Formulár návrhu (/suggest, mockovaný backend)", () => {
  test("vyplnenie povinných polí a odoslanie zobrazí potvrdenie", async ({ page }) => {
    await page.route(`${API_BASE}/api/suggestions`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "ok" }) })
    );

    await page.goto("/suggest?lang=en");

    await page
      .getByPlaceholder("Paste the text of the claim you want verified...")
      .fill("Test suggestion claim text for E2E testing.");
    await page.getByPlaceholder("https://...").fill("https://example.com/test-article");

    await page.getByRole("button", { name: /submit suggestion/i }).click();

    await expect(page.getByText(/thank you for your suggestion/i)).toBeVisible({ timeout: 10_000 });
  });

  test("tlačidlo Submit je disabled, kým chýba tvrdenie alebo URL", async ({ page }) => {
    await page.goto("/suggest?lang=en");
    const submitButton = page.getByRole("button", { name: /submit suggestion/i });
    await expect(submitButton).toBeDisabled();

    await page
      .getByPlaceholder("Paste the text of the claim you want verified...")
      .fill("Only claim text, no URL yet.");
    await expect(submitButton).toBeDisabled();

    await page.getByPlaceholder("https://...").fill("https://example.com/test");
    await expect(submitButton).toBeEnabled();
  });

  test("zlyhanie odoslania (500) zobrazí chybovú hlášku, nie tichý pád", async ({ page }) => {
    await page.route(`${API_BASE}/api/suggestions`, (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "test error" }) })
    );

    await page.goto("/suggest?lang=en");
    await page
      .getByPlaceholder("Paste the text of the claim you want verified...")
      .fill("Test claim that will fail submission.");
    await page.getByPlaceholder("https://...").fill("https://example.com/test");
    await page.getByRole("button", { name: /submit suggestion/i }).click();

    await expect(page.getByText(/submission failed/i)).toBeVisible({ timeout: 10_000 });
  });
});
