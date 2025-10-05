import { test, expect } from "@playwright/test";

test.describe("Driver License Expiry Date Test", () => {
  test("driver license date before 1999 - should fail validation", async ({
    page,
  }) => {
    console.log("Starting driver license expiry date test...");

    console.log("Navigating to login page...");
    await page.goto(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
      {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      }
    );

    await page.waitForTimeout(12000);

    console.log("Performing login...");
    await page.waitForSelector('input[name="username"]', { timeout: 45000 });
    await page.fill('input[name="username"]', "Admin");
    await page.waitForTimeout(5000);

    await page.waitForSelector('input[name="password"]', { timeout: 35000 });
    await page.fill('input[name="password"]', "admin123");
    await page.waitForTimeout(5000);

    await page.click('button[type="submit"]', { timeout: 30000 });
    await page.waitForTimeout(20000);

    console.log("Login completed - Current URL:", page.url());

    console.log("STEP 1: Looking for PIM menu...");
    await page.waitForTimeout(15000);

    const pimSelectors = [
      'span:has-text("PIM")',
      "a >> text=PIM",
      ".oxd-main-menu-item >> text=PIM",
      '.oxd-main-menu-item:has-text("PIM")',
      'li:has-text("PIM") a',
      '[href*="pim"]',
      "text=PIM",
      'a:has-text("PIM")',
    ];

    let pimFound = false;
    for (const selector of pimSelectors) {
      try {
        const pimElement = page.locator(selector).first();
        if (await pimElement.isVisible({ timeout: 10000 })) {
          console.log(`Found PIM menu with selector: ${selector}`);

          await pimElement.waitFor({ state: "visible", timeout: 8000 });
          await page.waitForTimeout(3000);
          try {
            await pimElement.click({ timeout: 8000 });
            console.log("Successfully clicked PIM with normal click");
            pimFound = true;
            break;
          } catch (clickError) {
            console.log("Normal click failed, trying force click...");
            try {
              await pimElement.click({ force: true, timeout: 5000 });
              console.log("Successfully clicked PIM with force click");
              pimFound = true;
              break;
            } catch (forceClickError) {
              console.log(
                "Force click also failed, trying JavaScript click..."
              );
              await pimElement.evaluate((element: any) => element.click());
              console.log("Successfully clicked PIM with JavaScript click");
              pimFound = true;
              break;
            }
          }
        }
      } catch (error) {
        console.log(`PIM selector ${selector} failed: ${error.message}`);
      }
    }

    if (!pimFound) {
      console.log("PIM menu not found with standard selectors, debugging...");

      console.log("All menu items found:");
      const allMenuItems = page.locator(".oxd-main-menu-item");
      const menuCount = await allMenuItems.count();
      console.log(`Found ${menuCount} menu items`);

      for (let i = 0; i < menuCount; i++) {
        const menuItem = allMenuItems.nth(i);
        const menuText = await menuItem.textContent();
        console.log(`Menu ${i}: "${menuText}"`);

        if (menuText && menuText.includes("PIM")) {
          console.log(`Found PIM in menu item ${i}, clicking...`);
          await menuItem.click();
          pimFound = true;
          break;
        }
      }
    }

    if (!pimFound) {
      throw new Error("Could not find PIM menu anywhere");
    }

    console.log("Waiting for PIM page to load...");
    await page.waitForTimeout(12000);

    console.log("STEP 2: Looking for first employee in the list...");

    const employeeListSelectors = [
      "table tbody tr:first-child td:first-child a",
      ".oxd-table-row:first-child .oxd-table-cell:first-child a",
      ".oxd-table-body .oxd-table-row:first-child a",
      "table tbody tr:first-child a",
      ".employee-name a:first-child",
      'a[href*="viewEmployee"]',
    ];

    let employeeFound = false;
    for (const selector of employeeListSelectors) {
      try {
        const employeeLink = page.locator(selector).first();
        if (await employeeLink.isVisible({ timeout: 8000 })) {
          const employeeName = await employeeLink.textContent();
          console.log(
            `Found first employee link: "${employeeName}" with selector: ${selector}`
          );
          await employeeLink.click();
          employeeFound = true;
          break;
        }
      } catch (error) {
        console.log(
          `Employee link selector ${selector} not found, trying next...`
        );
      }
    }

    if (!employeeFound) {
      console.log("Trying to find any employee name link...");
      const allEmployeeLinks = page
        .locator("a")
        .filter({ hasText: /^[A-Z][a-z]+ [A-Z][a-z]+/ });
      const linkCount = await allEmployeeLinks.count();

      console.log(`Found ${linkCount} employee name links`);

      if (linkCount > 0) {
        const firstEmployeeLink = allEmployeeLinks.first();
        const employeeName = await firstEmployeeLink.textContent();
        console.log(`Clicking on employee: "${employeeName}"`);
        await firstEmployeeLink.click();
        employeeFound = true;
      }
    }

    if (!employeeFound) {
      throw new Error("Could not find any employee to select from the list");
    }

    console.log("Waiting for employee details page to load...");
    await page.waitForTimeout(10000);

    console.log("STEP 3: Looking for driver license expiry date field...");

    const dateFieldSelectors = [
      'input[placeholder*="License"]',
      'input[placeholder*="Expiry"]',
      'input[placeholder*="Date"]',
      'label:has-text("License Expiry Date") ~ * input',
      'label:has-text("Driver License") ~ * input',
      '.oxd-input-group:has-text("License") input[type="text"]',
      '.oxd-input-group:has-text("Expiry") input[type="text"]',
      'input[type="date"]',
      ".oxd-date-input input",
    ];

    let dateFieldFound = false;
    for (const selector of dateFieldSelectors) {
      try {
        const dateFields = page.locator(selector);
        const count = await dateFields.count();

        console.log(
          `Trying date selector: ${selector} - found ${count} elements`
        );

        for (let i = 0; i < count; i++) {
          const dateField = dateFields.nth(i);

          if (await dateField.isVisible({ timeout: 4000 })) {
            const parentElement = dateField.locator("xpath=../..");
            const parentText = await parentElement.textContent();

            console.log(
              `Testing date field ${i}, parent text: "${parentText}"`
            );

            if (
              parentText &&
              (parentText.includes("License") ||
                parentText.includes("Expiry") ||
                parentText.includes("Date"))
            ) {
              await dateField.click();
              await dateField.clear();

              console.log("Filling driver license expiry date: 1976-03-25");
              await dateField.fill("1976-03-25");

              dateFieldFound = true;
              break;
            }
          }
        }

        if (dateFieldFound) break;
      } catch (error) {
        console.log(`Date selector ${selector} failed: ${error.message}`);
      }
    }

    if (!dateFieldFound) {
      console.log(
        "License expiry date field not found, trying all date inputs..."
      );

      const allDateInputs = page.locator(
        'input[type="date"], input[type="text"]'
      );
      const inputCount = await allDateInputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = allDateInputs.nth(i);
        if (await input.isVisible({ timeout: 1000 })) {
          await input.click();
          await input.clear();
          await input.fill("1976-03-25");
          console.log(`Filled "1976-03-25" in date input field ${i}`);
          dateFieldFound = true;
          break;
        }
      }
    }

    if (!dateFieldFound) {
      throw new Error("Could not find driver license expiry date field");
    }

    console.log("STEP 4: Looking for Save button...");

    const saveButtonSelectors = [
      'button:has-text("Save")',
      'button:has-text("Išsaugoti")',
      'input[type="submit"][value*="Save"]',
      'button[type="submit"]',
      '.oxd-button:has-text("Save")',
      ".oxd-button--secondary",
    ];

    let saveButtonFound = false;
    for (const selector of saveButtonSelectors) {
      try {
        const saveButton = page.locator(selector).first();
        if (await saveButton.isVisible({ timeout: 5000 })) {
          console.log(`Found Save button with selector: ${selector}`);
          console.log("Clicking Save button...");
          await saveButton.click();
          saveButtonFound = true;
          break;
        }
      } catch (error) {
        console.log(
          `Save button selector ${selector} not found, trying next...`
        );
      }
    }

    if (!saveButtonFound) {
      throw new Error("Could not find Save button");
    }

    console.log("Waiting for validation response...");
    await page.waitForTimeout(8000);

    const pageContent = await page.textContent("body");
    console.log("Checking for validation error message...");

    const errorMessages = [
      "Įvesta data nėra tinkama",
      "Invalid date",
      "Date is not valid",
      "Invalid input",
      "Error",
      "Please enter a valid date",
    ];

    let foundError = false;
    for (const message of errorMessages) {
      if (pageContent?.includes(message)) {
        console.log(`SUCCESS: Found validation error - "${message}"`);
        foundError = true;
        break;
      }
    }

    if (!foundError) {
      console.log(
        "ERROR: No validation error found - system accepted invalid date 1976-03-25"
      );
      console.log("TEST SHOULD FAIL: Date before 1999 should not be accepted");
      throw new Error(
        "TEST FAILED: System accepted driver license expiry date 1976-03-25 (before 1999) - this should show validation error"
      );
    }

    console.log(
      "Driver license expiry date validation test completed - found expected error"
    );
  });
});
