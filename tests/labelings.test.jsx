import { test, expect } from '@playwright/test';


test.beforeEach(async ({page}) => {
    await page.goto("http://localhost:5173/login");
    await page.locator("#email").fill("test123@teco.edu");
    await page.locator("#password").fill("admin");
    await page.getByText("Login").click();
    await page.waitForURL("**/");
})

test("View labeling page", async ({page}) => {
    
})