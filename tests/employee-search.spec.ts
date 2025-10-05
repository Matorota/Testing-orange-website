import { test, expect } from "@playwright/test";

test.describe("Employee Search Test", () => {
  test("search for employee ID 15 - should find employee", async ({ page }) => {
    console.log("Starting employee search test...");

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

    await page.waitForTimeout(8000);

    const pimSelectors = [
      "text=PIM",
      'a:has-text("PIM")',
      '[href*="pim"]',
      '.oxd-main-menu-item:has-text("PIM")',
      'li:has-text("PIM")',
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

    await page.waitForTimeout(3000);

    const idFieldSelectors = [
      'input[placeholder="Type for hints..."]',
      'label:has-text("Employee Id") ~ * input',
      'label:has-text("Employee ID") ~ * input',
      '.oxd-input-group__label-wrapper:has-text("Employee Id") ~ .oxd-input-group input',
      '.oxd-input-group__label-wrapper:has-text("Employee ID") ~ .oxd-input-group input',
      ".oxd-form .oxd-input-group:first-child input",
      ".oxd-form .oxd-grid-item:first-child input",
      'input[placeholder*="Id"]:not([placeholder*="Name"])',
      'input[placeholder*="ID"]:not([placeholder*="Name"])',
    ];

    let idFieldFound = false;

    for (const selector of idFieldSelectors) {
      try {
        const idFields = page.locator(selector);
        const count = await idFields.count();

        console.log(`Trying selector: ${selector} - found ${count} elements`);

        for (let i = 0; i < count; i++) {
          const idField = idFields.nth(i);

          if (await idField.isVisible({ timeout: 2000 })) {
            const parentElement = idField.locator("xpath=../..");
            const parentText = await parentElement.textContent();

            console.log(
              `Testing field ${i} with selector: ${selector}, parent text: "${parentText}"`
            );

            if (
              parentText &&
              (parentText.includes("Employee Id") ||
                parentText.includes("Employee ID") ||
                i === 0)
            ) {
              await idField.click();
              await idField.clear();
              await idField.fill("15");

              console.log(
                `SUCCESS: Filled Employee ID: 15 in CORRECT field with selector: ${selector}`
              );
              idFieldFound = true;
              break;
            } else {
              console.log(
                `Skipping field ${i} - appears to be Employee Name field, not Employee ID`
              );
            }
          }
        }

        if (idFieldFound) break;
      } catch (error) {
        console.log(`Selector ${selector} failed: ${error.message}`);
      }
    }

    if (!idFieldFound) {
      console.log(
        "Employee ID field not found, trying all visible input fields..."
      );

      const allInputs = page.locator('input[type="text"]');
      const inputCount = await allInputs.count();

      console.log(`Found ${inputCount} text input fields, trying each one...`);

      for (let i = 0; i < inputCount; i++) {
        const input = allInputs.nth(i);
        if (await input.isVisible({ timeout: 1000 })) {
          await input.click();
          await input.clear();
          await input.fill("15");
          console.log(`Filled "15" in input field ${i}`);
          idFieldFound = true;
          break;
        }
      }
    }

    if (!idFieldFound) {
      throw new Error("Could not find Employee ID field anywhere on the page");
    }

    console.log("STEP 3: Looking for Search button...");

    const searchButtonSelectors = [
      'button:has-text("Search")',
      'input[type="submit"][value*="Search"]',
      'button[type="submit"]',
      '.oxd-button:has-text("Search")',
      'button:contains("Search")',
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
    console.log("Checking if employee ID 15 was found...");

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
          `ERROR: Employee ID 15 not found - "${message}" - TEST SHOULD FAIL!`
        );
        foundNoRecords = true;
        break;
      }
    }

    if (foundNoRecords) {
      throw new Error(
        "TEST FAILED: Employee ID 15 should exist but was not found - search returned 'No Records Found'"
      );
    }

    const hasEmployeeRecords =
      (await page.locator("table, .oxd-table, .employee-list, tr").count()) > 1;

    if (hasEmployeeRecords) {
      console.log("SUCCESS: Found employee records for ID 15");
    } else {
      console.log("ERROR: No employee table found - this is unexpected");
      throw new Error("TEST FAILED: No employee data displayed after search");
    }

    console.log(
      "Employee search test completed - Employee ID 15 should be found"
    );
  });
});
