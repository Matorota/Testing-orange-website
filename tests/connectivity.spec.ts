import { test, expect } from "@playwright/test";

test.describe("Connectivity Tests", () => {
  test("should be able to reach OrangeHRM site", async ({ page }) => {
    const response = await page.goto(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
      { waitUntil: "domcontentloaded", timeout: 120000 }
    );

    await page.waitForTimeout(8000);

    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/OrangeHRM/);
  });
});
