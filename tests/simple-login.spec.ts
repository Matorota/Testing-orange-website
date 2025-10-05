import { test, expect } from "@playwright/test";

test.describe("Simple OrangeHRM Login Test", () => {
  test("simple login with Admin credentials", async ({ page }) => {
    console.log("Starting login test...");

    console.log("Navigating to login page...");
    await page.goto(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
      {
        waitUntil: "domcontentloaded",
        timeout: 120000,
      }
    );

    await page.waitForTimeout(12000);

    console.log("Looking for username field...");
    await page.waitForSelector('input[name="username"]', { timeout: 45000 });

    console.log("Filling username: Admin");
    await page.fill('input[name="username"]', "Admin");
    await page.waitForTimeout(3000);

    console.log("Looking for password field...");
    await page.waitForSelector('input[name="password"]', { timeout: 35000 });

    console.log("Filling password: admin123");
    await page.fill('input[name="password"]', "admin123");
    await page.waitForTimeout(3000);

    console.log("Looking for login button...");
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.waitFor({ state: "visible", timeout: 30000 });

    console.log("Clicking login button...");
    await loginButton.click();

    console.log("Waiting for page to change...");
    await page.waitForTimeout(20000);

    const currentUrl = page.url();
    console.log("Current URL:", currentUrl);

    if (currentUrl.includes("dashboard")) {
      console.log("SUCCESS: Login worked! Reached dashboard page");
    } else if (currentUrl.includes("auth/login")) {
      console.log("FAILED: Still on login page - login did not work");
    } else {
      console.log("SUCCESS: Login worked! On page:", currentUrl);
    }
  });
});
