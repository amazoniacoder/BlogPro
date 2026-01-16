import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('TextEditor Accessibility', () => {
  test('should have no accessibility violations', async ({ page }) => {
    await page.goto('/texteditor');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations in collaborative mode', async ({ page }) => {
    await page.goto('/texteditor/collaborative?docId=test123&userId=user1&userName=User1');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations with comments', async ({ page }) => {
    await page.goto('/texteditor/comments');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations with version history', async ({ page }) => {
    await page.goto('/texteditor/versions');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/texteditor');
    
    // Tab to the editor
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if editor has focus
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('role'));
    expect(focusedElement).toBe('textbox');
    
    // Type text
    await page.keyboard.type('Hello, world!');
    
    // Tab to toolbar buttons
    await page.keyboard.press('Tab');
    
    // Check if a toolbar button has focus
    const focusedButton = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    expect(focusedButton).toBe('button');
    
    // Press button with Enter
    await page.keyboard.press('Enter');
    
    // Check if action was performed (e.g., bold formatting applied)
    const hasFormatting = await page.evaluate(() => {
      const editor = document.querySelector('[role="textbox"]');
      return editor?.innerHTML.includes('<strong>') || editor?.innerHTML.includes('<b>');
    });
    
    expect(hasFormatting).toBe(true);
  });
});