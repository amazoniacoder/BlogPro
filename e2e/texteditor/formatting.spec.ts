import { test, expect } from '@playwright/test';

test.describe('Text Editor Formatting', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the editor page
    await page.goto('/editor');
    
    // Wait for the editor to load
    await page.waitForSelector('[contenteditable="true"]');
  });

  test('applies bold formatting', async ({ page }) => {
    // Type some text
    await page.fill('[contenteditable="true"]', 'Hello World');
    
    // Select the text
    await page.keyboard.press('Control+a');
    
    // Click the bold button
    await page.click('button[title="Bold"]');
    
    // Check if the text is bold
    const isBold = await page.evaluate(() => {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const span = range?.startContainer.parentElement;
      return window.getComputedStyle(span!).fontWeight === '700' || 
             window.getComputedStyle(span!).fontWeight === 'bold';
    });
    
    expect(isBold).toBeTruthy();
  });

  test('applies italic formatting', async ({ page }) => {
    // Type some text
    await page.fill('[contenteditable="true"]', 'Hello World');
    
    // Select the text
    await page.keyboard.press('Control+a');
    
    // Click the italic button
    await page.click('button[title="Italic"]');
    
    // Check if the text is italic
    const isItalic = await page.evaluate(() => {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const span = range?.startContainer.parentElement;
      return window.getComputedStyle(span!).fontStyle === 'italic';
    });
    
    expect(isItalic).toBeTruthy();
  });

  test('applies multiple formatting attributes', async ({ page }) => {
    // Type some text
    await page.fill('[contenteditable="true"]', 'Hello World');
    
    // Select the text
    await page.keyboard.press('Control+a');
    
    // Click the bold button
    await page.click('button[title="Bold"]');
    
    // Click the italic button
    await page.click('button[title="Italic"]');
    
    // Check if the text has both formatting attributes
    const hasFormatting = await page.evaluate(() => {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const span = range?.startContainer.parentElement;
      const style = window.getComputedStyle(span!);
      return style.fontWeight === '700' && style.fontStyle === 'italic';
    });
    
    expect(hasFormatting).toBeTruthy();
  });

  test('changes font size', async ({ page }) => {
    // Type some text
    await page.fill('[contenteditable="true"]', 'Hello World');
    
    // Select the text
    await page.keyboard.press('Control+a');
    
    // Open font size dropdown
    await page.click('select[title="Font Size"]');
    
    // Select a different font size
    await page.selectOption('select[title="Font Size"]', '24px');
    
    // Check if the font size was applied
    const fontSize = await page.evaluate(() => {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const span = range?.startContainer.parentElement;
      return window.getComputedStyle(span!).fontSize;
    });
    
    expect(fontSize).toBe('24px');
  });
});