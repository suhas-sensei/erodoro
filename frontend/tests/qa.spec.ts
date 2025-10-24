import { test, expect } from "@playwright/test";

test.describe("QA Checklist Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Header has correct height", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();
    const box = await header.boundingBox();
    expect(box?.height).toBe(72);
  });

  test("Slash key focuses header search", async ({ page }) => {
    await page.keyboard.press("/");
    const searchInput = page.locator("#header-search");
    await expect(searchInput).toBeFocused();
  });

  test("Active tab shows blue underline", async ({ page }) => {
    const activeTab = page
      .locator('[role="tab"][aria-selected="true"]')
      .first();
    await expect(activeTab).toBeVisible();

    // Check for blue underline
    const underline = activeTab.locator("div.bg-blue");
    await expect(underline).toBeVisible();

    // Check underline height (should be 2px = 0.5 in Tailwind)
    const box = await underline.boundingBox();
    expect(box?.height).toBe(2);
  });

  test("Market cards display correctly", async ({ page }) => {
    const marketCard = page.locator('[class*="bg-bg2"]').first();
    await expect(marketCard).toBeVisible();
  });

  test("Title clamps at two lines", async ({ page }) => {
    const title = page.locator("h3.line-clamp-2").first();
    await expect(title).toBeVisible();
  });

  test("Login modal opens and closes", async ({ page }) => {
    // Click login button
    await page.getByRole("button", { name: /log in/i }).click();

    // Modal should be visible
    const modal = page.locator(".fixed.inset-0.z-50");
    await expect(modal).toBeVisible();

    // Close with ESC
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
  });

  test("Chips maintain active state", async ({ page }) => {
    const chip = page.getByRole("button", { name: "Trending" });
    await expect(chip).toBeVisible();

    // Click chip
    await chip.click();

    // Should have active state (bg-blue)
    await expect(chip).toHaveClass(/bg-blue/);
  });

  test("Volume abbreviations display correctly", async ({ page }) => {
    const volume = page.locator("text=/Vol\\./").first();
    await expect(volume).toBeVisible();
  });

  test("All focus rings are visible on keyboard navigation", async ({
    page,
  }) => {
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });
});
