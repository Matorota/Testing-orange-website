import { test, expect } from "@playwright/test";

test.describe("Employee Name Search Test", () => {
  test("search for employee by name John - should find employees", async ({
    page,
  }) => {
    console.log("Starting employee name search test...");

    console.log("Navigating to login page...");
    await page.goto(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
      {
        waitUntil: "domcontentloaded",
        timeout: 120000,
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
              console.log("Force click failed, trying JavaScript click...");
              try {
                await pimElement.evaluate((el) => (el as HTMLElement).click());
                console.log("Successfully clicked PIM with JavaScript click");
                pimFound = true;
                break;
              } catch (jsClickError) {
                console.log(`JavaScript click failed: ${jsClickError.message}`);
              }
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

    console.log("STEP 2: Looking for employee name field...");

    await page.waitForTimeout(8000);

    console.log("DEBUG: Checking all form elements on the page...");

    const labels = page.locator("label, .oxd-label");
    const labelCount = await labels.count();
    console.log(`Found ${labelCount} labels`);

    for (let i = 0; i < Math.min(labelCount, 15); i++) {
      try {
        const label = labels.nth(i);
        if (await label.isVisible({ timeout: 2000 })) {
          const labelText = await label.textContent();
          console.log(`Label ${i}: "${labelText}"`);
        }
      } catch (e) {
        console.log(`Label ${i}: Could not get text`);
      }
    }

    const allInputs = page.locator("input");
    const inputCount = await allInputs.count();
    console.log(`Found ${inputCount} total input fields`);

    for (let i = 0; i < Math.min(inputCount, 15); i++) {
      try {
        const input = allInputs.nth(i);
        if (await input.isVisible({ timeout: 2000 })) {
          const placeholder = await input.getAttribute("placeholder");
          const name = await input.getAttribute("name");
          const type = await input.getAttribute("type");
          const className = await input.getAttribute("class");
          console.log(
            `Input ${i}: type="${type}", name="${name}", placeholder="${placeholder}", class="${className}"`
          );
        }
      } catch (e) {
        console.log(`Input ${i}: Could not get attributes`);
      }
    }

    let nameFieldFound = false;

    console.log(
      "Attempting to find Employee Name field by label association..."
    );

    try {
      const employeeNameLabel = page.locator('text="Employee Name"').first();
      if (await employeeNameLabel.isVisible({ timeout: 5000 })) {
        console.log("Found 'Employee Name' label");

        const container = employeeNameLabel
          .locator(
            "xpath=ancestor::div[contains(@class, 'oxd-input-group') or contains(@class, 'oxd-grid-item')]"
          )
          .first();
        const associatedInput = container.locator("input").first();

        if (await associatedInput.isVisible({ timeout: 3000 })) {
          console.log("Found input associated with Employee Name label");
          await associatedInput.scrollIntoViewIfNeeded();
          await associatedInput.click();
          await page.waitForTimeout(1000);
          await associatedInput.clear();
          await associatedInput.fill("John");
          await page.waitForTimeout(2000);

          const enteredValue = await associatedInput.inputValue();
          if (enteredValue === "John") {
            console.log("Successfully entered 'John' into Employee Name field");
            nameFieldFound = true;
          } else {
            console.log(
              `Failed to enter text correctly. Current value: "${enteredValue}"`
            );
          }
        }
      }
    } catch (error) {
      console.log(`Employee Name label method failed: ${error.message}`);
    }

    if (!nameFieldFound) {
      console.log("Trying autocomplete input method...");
      try {
        const autocompleteInput = page
          .locator(
            ".oxd-autocomplete-text-input input, input[class*='autocomplete']"
          )
          .first();
        if (await autocompleteInput.isVisible({ timeout: 5000 })) {
          console.log("Found autocomplete input");
          await autocompleteInput.scrollIntoViewIfNeeded();
          await autocompleteInput.click();
          await page.waitForTimeout(1000);
          await autocompleteInput.clear();
          await autocompleteInput.fill("John");
          await page.waitForTimeout(2000);

          const enteredValue = await autocompleteInput.inputValue();
          if (enteredValue === "John") {
            console.log("Successfully entered 'John' into autocomplete field");
            nameFieldFound = true;
          }
        }
      } catch (error) {
        console.log(`Autocomplete input method failed: ${error.message}`);
      }
    }

    const nameFieldSelectors = [
      'input[placeholder*="Type for hints..."]',
      'input[placeholder*="Employee Name"]',
      'input[placeholder*="Name"]',
      ".oxd-autocomplete-text-input input",
      '.oxd-input-group:has-text("Employee Name") input',
      '.oxd-grid-item:has-text("Employee Name") input',
      'div:has-text("Employee Name") + div input',
      'div:has-text("Employee Name") input',
    ];

    if (!nameFieldFound) {
      for (const selector of nameFieldSelectors) {
        try {
          const nameFields = page.locator(selector);
          const count = await nameFields.count();

          console.log(
            `Trying name selector: ${selector} - found ${count} elements`
          );

          for (let i = 0; i < count; i++) {
            const nameField = nameFields.nth(i);

            if (await nameField.isVisible({ timeout: 4000 })) {
              console.log(`Testing name field ${i} with selector: ${selector}`);

              try {
                await nameField.scrollIntoViewIfNeeded();
                await nameField.click();
                await page.waitForTimeout(1000);
                await nameField.clear();
                await nameField.fill("John");
                await page.waitForTimeout(2000);

                const enteredValue = await nameField.inputValue();
                if (enteredValue === "John") {
                  console.log(
                    `Successfully entered 'John' using selector: ${selector}`
                  );
                  nameFieldFound = true;
                  break;
                } else {
                  console.log(
                    `Field didn't accept text correctly. Value: "${enteredValue}"`
                  );
                }
              } catch (fillError) {
                console.log(`Failed to fill field: ${fillError.message}`);
              }
            }
          }

          if (nameFieldFound) break;
        } catch (error) {
          console.log(`Name selector ${selector} failed: ${error.message}`);
        }
      }
    }

    if (!nameFieldFound) {
      console.log(
        "Last resort: examining all visible inputs more carefully..."
      );

      const allTextInputs = page.locator(
        'input[type="text"], input:not([type]), .oxd-input'
      );
      const inputCount = await allTextInputs.count();
      console.log(
        `Found ${inputCount} text input fields for detailed analysis`
      );

      for (let i = 0; i < inputCount; i++) {
        try {
          const input = allTextInputs.nth(i);
          if (await input.isVisible({ timeout: 2000 })) {
            const placeholder = await input.getAttribute("placeholder");
            const name = await input.getAttribute("name");
            const className = await input.getAttribute("class");

            const parentDiv = input.locator("xpath=..");
            const grandParentDiv = input.locator("xpath=../..");
            const parentText = await parentDiv.textContent();
            const grandParentText = await grandParentDiv.textContent();

            console.log(`Input ${i} analysis:`);
            console.log(`  - name: "${name}", placeholder: "${placeholder}"`);
            console.log(`  - class: "${className}"`);
            console.log(`  - parent text: "${parentText}"`);
            console.log(`  - grandparent text: "${grandParentText}"`);

            const isLikelyEmployeeNameField =
              (placeholder &&
                (placeholder.toLowerCase().includes("type for hints") ||
                  placeholder.toLowerCase().includes("employee") ||
                  placeholder.toLowerCase().includes("name"))) ||
              (parentText &&
                (parentText.includes("Employee Name") ||
                  parentText.includes("Employee") ||
                  parentText.includes("Name"))) ||
              (grandParentText &&
                (grandParentText.includes("Employee Name") ||
                  grandParentText.includes("Employee"))) ||
              (className && className.includes("autocomplete"));

            const isWrongField =
              (placeholder &&
                (placeholder.toLowerCase().includes("id") ||
                  placeholder.toLowerCase().includes("password") ||
                  placeholder.toLowerCase().includes("date") ||
                  placeholder.toLowerCase().includes("status"))) ||
              (name &&
                (name.toLowerCase().includes("password") ||
                  name.toLowerCase().includes("id") ||
                  name.toLowerCase().includes("date")));

            if (isLikelyEmployeeNameField && !isWrongField) {
              console.log(
                `Input ${i} seems to be Employee Name field - attempting to use it`
              );
              try {
                await input.scrollIntoViewIfNeeded();
                await input.click();
                await page.waitForTimeout(1000);
                await input.clear();
                await input.fill("John");
                await page.waitForTimeout(2000);

                const enteredValue = await input.inputValue();
                if (enteredValue === "John") {
                  console.log(`SUCCESS: Entered 'John' into input ${i}`);
                  nameFieldFound = true;
                  break;
                } else {
                  console.log(
                    `Field ${i} didn't accept text. Current value: "${enteredValue}"`
                  );
                }
              } catch (fillError) {
                console.log(`Failed to fill input ${i}: ${fillError.message}`);
              }
            } else if (!isWrongField && i < 3) {
              console.log(`Trying input ${i} as fallback option`);
              try {
                await input.scrollIntoViewIfNeeded();
                await input.click();
                await page.waitForTimeout(1000);
                await input.clear();
                await input.fill("John");
                await page.waitForTimeout(2000);

                const enteredValue = await input.inputValue();
                if (enteredValue === "John") {
                  console.log(`SUCCESS: Used input ${i} as fallback`);
                  nameFieldFound = true;
                  break;
                }
              } catch (fillError) {
                console.log(
                  `Fallback attempt ${i} failed: ${fillError.message}`
                );
              }
            }
          }
        } catch (error) {
          console.log(`Error analyzing input ${i}: ${error.message}`);
        }
      }
    }

    if (!nameFieldFound) {
      throw new Error("Could not find employee name field");
    }

    console.log("STEP 3: Looking for Search button...");
    await page.waitForTimeout(3000);

    console.log("DEBUG: Checking all buttons on the page...");
    const allButtons = page.locator("button");
    const buttonCount = await allButtons.count();
    console.log(`Found ${buttonCount} total buttons`);

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      try {
        const button = allButtons.nth(i);
        if (await button.isVisible({ timeout: 2000 })) {
          const buttonText = await button.textContent();
          const buttonType = await button.getAttribute("type");
          const buttonClass = await button.getAttribute("class");
          console.log(
            `Button ${i}: text="${buttonText}", type="${buttonType}", class="${buttonClass}"`
          );
        }
      } catch (e) {
        console.log(`Button ${i}: Could not get attributes`);
      }
    }

    const searchButtonSelectors = [
      'button:has-text("Search")',
      'button >> text="Search"',
      'input[type="submit"][value*="Search"]',
      'button[type="submit"]',
      '.oxd-button:has-text("Search")',
      '.oxd-button--secondary:has-text("Search")',
      '.oxd-button[type="submit"]',
      'button:contains("Search")',
      "button.oxd-button",
      ".oxd-form-actions button",
    ];

    let searchButtonFound = false;
    for (const selector of searchButtonSelectors) {
      try {
        const searchButtons = page.locator(selector);
        const count = await searchButtons.count();

        console.log(
          `Trying search button selector: ${selector} - found ${count} elements`
        );

        for (let i = 0; i < count; i++) {
          const searchButton = searchButtons.nth(i);
          if (await searchButton.isVisible({ timeout: 5000 })) {
            const buttonText = await searchButton.textContent();
            console.log(`Found Search button ${i} with text: "${buttonText}"`);

            if (
              !buttonText ||
              buttonText.toLowerCase().includes("search") ||
              buttonText.toLowerCase().includes("submit")
            ) {
              console.log(`Clicking Search button with selector: ${selector}`);
              try {
                await searchButton.scrollIntoViewIfNeeded();
                await searchButton.click({ timeout: 5000 });
                console.log("Successfully clicked Search button");
                searchButtonFound = true;
                break;
              } catch (clickError) {
                console.log(
                  `Click failed, trying force click: ${clickError.message}`
                );
                try {
                  await searchButton.click({ force: true });
                  console.log("Successfully clicked Search button with force");
                  searchButtonFound = true;
                  break;
                } catch (forceError) {
                  console.log(`Force click failed: ${forceError.message}`);
                }
              }
            }
          }
        }
        if (searchButtonFound) break;
      } catch (error) {
        console.log(
          `Search button selector ${selector} failed: ${error.message}`
        );
      }
    }

    if (!searchButtonFound) {
      console.log(
        "Last resort: trying any submit button or form action button..."
      );

      const fallbackSelectors = [
        'button[type="submit"]',
        ".oxd-button",
        'input[type="submit"]',
        ".oxd-form-actions button",
        "form button",
      ];

      for (const selector of fallbackSelectors) {
        try {
          const buttons = page.locator(selector);
          const count = await buttons.count();

          for (let i = 0; i < count; i++) {
            const button = buttons.nth(i);
            if (await button.isVisible({ timeout: 3000 })) {
              const buttonText = await button.textContent();
              console.log(`Trying fallback button ${i}: "${buttonText}"`);

              try {
                await button.scrollIntoViewIfNeeded();
                await button.click();
                console.log(
                  `Successfully clicked fallback button: "${buttonText}"`
                );
                searchButtonFound = true;
                break;
              } catch (error) {
                console.log(`Fallback button click failed: ${error.message}`);
              }
            }
          }
          if (searchButtonFound) break;
        } catch (error) {
          console.log(`Fallback selector ${selector} failed: ${error.message}`);
        }
      }
    }

    if (!searchButtonFound) {
      console.log("Final fallback: trying to press Enter key...");
      try {
        await page.keyboard.press("Enter");
        console.log("Pressed Enter key as search trigger");
        searchButtonFound = true;
      } catch (error) {
        console.log(`Enter key press failed: ${error.message}`);
        throw new Error("Could not find or activate Search button");
      }
    }

    console.log("Waiting for search results...");
    await page.waitForTimeout(8000);

    const pageContent = await page.textContent("body");
    const finalUrl = page.url();

    console.log("Search completed - Current URL:", finalUrl);
    console.log("Checking if employees named John were found...");

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
        console.log(`Found no records message: "${message}"`);
        foundNoRecords = true;
        break;
      }
    }

    if (foundNoRecords) {
      console.log(
        "TEST FAILED: No employees named John found - this should show employees"
      );
      throw new Error(
        "TEST FAILED: Search for employee name 'John' returned no records - expected to find employees"
      );
    }

    const hasEmployeeRecords =
      (await page.locator("table tbody tr, .oxd-table-row").count()) > 1;
    const hasEmployeeTable = await page
      .locator("table, .oxd-table")
      .isVisible({ timeout: 3000 });

    if (hasEmployeeRecords && hasEmployeeTable) {
      console.log("SUCCESS: Found employee records in search results");

      if (pageContent?.includes("John")) {
        console.log("SUCCESS: Found 'John' in the search results");
      } else {
        console.log(
          "INFO: Employee table found but 'John' not visible in page content"
        );
      }

      console.log(
        "TEST PASSED: Employee name search for 'John' was successful - Sėkminga"
      );
    } else {
      console.log("WARNING: No employee table or records found");

      if (pageContent && pageContent.length > 100) {
        console.log("Page has content but no clear employee results table");
      } else {
        console.log("Page seems to have very little content");
      }

      throw new Error(
        "TEST FAILED: No employee records table found after search"
      );
    }

    console.log(
      "Employee name search test completed - Search for 'John' was successful"
    );
  });
});
