import { test, expect } from "@playwright/test";

test.beforeAll(async ({ browser }) => {});

test.beforeEach(async ({ page }) => {
  await page.goto(
    "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login"
  );
});
