import { test, expect } from "@playwright/test";

test.describe("OrangeHRM Login Test", () => {
  test("login with Admin credentials", async ({ page }) => {
    await page.goto(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
      { waitUntil: "domcontentloaded", timeout: 120000 }
    );

    await page.waitForTimeout(8000);

    await page.waitForSelector('input[name="username"]', { timeout: 45000 });
    await page.fill('input[name="username"]', "Admin");
    await page.waitForTimeout(3000);

    await page.waitForSelector('input[name="password"]', { timeout: 35000 });
    await page.fill('input[name="password"]', "admin123");
    await page.waitForTimeout(3000);

    await page.click('button[type="submit"]', { timeout: 30000 });

    await page.waitForTimeout(15000);

    console.log("Login completed - Current URL:", page.url());
  });
});
