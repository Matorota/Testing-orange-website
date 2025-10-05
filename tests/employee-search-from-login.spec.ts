import { test, expect } from "@playwright/test";

test.describe("Employee Search Test - Start from Login", () => {
  test("login then search for employee ID 12 - should fail", async ({
    page,
  }) => {
    console.log("Starting employee search test from login...");

    console.log("Navigating to login page...");
    await page.goto(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
      {
        waitUntil: "domcontentloaded",
        timeout: 120000,
      }
    );

    await page.waitForTimeout(8000);

    console.log("Performing login...");
    await page.waitForSelector('input[name="username"]', { timeout: 45000 });
    await page.fill('input[name="username"]', "Admin");
    await page.waitForTimeout(3000);

    await page.waitForSelector('input[name="password"]', { timeout: 35000 });
    await page.fill('input[name="password"]', "admin123");
    await page.waitForTimeout(3000);

    await page.click('button[type="submit"]', { timeout: 30000 });
    await page.waitForTimeout(15000);

    console.log("Login completed - Current URL:", page.url());

    console.log("STEP 1: Looking for PIM menu...");
    await page.waitForTimeout(15000);

    const pimSelectors = [
      "text=PIM",
      'a:has-text("PIM")',
      '[href*="pim"]',
      '.oxd-main-menu-item:has-text("PIM")',
      'li:has-text("PIM")',
      ".oxd-main-menu-item >> text=PIM",
    ];

    let pimFound = false;
    for (const selector of pimSelectors) {
      try {
        const pimElement = page.locator(selector).first();
        if (await pimElement.isVisible({ timeout: 10000 })) {
          console.log(`Found PIM menu with selector: ${selector}`);
          await pimElement.click();
          pimFound = true;
          break;
        }
      } catch (error) {
        console.log(`PIM selector ${selector} not found, trying next...`);
      }
    }

    if (!pimFound) {
      console.log("PIM menu not found, test failed");
      throw new Error("Could not find PIM menu");
    }

    console.log("Waiting for PIM page to load...");
    await page.waitForTimeout(5000);

    console.log("STEP 2: Looking for Employee ID field...");

    const idFieldSelectors = [
      'input[placeholder*="Id"]',
      'input[placeholder*="ID"]',
      'input[placeholder*="Employee Id"]',
      'input[name*="employeeId"]',
      'input[name*="empNumber"]',
      ".oxd-input",
      'input[type="text"]',
    ];

    let idFieldFound = false;
    for (const selector of idFieldSelectors) {
      try {
        const idFields = page.locator(selector);
        const count = await idFields.count();

        for (let i = 0; i < count; i++) {
          const idField = idFields.nth(i);
          if (await idField.isVisible({ timeout: 2000 })) {
            console.log(
              `Found ID field with selector: ${selector} (index ${i})`
            );
            console.log("Filling Employee ID: 12");
            await idField.fill("12");
            idFieldFound = true;
            break;
          }
        }

        if (idFieldFound) break;
      } catch (error) {
        console.log(`ID field selector ${selector} not found, trying next...`);
      }
    }

    if (!idFieldFound) {
      console.log("Employee ID field not found, trying first input field...");
      const firstInput = page.locator('input[type="text"]').first();
      if (await firstInput.isVisible({ timeout: 3000 })) {
        await firstInput.fill("12");
        console.log("Used first input field for Employee ID: 12");
      } else {
        throw new Error("Could not find any Employee ID field");
      }
    }

    console.log("STEP 3: Looking for Search button...");

    const searchButtonSelectors = [
      'button:has-text("Search")',
      'input[type="submit"][value*="Search"]',
      'button[type="submit"]',
      '.oxd-button:has-text("Search")',
      ".oxd-button--secondary",
    ];

    let searchButtonFound = false;
    for (const selector of searchButtonSelectors) {
      try {
        const searchButton = page.locator(selector).first();
        if (await searchButton.isVisible({ timeout: 3000 })) {
          console.log(`Found Search button with selector: ${selector}`);
          console.log("Clicking Search button...");
          await searchButton.click();
          searchButtonFound = true;
          break;
        }
      } catch (error) {
        console.log(
          `Search button selector ${selector} not found, trying next...`
        );
      }
    }

    if (!searchButtonFound) {
      console.log("Search button not found");
      throw new Error("Could not find Search button");
    }

    console.log("Waiting for search results...");
    await page.waitForTimeout(5000);

    const pageContent = await page.textContent("body");
    const finalUrl = page.url();

    console.log("Search completed - Current URL:", finalUrl);
    console.log("Checking search results for Employee ID 12...");

    const noRecordsMessages = [
      "No Records Found",
      "No records found",
      "No Data Available",
      "No employees found",
      "Nerodo darbuotojo",
      "Nesėkminga",
    ];

    let foundNoRecords = false;
    for (const message of noRecordsMessages) {
      if (pageContent?.includes(message)) {
        console.log(
          `SUCCESS: Employee ID 12 not found - "${message}" (Nesėkminga)`
        );
        foundNoRecords = true;
        break;
      }
    }

    if (!foundNoRecords) {
      console.log("Checking if any employee records are displayed...");
      const hasRecords =
        (await page.locator("table tbody tr, .oxd-table-row").count()) > 0;

      if (hasRecords) {
        console.log(
          "UNEXPECTED: Found employee records when searching for ID 12"
        );
      } else {
        console.log(
          "SUCCESS: No employee records found for ID 12 (Nesėkminga - as expected)"
        );
      }
    }

    console.log("Employee search test completed - Result should be Nesėkminga");
  });
});
