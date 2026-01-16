# Plugin System Guide

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: December 2024  

## 🎯 Overview

The BlogPro Text Editor plugin system provides a modular architecture for extending editor functionality. All core features (word count, spell check, auto-save, performance monitoring) are now implemented as plugins.

## 🚀 Quick Start

### For Users
The plugin system works automatically. All essential plugins are loaded by default:

```typescript
<ContentEditableEditor
  initialContent="<p>Start typing...</p>"
  onChange={handleChange}
  onSave={handleSave}
  userRole="user" // Gets: word-count, spell-check, auto-save
/>
```

### For Administrators
Administrators get additional plugins and management controls:

```typescript
<ContentEditableEditor
  userRole="admin" // Gets: all plugins + performance monitoring + control panel
  // ... other props
/>
```

**Admin Controls**: Click the 🔌 Plugins button in the editor footer to manage plugins.

## 📋 Built-in Plugins

### 1. Word Count Plugin
**Name**: `word-count`  
**Description**: Real-time word and character counting with reading time estimation

**Configuration**:
```typescript
{
  compact: true,           // Compact display mode
  showWords: true,         // Show word count
  showCharacters: true,    // Show character count  
  showReadingTime: true,   // Show estimated reading time
  showParagraphs: false,   // Show paragraph count
  showSentences: false,    // Show sentence count
  readingSpeed: 200        // Words per minute for reading time
}
```

### 2. Spell Check Plugin
**Name**: `spell-check`  
**Description**: Advanced spell checking with grammar support and language detection

**Configuration**:
```typescript
{
  enabled: true,           // Enable spell checking
  autoDetect: true,        // Auto-detect language
  languages: ['en', 'ru'], // Supported languages
  checkGrammar: false      // Enable grammar checking
}
```

### 3. Auto-Save Plugin
**Name**: `auto-save`  
**Description**: Automatic content saving with configurable intervals

**Configuration**:
```typescript
{
  enabled: true,           // Enable auto-save
  interval: 300000,        // Save interval in milliseconds (5 minutes)
  onSave: async (content) => { /* save logic */ }
}
```

### 4. Performance Monitor Plugin
**Name**: `performance-monitor`  
**Description**: Performance monitoring and analytics (Administrator only)

**Configuration**:
```typescript
{
  userRole: 'admin',       // Required: admin role
  showButton: true,        // Show analytics button
  autoOpen: false          // Auto-open dashboard
}
```

## 🔧 Plugin Management

### Administrator Panel
Administrators can manage plugins through the control panel:

1. **Access**: Click 🔌 Plugins button in editor footer
2. **Toggle**: Enable/disable individual plugins
3. **Configure**: Click ⚙️ to configure plugin settings
4. **Export**: Export plugin settings for backup
5. **Monitor**: View plugin status and health

### Plugin Settings
Each plugin has configurable settings accessible to administrators:

- **Word Count**: Display options, reading speed
- **Spell Check**: Language settings, grammar checking
- **Auto-Save**: Save intervals, enable/disable
- **Performance**: Dashboard options (admin only)

### Settings Persistence
Plugin settings are automatically saved to localStorage and persist across sessions.

## 🛠️ Developer Guide

### Creating Custom Plugins

1. **Extend ComponentPlugin**:
```typescript
import { ComponentPlugin } from '../core/ComponentPlugin';

export class MyCustomPlugin extends ComponentPlugin {
  readonly name = 'my-plugin';
  readonly version = '1.0.0';
  readonly description = 'My custom plugin';

  protected async onInitialize(): Promise<void> {
    // Plugin initialization logic
    await this.renderComponent(MyComponent, {
      // Component props
    });
  }

  onContentChange(content: string): void {
    // Handle content changes
  }
}
```

2. **Register Plugin**:
```typescript
PluginRegistry.register(new MyCustomPlugin());
await PluginRegistry.initialize('my-plugin', config);
```

