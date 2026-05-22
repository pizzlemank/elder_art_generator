import { test, expect } from '@playwright/test';

test('verify themes are displayed on homepage', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  // Wait for the main heading or some content to load
  await expect(page.locator('h1')).toContainText('長輩圖產生器');

  // Check for some specific new themes added
  // We can use text selectors since we saw the names in themes.json
  const newThemes = [
    '萬聖節',
    '復活節',
    '世界地球日',
    '愚人節',
    '白色情人節',
    '排燈節',
    '七夕情人節',
    '媽祖聖誕',
    '佛誕節',
    '土地公生',
    '青年節',
    '軍人節',
    '台灣光復節',
    '雙11節'
  ];

  for (const theme of newThemes) {
    const themeButton = page.getByRole('button').filter({ hasText: theme });
    await expect(themeButton).toBeVisible();
  }

  // Take a screenshot of the homepage
  await page.screenshot({ path: '/home/jules/verification/homepage_themes.png', fullPage: true });
});

test('verify lastest.html gallery', async ({ page }) => {
  await page.goto('http://localhost:8080/lastest.html');

  // Check if it has the title
  await expect(page.locator('h1')).toContainText('最新背景圖片庫');

  // Check if there are some images (at least one)
  const images = page.locator('img');
  const count = await images.count();
  console.log(`Found ${count} images in gallery`);
  expect(count).toBeGreaterThan(0);

  // Take a screenshot of the gallery
  await page.screenshot({ path: '/home/jules/verification/latest_gallery_v2.png', fullPage: true });
});
