import { test, expect } from '@playwright/test';


test("Signin", async ({page}) => {
    await page.goto("http://localhost:5173/register");
    await page.locator('#email').fill("test123@teco.edu");
    await page.locator('#password').fill("admin");
    await page.locator('#passwordRepeat').fill("admin");
    await page.locator('#username').fill("testUser123");
    await page.locator("#termsCheckbox").click();
    await page.locator("#registerButton").click();
    await page.waitForURL('**/login');
})

test("SignUp instead", async ({page}) => {
    await page.goto("http://localhost:5173/login");
    await page.getByText("Register").click();
    await page.waitForURL('**/register');
})

test("Login to the account", async ({page}) => {
    await page.goto("http://localhost:5173/login");
    await page.locator("#email").fill("test123@teco.edu");
    await page.locator("#password").fill("admin");
    await page.getByText("Login").click();
    await page.waitForURL("**/");
})