### Plugin Lifecycle
- **Registration**: `PluginRegistry.register(plugin)`
- **Initialization**: `PluginRegistry.initialize(name, config)`
- **Content Updates**: `plugin.onContentChange(content)`
- **Destruction**: `PluginRegistry.destroy(name)`

### Error Handling
Plugins are isolated with error boundaries. Plugin failures don't crash the editor:

```typescript
try {
  await PluginRegistry.initialize('my-plugin');
} catch (error) {
  console.error('Plugin failed to initialize:', error);
  // Editor continues to work
}
```

## 📊 Plugin Architecture

### System Overview
```
┌─────────────────────────────────────────┐
│            Plugin System                │
├─────────────────────────────────────────┤
│  🔌 PluginRegistry: Lifecycle Management│
├─────────────────────────────────────────┤
│  ⚙️  PluginSettings: Configuration      │
├─────────────────────────────────────────┤
│  🎛️  PluginControlPanel: Admin UI       │
├─────────────────────────────────────────┤
│  📦 ComponentPlugin: React Integration  │
├─────────────────────────────────────────┤
│  🔧 Built-in Plugins: Core Features     │
└─────────────────────────────────────────┘
```

### Plugin Loading Strategy
- **Essential Plugins**: Always loaded (word-count, spell-check, auto-save)
- **Role-based Plugins**: Loaded based on user role (performance-monitor for admin)
- **Lazy Loading**: Plugins loaded on-demand to optimize performance
- **Error Isolation**: Plugin failures don't affect other plugins or editor

## 🔒 Security & Permissions

### Role-based Access
- **User Role**: Gets essential plugins (word-count, spell-check, auto-save)
- **Admin Role**: Gets all plugins + performance monitoring + management controls

### Plugin Isolation
- Each plugin runs in isolation with error boundaries
- Plugin failures are contained and logged
- Editor continues to function even if plugins fail

## 📈 Performance

### Optimization Features
- **Lazy Loading**: Heavy components loaded on-demand
- **Component Reuse**: Existing components wrapped as plugins
- **Memory Management**: Proper cleanup on plugin destruction
- **Minimal Overhead**: Plugin system adds <5% performance overhead

### Monitoring
- Real-time plugin status monitoring
- Performance metrics collection
- Error tracking and reporting
- Memory usage monitoring

## 🧪 Testing

### Plugin Testing
```bash
# Run plugin system tests
npm test -- PluginSystemIntegration.test.ts

# Test individual plugins
npm test -- WordCountPlugin.test.tsx
npm test -- SpellCheckPlugin.test.tsx
```

### Test Coverage
- Plugin registration and lifecycle
- Configuration management
- Error handling and recovery
- Role-based access control
- Settings persistence

## 🔄 Migration from Hardcoded Components

The plugin system maintains 100% backward compatibility:

### Before (Hardcoded)
```typescript
// Components were hardcoded in ContentEditableEditor
<WordCount content={content} />
<SpellCheckManager enabled={true} />
<AutoSaveManager onSave={onSave} />
```

### After (Plugin-based)
```typescript
// Same functionality, now modular and configurable
// Plugins automatically loaded based on user role
// No code changes required for existing usage
```

## 📚 API Reference

### PluginRegistry
- `register(plugin)` - Register a plugin
- `initialize(name, config)` - Initialize plugin with config
- `destroy(name)` - Destroy plugin
- `isInitialized(name)` - Check if plugin is active
- `getRegisteredPlugins()` - Get all registered plugins

### PluginSettings
- `save(name, enabled, config)` - Save plugin settings
- `load(name)` - Load plugin settings
- `isEnabled(name)` - Check if plugin is enabled
- `toggle(name)` - Toggle plugin enabled state
- `export()` - Export all settings
- `import(data)` - Import settings from backup

### ComponentPlugin
- `renderComponent(Component, props)` - Render React component
- `updateComponent(Component, props)` - Update component props
- `onContentChange(content)` - Handle content changes
- `updateConfig(config)` - Update plugin configuration

---

**Next Steps**: The plugin system is production-ready. Consider adding custom plugins for specific business requirements.