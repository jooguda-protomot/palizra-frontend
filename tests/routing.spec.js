import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/", heading: /break down claims/i },
  { path: "/corrections?lang=en", heading: /corrections/i },
  { path: "/methodology?lang=en", heading: /methodology/i },
  { path: "/privacy?lang=en", heading: /privacy policy/i },
  { path: "/analyses", heading: null }, // archív - nekontrolujeme presný nadpis, len že sa načíta
];

test.describe("Routing - všetky verejné stránky", () => {
  for (const { path, heading } of PAGES) {
    test(`${path} sa načíta bez chyby`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response.status(), `${path} vrátil neočakávaný status`).toBeLessThan(400);

      // React SPA - skontroluj, že sa nezobrazuje prázdna/rozbitá stránka
      const bodyText = await page.locator("body").innerText();
      expect(bodyText.trim().length, `${path} má prázdny obsah`).toBeGreaterThan(20);

      if (heading) {
        await expect(page.getByText(heading).first()).toBeVisible({ timeout: 10_000 });
      }
    });
  }
});
