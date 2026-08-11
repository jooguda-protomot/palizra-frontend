import { test, expect } from "@playwright/test";

test.describe("Jazykový prepínač", () => {
  test("prepnutie na AR nastaví dir=rtl", async ({ page }) => {
    await page.goto("/?lang=en");
    await page.getByRole("button", { name: "AR" }).click();
    const root = page.locator("div[lang]").first();
    await expect(root).toHaveAttribute("dir", "rtl", { timeout: 5_000 });
    await expect(root).toHaveAttribute("lang", "ar");
  });

  test("prepnutie na HE nastaví dir=rtl", async ({ page }) => {
    await page.goto("/?lang=en");
    await page.getByRole("button", { name: "HE" }).click();
    const root = page.locator("div[lang]").first();
    await expect(root).toHaveAttribute("dir", "rtl", { timeout: 5_000 });
    await expect(root).toHaveAttribute("lang", "he");
  });

  test("prepnutie na EN nastaví dir=ltr a lang=en na koreňovom elemente appky", async ({ page }) => {
    await page.goto("/?lang=sk");
    await page.getByRole("button", { name: "EN" }).click();
    const root = page.locator("div[lang]").first();
    await expect(root).toHaveAttribute("lang", "en", { timeout: 5_000 });
    await expect(root).toHaveAttribute("dir", "ltr");
  });
});
