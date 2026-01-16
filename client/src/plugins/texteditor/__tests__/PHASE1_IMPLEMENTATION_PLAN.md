# Phase 1: Advanced Text Formatting - Implementation Plan

## 🎯 PHASE OVERVIEW

**Duration**: 4 weeks
**Goal**: Implement advanced text formatting to achieve 95% Google Docs text formatting parity
**Priority**: High - Foundation for all advanced features

## 📋 WEEK-BY-WEEK BREAKDOWN

### Week 1: Font System Enhancement

#### Day 1-2: FontService Implementation
```typescript
// File: services/FontService.ts
export interface FontFamily {
  name: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
  variants: FontVariant[];
  webSafe: boolean;
  googleFont: boolean;
}

export interface FontVariant {
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style: 'normal' | 'italic';
}

export class FontService {
  private static fontCache = new Map<string, FontFamily>();
  private static loadedFonts = new Set<string>();

  static async loadGoogleFont(fontFamily: string): Promise<void> {
    if (this.loadedFonts.has(fontFamily)) return;
    
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    this.loadedFonts.add(fontFamily);
  }

  static applyFontFamily(fontFamily: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontFamily = fontFamily;

    try {
      if (selection.isCollapsed) {
        range.insertNode(span);
        range.setStart(span, 0);
        range.collapse(true);
      } else {
        range.surroundContents(span);
      }
    } catch (error) {
      this.applyFontToComplexRange(range, fontFamily);
    }
  }

  static applyFontSize(size: number): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = `${size}px`;

    try {
      if (selection.isCollapsed) {
        range.insertNode(span);
        range.setStart(span, 0);
        range.collapse(true);
      } else {
        range.surroundContents(span);
      }
    } catch (error) {
      this.applyFontSizeToComplexRange(range, size);
    }
  }

  static getAvailableFonts(): FontFamily[] {
    return [
      { name: 'Arial', category: 'sans-serif', variants: this.getStandardVariants(), webSafe: true, googleFont: false },
      { name: 'Times New Roman', category: 'serif', variants: this.getStandardVariants(), webSafe: true, googleFont: false },
      { name: 'Helvetica', category: 'sans-serif', variants: this.getStandardVariants(), webSafe: true, googleFont: false },
      { name: 'Georgia', category: 'serif', variants: this.getStandardVariants(), webSafe: true, googleFont: false },
      { name: 'Roboto', category: 'sans-serif', variants: this.getAllVariants(), webSafe: false, googleFont: true },
      { name: 'Open Sans', category: 'sans-serif', variants: this.getAllVariants(), webSafe: false, googleFont: true },
      { name: 'Lato', category: 'sans-serif', variants: this.getAllVariants(), webSafe: false, googleFont: true },
      { name: 'Montserrat', category: 'sans-serif', variants: this.getAllVariants(), webSafe: false, googleFont: true },
    ];
  }

  private static getStandardVariants(): FontVariant[] {
    return [
      { weight: 400, style: 'normal' },
      { weight: 400, style: 'italic' },
      { weight: 700, style: 'normal' },
      { weight: 700, style: 'italic' }
    ];
  }

  private static getAllVariants(): FontVariant[] {
    const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
    const styles = ['normal', 'italic'] as const;
    
    return weights.flatMap(weight => 
      styles.map(style => ({ weight, style }))
    );
  }
}
```

#### Day 3: FontPicker Component
```typescript
// File: components/FontPicker.tsx
import React, { useState, useEffect } from 'react';
import { FontService, FontFamily } from '../services/FontService';

interface FontPickerProps {
  currentFont: string;
  onFontChange: (fontFamily: string) => void;
  className?: string;
}

export const FontPicker: React.FC<FontPickerProps> = ({
  currentFont,
  onFontChange,
  className = ''
}) => {
  const [fonts, setFonts] = useState<FontFamily[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFonts(FontService.getAvailableFonts());
  }, []);

  const filteredFonts = fonts.filter(font =>
    font.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFontSelect = async (font: FontFamily) => {
    if (font.googleFont) {
      await FontService.loadGoogleFont(font.name);
    }
    onFontChange(font.name);
    setIsOpen(false);
  };

  return (
    <div className={`font-picker ${className}`}>
      <button
        className="font-picker__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span style={{ fontFamily: currentFont }}>{currentFont}</span>
        <span className="font-picker__arrow">▼</span>
      </button>

      {isOpen && (
        <div className="font-picker__dropdown" role="listbox">
          <input
            type="text"
            className="font-picker__search"
            placeholder="Search fonts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div className="font-picker__list">
            {filteredFonts.map((font) => (
              <button
                key={font.name}
                className={`font-picker__option ${font.name === currentFont ? 'active' : ''}`}
                onClick={() => handleFontSelect(font)}
                style={{ fontFamily: font.name }}
                role="option"
                aria-selected={font.name === currentFont}
              >
                <span className="font-picker__name">{font.name}</span>
                <span className="font-picker__category">{font.category}</span>
                {font.googleFont && <span className="font-picker__badge">Google</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

#### Day 4-5: FontPicker Tests & Integration
```typescript
// File: __tests__/components/FontPicker.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { FontPicker } from '../../components/FontPicker';
import { FontService } from '../../services/FontService';

