/**
 * Keyboard-related constants
 */

export const KEYBOARD_SHORTCUTS = {
  BOLD: 'b',
  ITALIC: 'i',
  UNDERLINE: 'u',
  SAVE: 's',
  UNDO: 'z',
  REDO: 'y',
  SELECT_ALL: 'a',
  COPY: 'c',
  CUT: 'x',
  PASTE: 'v'
} as const;

export const SPECIAL_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown'
} as const;

export const MODIFIER_KEYS = {
  CTRL: 'ctrlKey',
  ALT: 'altKey',
  SHIFT: 'shiftKey',
  META: 'metaKey'
} as const;
