import { test, expect, BrowserContext } from '@playwright/test';

test.describe('Collaborative Editing', () => {
  test('should show collaborators', async ({ browser }) => {
    // Create two browser contexts to simulate two users
    const userContext1 = await browser.newContext();
    const userContext2 = await browser.newContext();
    
    const page1 = await userContext1.newPage();
    const page2 = await userContext2.newPage();
    
    // Navigate to the same document
    await page1.goto('/texteditor/collaborative?docId=test123&userId=user1&userName=User1');
    await page2.goto('/texteditor/collaborative?docId=test123&userId=user2&userName=User2');
    
    // Check if user2 appears in user1's collaborator list
    await expect(page1.locator('text=User2')).toBeVisible();
    
    // Check if user1 appears in user2's collaborator list
    await expect(page2.locator('text=User1')).toBeVisible();
    
    // Clean up
    await userContext1.close();
    await userContext2.close();
  });

  test('should sync changes between users', async ({ browser }) => {
    // Create two browser contexts to simulate two users
    const userContext1 = await browser.newContext();
    const userContext2 = await browser.newContext();
    
    const page1 = await userContext1.newPage();
    const page2 = await userContext2.newPage();
    
    // Navigate to the same document
    await page1.goto('/texteditor/collaborative?docId=test123&userId=user1&userName=User1');
    await page2.goto('/texteditor/collaborative?docId=test123&userId=user2&userName=User2');
    
    // User1 types text
    const editor1 = page1.locator('[role="textbox"]');
    await editor1.click();
    await editor1.type('Hello from User1');
    
    // Check if User2 sees the text
    const editor2 = page2.locator('[role="textbox"]');
    await expect(editor2).toContainText('Hello from User1');
    
    // User2 types text
    await editor2.click();
    await editor2.press('End'); // Move cursor to end
    await editor2.type('. And hello from User2');
    
    // Check if User1 sees the combined text
    await expect(editor1).toContainText('Hello from User1. And hello from User2');
    
    // Clean up
    await userContext1.close();
    await userContext2.close();
  });
});