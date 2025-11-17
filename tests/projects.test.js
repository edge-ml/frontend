import { test, expect } from '@playwright/test';

test.beforeEach(async ({page}) => {
    await page.goto("http://localhost:5173/login");
    await page.locator("#email").fill("test123@teco.edu");
    await page.locator("#password").fill("admin");
    await page.getByText("Login").click();
    await page.waitForURL("**/");
})

test("Create a project", async ({page}) => {
    await page.locator("#btn-add-project").click();
    await page.locator("#inputProjectName").fill("testProject");
    await page.locator("#btnSaveProject").click();
    const btnCount = await page.locator("#btnSaveProject").count()
    expect(btnCount).toEqual(0);
})

test("Create project with same name", async ({page}) => {
    await page.locator("#btn-add-project").click();
    await page.locator("#inputProjectName").fill("testProject");
    await page.locator("#btnSaveProject").click();
    const btnCount = await page.locator('#btnSaveProject').count()
    expect(btnCount).toEqual(0);
})