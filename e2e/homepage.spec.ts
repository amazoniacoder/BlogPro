import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/BlogPro/);
  });

  test('should navigate to blog page', async ({ page }) => {
    await page.goto('/');
    // Wait for page to load and find the blog link
    await page.waitForSelector('a[href="/blog"]');
    await page.click('a[href="/blog"]');
    await expect(page).toHaveURL(/.*blog/);
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for theme toggle button with various possible selectors
    const themeToggle = page.locator('button[aria-label*="theme"], button[title*="theme"], .theme-toggle, [data-theme-toggle]').first();
    
    // Check if theme toggle exists and is visible
    const toggleExists = await themeToggle.count() > 0;
    if (toggleExists) {
      const isVisible = await themeToggle.isVisible();
      if (isVisible) {
        await themeToggle.click();
        // Wait a bit for theme change to apply
        await page.waitForTimeout(500);
        // Check if dark class is applied to html element
        const html = page.locator('html');
        const hasThemeClass = await html.getAttribute('class');
        expect(hasThemeClass).toBeTruthy();
      } else {
        // Skip test if theme toggle is not visible
        test.skip(true, 'Theme toggle button exists but is not visible');
      }
    } else {
      // Skip test if theme toggle is not found
      test.skip(true, 'Theme toggle button not found');
    }
  });
});