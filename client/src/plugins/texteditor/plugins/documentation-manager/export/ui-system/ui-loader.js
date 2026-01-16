/**
 * BlogPro UI System Loader
 * Generated for plugin: documentation-manager
 */

export const loadUISystem = () => {
  return {
    // CSS Bundle
    styles: () => import('./ui-system.css'),
    
    // Icon Sprite
    icons: () => import('./icons.svg'),
    
    // Component Dependencies
    components: {
      button: () => import('./components/button'),
      form: () => import('./components/form'),
      card: () => import('./components/card'),
      modal: () => import('./components/modal')
    },
    
    // Token Dependencies
    tokens: {
      colors: () => import('./tokens/colors.css'),
      spacing: () => import('./tokens/spacing.css'),
      typography: () => import('./tokens/typography.css'),
      effects: () => import('./tokens/effects.css')
    }
  };
};

// Plugin Metadata
export const pluginInfo = {
  name: 'documentation-manager',
  version: '1.0.0',
  uiSystemVersion: '^1.0.0',
  bundleSize: 9117
};
