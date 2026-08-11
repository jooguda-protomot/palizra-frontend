import { test, expect } from "@playwright/test";

test.describe("Smoke test", () => {
  test("hlavná stránka sa načíta bez JS chýb", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/");

    // Hlavný nadpis/vstupné pole musí byť viditeľné
    await expect(page.locator("textarea, input[type='text']").first()).toBeVisible({
      timeout: 10_000,
    });

    expect(consoleErrors, `Konzola obsahuje chyby:\n${consoleErrors.join("\n")}`).toHaveLength(0);
  });

  test("pätička obsahuje odkazy na Methodology, Corrections, Privacy", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.getByRole("link", { name: /methodology|metodológia/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /corrections|opravy/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /privacy|súkromie/i })).toBeVisible();
  });
});
