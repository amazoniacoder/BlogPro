/**
 * Debug test to understand actual formatting boundaries
 */

describe('Format Boundary Debug', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div contenteditable="true"><p>Hello World</p></div>';
  });

  it('should show what execCommand actually creates', () => {
    const editor = document.querySelector('[contenteditable]') as HTMLElement;
    const p = editor.querySelector('p')!;
    const textNode = p.firstChild as Text;
    
    // Select "Hello"
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);
    
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Apply bold using execCommand
    document.execCommand('bold');
    
    console.log('📝 execCommand bold result:', p.innerHTML);
    console.log('📊 Child nodes:', Array.from(p.childNodes).map(n => ({
      type: n.nodeType === Node.TEXT_NODE ? 'TEXT' : 'ELEMENT',
      content: n.textContent,
      tagName: (n as Element).tagName
    })));
    
    // Position cursor after "Hello"
    const boldElement = p.querySelector('strong, b');
    if (boldElement) {
      const afterBoldRange = document.createRange();
      afterBoldRange.setStartAfter(boldElement);
      afterBoldRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(afterBoldRange);
      
      console.log('🎯 Cursor positioned after bold element');
      console.log('- Container:', afterBoldRange.startContainer.textContent);
      console.log('- Parent:', afterBoldRange.startContainer.parentElement?.tagName);
      
      // Now test space insertion
      document.execCommand('insertText', false, ' ');
      
      console.log('🔄 After space insertion:', p.innerHTML);
      
      // Check where cursor is now
      const finalSelection = window.getSelection();
      if (finalSelection && finalSelection.rangeCount > 0) {
        const finalRange = finalSelection.getRangeAt(0);
        const finalContainer = finalRange.startContainer;
        
        console.log('📍 Final cursor position:');
        console.log('- Container:', finalContainer.textContent);
        console.log('- Parent:', finalContainer.parentElement?.tagName);
        
        if (finalContainer.parentElement?.matches('strong, b, em, i, u')) {
          console.log('🔧 PROBLEM: Cursor still in formatted element!');
        } else {
          console.log('✅ Cursor outside formatted element');
        }
      }
    }
    
    expect(p.innerHTML).toContain('Hello');
  });

  it('should test different formatting scenarios', () => {
    const editor = document.querySelector('[contenteditable]') as HTMLElement;
    const p = editor.querySelector('p')!;
    
    // Test 1: Bold entire paragraph
    p.innerHTML = 'Hello World';
    const range1 = document.createRange();
    range1.selectNodeContents(p);
    
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range1);
    
    document.execCommand('bold');
    console.log('🧪 Test 1 - Bold entire paragraph:', p.innerHTML);
    
    // Test 2: Position cursor in middle and type
    const textNode = p.querySelector('strong')?.firstChild as Text;
    if (textNode) {
      const range2 = document.createRange();
      range2.setStart(textNode, 5); // After "Hello"
      range2.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range2);
      
      console.log('🎯 Cursor in middle of bold text');
      console.log('- Parent:', range2.startContainer.parentElement?.tagName);
      
      // Insert space
      document.execCommand('insertText', false, ' ');
      console.log('🔄 After space in middle:', p.innerHTML);
      
      // Insert more text
      document.execCommand('insertText', false, 'NEW');
      console.log('🔄 After typing NEW:', p.innerHTML);
      
      if (p.innerHTML.includes('<strong>Hello NEW World</strong>')) {
        console.log('🔧 CONFIRMED: Space and new text stay inside bold element!');
        console.log('   This is why formatting doesn\'t reset on space.');
      }
    }
    
    expect(true).toBe(true);
  });
});