vi.mock('../../services/FontService');

describe('FontPicker', () => {
  const mockFonts = [
    { name: 'Arial', category: 'sans-serif', variants: [], webSafe: true, googleFont: false },
    { name: 'Roboto', category: 'sans-serif', variants: [], webSafe: false, googleFont: true }
  ];

  beforeEach(() => {
    vi.mocked(FontService.getAvailableFonts).mockReturnValue(mockFonts);
  });

  test('should render current font', () => {
    const { container } = render(
      <FontPicker currentFont="Arial" onFontChange={() => {}} />
    );

    expect(container.textContent).toContain('Arial');
  });

  test('should open dropdown on click', () => {
    const { container } = render(
      <FontPicker currentFont="Arial" onFontChange={() => {}} />
    );

    const trigger = container.querySelector('.font-picker__trigger');
    fireEvent.click(trigger!);

    expect(container.querySelector('.font-picker__dropdown')).toBeTruthy();
  });

  test('should filter fonts by search term', () => {
    const { container } = render(
      <FontPicker currentFont="Arial" onFontChange={() => {}} />
    );

    const trigger = container.querySelector('.font-picker__trigger');
    fireEvent.click(trigger!);

    const searchInput = container.querySelector('.font-picker__search');
    fireEvent.change(searchInput!, { target: { value: 'Rob' } });

    const options = container.querySelectorAll('.font-picker__option');
    expect(options).toHaveLength(1);
    expect(options[0].textContent).toContain('Roboto');
  });

  test('should load Google font on selection', async () => {
    const mockOnFontChange = vi.fn();
    const { container } = render(
      <FontPicker currentFont="Arial" onFontChange={mockOnFontChange} />
    );

    const trigger = container.querySelector('.font-picker__trigger');
    fireEvent.click(trigger!);

    const robotoOption = container.querySelector('[role="option"]:last-child');
    fireEvent.click(robotoOption!);

    await waitFor(() => {
      expect(FontService.loadGoogleFont).toHaveBeenCalledWith('Roboto');
      expect(mockOnFontChange).toHaveBeenCalledWith('Roboto');
    });
  });
});
```

### Week 2: Color System Implementation

#### Day 1-2: ColorService Implementation
```typescript
// File: services/ColorService.ts
export interface ColorPalette {
  name: string;
  colors: string[];
}

export interface ColorHistory {
  recentColors: string[];
  customColors: string[];
}

export class ColorService {
  private static readonly RECENT_COLORS_LIMIT = 10;
  private static colorHistory: ColorHistory = {
    recentColors: [],
    customColors: []
  };

  static applyTextColor(color: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.color = color;

    this.applyColorToRange(range, span);
    this.addToRecentColors(color);
  }

  static applyBackgroundColor(color: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = color;

    this.applyColorToRange(range, span);
    this.addToRecentColors(color);
  }

  static applyHighlight(color: string): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const mark = document.createElement('mark');
    mark.style.backgroundColor = color;

    try {
      if (selection.isCollapsed) {
        range.insertNode(mark);
        range.setStart(mark, 0);
        range.collapse(true);
      } else {
        range.surroundContents(mark);
      }
    } catch (error) {
      this.applyHighlightToComplexRange(range, color);
    }

    this.addToRecentColors(color);
  }

  static getDefaultPalettes(): ColorPalette[] {
    return [
      {
        name: 'Standard Colors',
        colors: [
          '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
          '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'
        ]
      },
      {
        name: 'Theme Colors',
        colors: [
          '#1c4587', '#2d5aa0', '#3c78d8', '#6d9eeb', '#a4c2f4', '#c9daf8', '#e1ecf4', '#f4f8fc',
          '#0d5d0d', '#0f7b0f', '#34a853', '#57bb8a', '#7dd3a0', '#a8ddb5', '#c6e5d0', '#e8f5e8'
        ]
      }
    ];
  }

  static getColorHistory(): ColorHistory {
    return { ...this.colorHistory };
  }

  static addCustomColor(color: string): void {
    if (!this.colorHistory.customColors.includes(color)) {
      this.colorHistory.customColors.unshift(color);
      if (this.colorHistory.customColors.length > 20) {
        this.colorHistory.customColors.pop();
      }
    }
  }

  private static applyColorToRange(range: Range, element: HTMLElement): void {
    try {
      if (range.collapsed) {
        range.insertNode(element);
        range.setStart(element, 0);
        range.collapse(true);
      } else {
        range.surroundContents(element);
      }
    } catch (error) {
      // Handle complex ranges
      const contents = range.extractContents();
      element.appendChild(contents);
      range.insertNode(element);
    }
  }

  private static addToRecentColors(color: string): void {
    const recent = this.colorHistory.recentColors;
    const index = recent.indexOf(color);
    
    if (index > -1) {
      recent.splice(index, 1);
    }
    
    recent.unshift(color);
    
    if (recent.length > this.RECENT_COLORS_LIMIT) {
      recent.pop();
    }
  }
}
```

#### Day 3-5: ColorPicker Component & Tests
```typescript
// File: components/ColorPicker.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ColorService, ColorPalette } from '../services/ColorService';

