const { test, expect } = require("@playwright/test");

// End-to-end check of leave-one-out cross validation (edge-ml/edge-ml#75)
// against a real deployment. Needs E2E_USER / E2E_PASS and a project whose
// datasets carry metadata fields.
//
// Only datasets that share time series can be trained together, so this selects
// a handful of wisdm subjects rather than everything: with that selection
// subject_id has many distinct values while source and whar_id have exactly one,
// which exercises both the usable and the refused case for real.
const SUBJECT_COUNT = 6;

async function login(page) {
  await page.goto("/");
  await page.getByPlaceholder("username").fill(process.env.E2E_USER);
  await page.getByPlaceholder("password").fill(process.env.E2E_PASS);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL("**/Datasets", { timeout: 45000 });
}

/** Opens the training wizard and walks to the evaluation step. */
async function openEvaluationStep(page) {
  // SPA navigation rather than page.goto: a full reload of the Models route does
  // not re-bootstrap reliably, and this is what a user does anyway.
  await page.getByText("Models", { exact: true }).first().click();
  const train = page.getByRole("button", { name: "Train a model" });
  await train.waitFor({ timeout: 45000 });
  await train.click();
  await page.waitForTimeout(2000);

  await page.getByText("Manual Classification Pipeline").last().click();
  await page.waitForTimeout(1200);
  await page.getByText("Server / research").click();
  await page.waitForTimeout(1500);

  const dialog = page.locator("[role=dialog]").last();
  const next = page.getByRole("button", { name: "Next" });

  // labeling
  await dialog.locator("input[type=checkbox]").nth(1).check({ force: true });
  await page.waitForTimeout(700);
  await next.click();
  await page.waitForTimeout(2000);

  // datasets: checkbox 0 is "select all", which picks incompatible datasets and
  // leaves Next disabled, so take the first N rows (all wisdm) instead.
  const boxes = dialog.locator("input[type=checkbox]");
  for (let i = 1; i <= SUBJECT_COUNT; i++) {
    await boxes.nth(i).click({ force: true });
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(1200);
  const selected = await dialog.locator("input[type=checkbox]:checked").count();
  console.log(`selected ${selected} datasets; Next disabled: ${await next.isDisabled()}`);
  expect(await next.isDisabled()).toBe(false);

  for (let hop = 0; hop < 8; hop++) {
    await next.click();
    await page.waitForTimeout(1700);
    const text = await dialog.innerText();
    const step = (text.match(/Step \d of \d/) || ["?"])[0];
    console.log(`  hop ${hop} -> ${step}`);
    if (/Evaluat/i.test(text)) return dialog;
  }
  throw new Error("never reached the evaluation step");
}

const optionTexts = async (page) =>
  (await page.getByRole("option").allTextContents()).map((t) => t.trim());

/**
 * Opens a Mantine Select. It sits below the fold in the modal's own scroll
 * container and the input is read-only, so a plain click is unreliable; focus
 * and ArrowDown is how the component is meant to be driven.
 */
async function openCombobox(page, locator) {
  await locator.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(300);
  await locator.focus();
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(700);
  if ((await page.getByRole("option").count()) === 0) {
    await locator.evaluate((el) => el.click());
    await page.waitForTimeout(700);
  }
  const n = await page.getByRole("option").count();
  console.log("  combobox opened, options visible:", n);
}

test.describe("leave-one-out cross validation", () => {
  test.setTimeout(240000);

  test("is offered, lists the metadata fields, and reports what each one costs", async ({
    page,
  }) => {
    await login(page);
    const dialog = await openEvaluationStep(page);

    // 1. the evaluation is offered at all ------------------------------------
    await dialog.getByLabel("Method", { exact: false }).first().click();
    await page.waitForTimeout(800);
    const methods = await optionTexts(page);
    console.log("METHODS OFFERED:", JSON.stringify(methods));
    expect(methods).toContain("LeaveOneGroupOut");

    await page
      .getByRole("option", { name: "LeaveOneGroupOut", exact: true })
      .first()
      .click();
    await page.waitForTimeout(1600);

    // 2. the field list is derived from the selected datasets ----------------
    // The Mantine Select for the field is the only role=combobox input on the
    // step; the Method select renders without that role.
    const field = dialog.locator("input[role=combobox]").first();
    console.log("combobox count:", await dialog.locator("input[role=combobox]").count());
    // The field sits below the fold inside the modal's own scroll container, so
    // scroll it to the middle before clicking.
    await openCombobox(page, field);
    const fields = await optionTexts(page);
    console.log("FIELDS OFFERED:", JSON.stringify(fields));
    expect(fields).toContain("subject_id");
    expect(fields).toContain("source");
    expect(fields).toContain("whar_id");

    // 3. a field with a single distinct value is refused, with the reason ----
    await page.getByRole("option", { name: "source", exact: true }).first().click();
    await page.waitForTimeout(1600);
    const refused = await dialog.innerText();
    console.log("NOTE source:", (refused.match(/Only [^\n]*/) || ["<none>"])[0]);
    expect(refused).toMatch(/Only 1 distinct value of "source"/i);
    expect(refused).toMatch(/needs at least 2/i);

    // 4. a usable field reports the split -----------------------------------
    await openCombobox(page, field);
    await page.getByRole("option", { name: "subject_id", exact: true }).first().click();
    await page.waitForTimeout(1600);
    const usable = await dialog.innerText();
    console.log(
      "NOTE subject_id:",
      (usable.match(/(All \d+ selected|\d+ of \d+ selected)[^\n]*/) || ["<none>"])[0]
    );
    expect(usable).toMatch(
      new RegExp(`All ${SUBJECT_COUNT} selected datasets have "subject_id"`, "i")
    );
    expect(usable).toMatch(new RegExp(`across ${SUBJECT_COUNT} values`, "i"));
  });
});

// A second pass that actually trains, so the ml side is confirmed too: the UI
// wiring above proves the field is offered, not that the folds are run.
test.describe("leave-one-out actually runs", () => {
  test.setTimeout(900000);

  test("training with a metadata field produces cross_validation results", async ({
    page,
  }) => {
    await login(page);
    const dialog = await openEvaluationStep(page);

    await dialog.getByLabel("Method", { exact: false }).first().click();
    await page.waitForTimeout(700);
    await page
      .getByRole("option", { name: "LeaveOneGroupOut", exact: true })
      .first()
      .click();
    await page.waitForTimeout(1500);

    const field = dialog.locator("input[role=combobox]").first();
    await openCombobox(page, field);
    await page.getByRole("option", { name: "subject_id", exact: true }).first().click();
    await page.waitForTimeout(1200);

    // last step: name it, then train
    const modelName = `e2e-loo-${Date.now()}`;
    await page.getByRole("button", { name: "Next" }).click();
    await page.waitForTimeout(1800);
    const nameBox = dialog.locator("input").last();
    await nameBox.fill(modelName);
    await page.waitForTimeout(600);
    console.log("MODEL NAME:", modelName);

    const start = page.getByRole("button", { name: /train|start/i }).last();
    await start.click();
    console.log("training requested");

    // poll ml for the model, using the token the app already holds
    const token = await page.evaluate(() => localStorage.getItem("access_token"));
    const project = await page.evaluate(() => localStorage.getItem("project_id"));
    let model;
    for (let i = 0; i < 100; i++) {
      await page.waitForTimeout(6000);
      const res = await page.request.get("https://beta.edge-ml.org/ml/models/", {
        headers: { Authorization: `Bearer ${token}`, project },
      });
      if (!res.ok()) continue;
      const list = await res.json();
      model = (Array.isArray(list) ? list : []).find((m) => m.name === modelName);
      if (!model) continue;
      console.log(`  poll ${i}: status=${model.trainStatus} stage=${model.stage || "-"}`);
      if (["done", "error", "failed"].includes(String(model.trainStatus))) break;
    }

    expect(model, "the model should exist").toBeTruthy();
    console.log("FINAL STATUS:", model.trainStatus, "| error:", model.error || "none");
    expect(String(model.trainStatus)).toBe("done");

    const blob = JSON.stringify(model);
    console.log("HAS cross_validation:", blob.includes("cross_validation"));
    expect(blob).toContain("cross_validation");
    const cv = JSON.parse(blob).cross_validation ||
      (JSON.parse(blob).performance || {}).cross_validation;
    console.log("CROSS VALIDATION:", JSON.stringify(cv).slice(0, 400));
  });
});
