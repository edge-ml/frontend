const { test, expect } = require("@playwright/test");

// Proves the harness reaches the target and the app boots, before anything
// feature specific runs.
test("the app loads and shows the login form", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("input").first()).toBeVisible();
  const title = await page.title();
  expect(title.toLowerCase()).toContain("edge-ml");
});
