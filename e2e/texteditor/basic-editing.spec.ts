import { test, expect } from '@playwright/test';

test.describe('TextEditor Basic Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/texteditor');
  });

  test('should render the editor', async ({ page }) => {
    await expect(page.locator('[role="textbox"]')).toBeVisible();
  });

  test('should allow typing text', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    await editor.click();
    await editor.type('Hello, world!');
    await expect(editor).toContainText('Hello, world!');
  });

  test('should apply bold formatting', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    await editor.click();
    await editor.type('Hello, world!');
    
    // Select text
    await page.keyboard.down('Shift');
    for (let i = 0; i < 13; i++) {
      await page.keyboard.press('ArrowLeft');
    }
    await page.keyboard.up('Shift');
    
    // Click bold button
    await page.locator('button[aria-label="Bold"]').click();
    
    // Check if bold formatting was applied
    const boldText = page.locator('strong');
    await expect(boldText).toContainText('Hello, world!');
  });

  test('should create a new paragraph when Enter is pressed', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    await editor.click();
    await editor.type('First paragraph');
    await page.keyboard.press('Enter');
    await editor.type('Second paragraph');
    
    const paragraphs = page.locator('p');
    await expect(paragraphs).toHaveCount(2);
    await expect(paragraphs.nth(0)).toContainText('First paragraph');
    await expect(paragraphs.nth(1)).toContainText('Second paragraph');
  });

  test('should undo and redo changes', async ({ page }) => {
    const editor = page.locator('[role="textbox"]');
    await editor.click();
    await editor.type('Hello, world!');
    
    // Undo
    await page.keyboard.press('Control+z');
    await expect(editor).not.toContainText('Hello, world!');
    
    // Redo
    await page.keyboard.press('Control+y');
    await expect(editor).toContainText('Hello, world!');
  });
});