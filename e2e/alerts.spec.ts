import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const email = "staff@demo.clinic";
const password = "password-demo-1";

test("a STAT fax opens from the alerts side panel", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Referral inbox" })).toBeVisible();

  const bytes = readFileSync(path.resolve("fixtures/referrals/gi-stat.pdf"));
  await page.setInputFiles("#file", {
    name: "gi-stat.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.concat([bytes, Buffer.from("alert-panel")]),
  });
  await page.getByRole("button", { name: "Upload" }).click();
  await expect(page.getByRole("link", { name: "Review Avery Quinn" })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText("STAT").first()).toBeVisible();

  await page.getByRole("button", { name: "Alerts" }).click();
  const panel = page.getByRole("dialog", { name: "Alerts" });
  await expect(panel.getByRole("link", { name: /Avery Quinn/ }).first()).toBeVisible();
  await expect(panel.getByText("STAT").first()).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);

  await page.getByRole("button", { name: "Alerts" }).click();
  await page.getByRole("dialog", { name: "Alerts" }).getByRole("link", { name: /Avery Quinn/ }).first().click();
  await expect(page.getByRole("heading", { name: "Avery Quinn" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Looks good" })).toBeVisible();
});
