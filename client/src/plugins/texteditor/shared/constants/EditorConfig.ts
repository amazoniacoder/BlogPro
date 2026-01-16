/**
 * Centralized configuration constants for the text editor
 * Provides type-safe configuration with documented values
 */

export const EDITOR_CONFIG = {
  PERFORMANCE: {
    DEBOUNCE_DELAY: 16, // 60fps target (1000ms / 60fps = 16.67ms)
    MAX_HISTORY_SIZE: 100,
    CACHE_TTL: 5000,
    THROTTLE_LIMIT: 16
  },
  SECURITY: {
    MAX_CONTENT_LENGTH: 50000,
    ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'span', 'br'] as const,
    ALLOWED_ATTRIBUTES: ['style'] as const,
    SANITIZATION_OPTIONS: {
      stripScripts: true,
      allowedTags: ['p', 'strong', 'em', 'u', 'span', 'br'] as const
    }
  },
  FORMAT: {
    PX_TO_PT_RATIO: 0.75, // Standard conversion: 1pt = 1.33px, so 1px = 0.75pt
    DEFAULT_FONT_SIZE: '12pt' as const,
    DEFAULT_FONT_FAMILY: 'Arial' as const,
    DEFAULT_TEXT_ALIGN: 'left' as const,
    FONT_SIZES: ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt'] as const,
    FONT_FAMILIES: ['Arial', 'Times New Roman', 'Helvetica', 'Georgia', 'Verdana', 'Roboto', 'Courier New'] as const,
    TEXT_ALIGNMENTS: ['left', 'center', 'right', 'justify'] as const,
    FORMAT_TAGS: {
      bold: 'strong',
      italic: 'em',
      underline: 'u'
    } as const
  },
  VALIDATION: {
    MIN_CONTENT_LENGTH: 0,
    MAX_CONTENT_LENGTH: 50000,
    ALLOWED_PROTOCOLS: ['http:', 'https:', 'mailto:'] as const
  },
  DOM: {
    MAX_TRAVERSAL_DEPTH: 50,
    CACHE_SIZE_LIMIT: 1000
  }
} as const;

// Type exports for configuration values
export type AllowedTag = typeof EDITOR_CONFIG.SECURITY.ALLOWED_TAGS[number];
export type AllowedAttribute = typeof EDITOR_CONFIG.SECURITY.ALLOWED_ATTRIBUTES[number];
export type AllowedProtocol = typeof EDITOR_CONFIG.VALIDATION.ALLOWED_PROTOCOLS[number];

// Format-related exports
export interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: string;
  fontFamily: string;
  textAlign: string;
}

export const DEFAULT_FORMAT_STATE: FormatState = {
  bold: false,
  italic: false,
  underline: false,
  fontSize: EDITOR_CONFIG.FORMAT.DEFAULT_FONT_SIZE,
  fontFamily: EDITOR_CONFIG.FORMAT.DEFAULT_FONT_FAMILY,
  textAlign: EDITOR_CONFIG.FORMAT.DEFAULT_TEXT_ALIGN
} as const;

// Re-export format constants for convenience
export const FONT_SIZES = EDITOR_CONFIG.FORMAT.FONT_SIZES;
export const FONT_FAMILIES = EDITOR_CONFIG.FORMAT.FONT_FAMILIES;
export const TEXT_ALIGNMENTS = EDITOR_CONFIG.FORMAT.TEXT_ALIGNMENTS;
export const FORMAT_TAGS = EDITOR_CONFIG.FORMAT.FORMAT_TAGS;
