// WebSocket events for Footer Editor
export const FOOTER_EVENTS = {
  CONFIG_UPDATED: 'footer:config_updated',
  PREVIEW_UPDATED: 'footer:preview_updated',
  BLOCK_ADDED: 'footer:block_added',
  BLOCK_UPDATED: 'footer:block_updated',
  BLOCK_DELETED: 'footer:block_deleted',
  STYLE_UPDATED: 'footer:style_updated'
} as const;

export type FooterEventType = typeof FOOTER_EVENTS[keyof typeof FOOTER_EVENTS];