import { test, expect } from '@playwright/test';

test('verify themes and images', async ({ page }) => {
  await page.goto('http://localhost:8080');

  // Wait for the themes to load
  await page.waitForSelector('[data-testid^="theme-card-"]');

  // Check for some of the new themes
  const newThemes = ['whiteday', 'halloween', 'singlesday', 'mazu'];
  for (const themeId of newThemes) {
    const themeCard = page.locator(`[data-testid="theme-card-${themeId}"]`);
    await expect(themeCard).toBeVisible();
  }

  // Select a theme and check if images load
  await page.locator('[data-testid="theme-card-halloween"]').click();

  // Wait for the background selection step
  await page.waitForSelector('[data-testid^="bg-card-"]');

  // Take a screenshot of the background selection
  await page.screenshot({ path: '/home/jules/verification/background_selection.png' });

  // Select a background
  await page.locator('[data-testid^="bg-card-"]').first().click();

  // Click next to go to text editor
  await page.getByRole('button', { name: /下一步/ }).click();

  // Wait for the text editor
  await page.waitForSelector('canvas');

  // Take a screenshot of the text editor
  await page.screenshot({ path: '/home/jules/verification/text_editor.png' });
});
