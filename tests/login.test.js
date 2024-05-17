import { test, expect } from '@playwright/test';

test("Signin", async ({page}) => {
    await page.goto("http://localhost:3000/register");
    await page.locator('#email').fill("test@teco.edu");
    await page.locator('#password').fill("admin");
    await page.locator('#passwordRepeat').fill("admin");
    await page.locator('#username').fill("testUser");
    await page.locator("#termsCheckbox").click();
    await page.locator("#registerButton").click();
    await page.waitForURL('**/login');
})