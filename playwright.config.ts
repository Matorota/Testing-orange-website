import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 300000, // Increased timeout to 5 minutes for very slow website
  expect: {
    timeout: 30000, // Increased expect timeout to 30 seconds
  },
  reporter: "html",
  use: {
    headless: false, // Set to false to see browser for debugging
    actionTimeout: 30000, // Increased action timeout to 30 seconds
    navigationTimeout: 120000, // Increased navigation timeout to 2 minutes
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
});