interface ColorPickerProps {
  type: 'text' | 'background' | 'highlight';
  currentColor: string;
  onColorChange: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  type,
  currentColor,
  onColorChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState('#000000');
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [colorHistory, setColorHistory] = useState(ColorService.getColorHistory());
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPalettes(ColorService.getDefaultPalettes());
  }, []);

  const handleColorSelect = (color: string) => {
    switch (type) {
      case 'text':
        ColorService.applyTextColor(color);
        break;
      case 'background':
        ColorService.applyBackgroundColor(color);
        break;
      case 'highlight':
        ColorService.applyHighlight(color);
        break;
    }
    
    onColorChange(color);
    setColorHistory(ColorService.getColorHistory());
    setIsOpen(false);
  };

  const handleCustomColorSubmit = () => {
    ColorService.addCustomColor(customColor);
    handleColorSelect(customColor);
  };

  return (
    <div className={`color-picker ${className}`}>
      <button
        className="color-picker__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`${type} color picker`}
      >
        <div 
          className="color-picker__preview"
          style={{ backgroundColor: currentColor }}
        />
        <span className="color-picker__arrow">▼</span>
      </button>

      {isOpen && (
        <div className="color-picker__dropdown">
          {/* Recent Colors */}
          {colorHistory.recentColors.length > 0 && (
            <div className="color-picker__section">
              <h4>Recent Colors</h4>
              <div className="color-picker__grid">
                {colorHistory.recentColors.map((color, index) => (
                  <button
                    key={`recent-${index}`}
                    className="color-picker__swatch"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Default Palettes */}
          {palettes.map((palette) => (
            <div key={palette.name} className="color-picker__section">
              <h4>{palette.name}</h4>
              <div className="color-picker__grid">
                {palette.colors.map((color) => (
                  <button
                    key={color}
                    className={`color-picker__swatch ${color === currentColor ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Custom Colors */}
          {colorHistory.customColors.length > 0 && (
            <div className="color-picker__section">
              <h4>Custom Colors</h4>
              <div className="color-picker__grid">
                {colorHistory.customColors.map((color, index) => (
                  <button
                    key={`custom-${index}`}
                    className="color-picker__swatch"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom Color Input */}
          <div className="color-picker__custom">
            <input
              ref={colorInputRef}
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="color-picker__input"
            />
            <button
              onClick={handleCustomColorSubmit}
              className="color-picker__add-custom"
            >
              Add Custom Color
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

## 🧪 TESTING REQUIREMENTS

### Test Coverage Targets
- **FontService**: 95% coverage
- **ColorService**: 95% coverage
- **FontPicker**: 90% coverage
- **ColorPicker**: 90% coverage

### Test Categories
1. **Unit Tests**: Service methods and component logic
2. **Integration Tests**: Component interaction with services
3. **Visual Tests**: Color and font rendering
4. **Accessibility Tests**: ARIA compliance and keyboard navigation
5. **Performance Tests**: Font loading and color application speed

## 📚 DOCUMENTATION DELIVERABLES

### Week 1 Documentation
- **FontService API Reference**
- **FontPicker Component Guide**
- **Font Loading Performance Guide**
- **Google Fonts Integration Guide**

### Week 2 Documentation
- **ColorService API Reference**
- **ColorPicker Component Guide**
- **Color Accessibility Guidelines**
- **Custom Color Management Guide**

## 🎯 SUCCESS CRITERIA

### Week 1 Success Metrics
- [ ] FontService supports 50+ font families
- [ ] Google Fonts load in <500ms
- [ ] FontPicker renders all font options
- [ ] Font application works in all browsers
- [ ] 95% test coverage achieved

### Week 2 Success Metrics
- [ ] ColorService supports text, background, and highlight colors
- [ ] ColorPicker includes 100+ predefined colors
- [ ] Custom color support implemented
- [ ] Color history tracking functional
- [ ] 95% test coverage achieved

This detailed implementation plan provides the foundation for Phase 1, establishing the advanced text formatting capabilities that will support all subsequent features.