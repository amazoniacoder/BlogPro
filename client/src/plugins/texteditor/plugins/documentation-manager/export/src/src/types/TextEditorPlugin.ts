/**
 * TypeScript definitions for BlogPro Text Editor Plugin API
 * Strict typing for plugin integration and file system operations
 */

export interface TextEditorPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  activate(context: PluginContext): Promise<void>;
  deactivate(): Promise<void>;
}

export interface PluginContext {
  readonly pluginId: string;
  readonly workspacePath: string;
  readonly user: UserInfo;
  registerFooterButton(config: FooterButtonConfig): void;
  registerShortcut(shortcut: string, callback: () => void): void;
  openWindow(config: WindowConfig): Promise<PluginWindow>;
  readonly fileSystem: FileSystemAPI;
  readonly events: EventEmitter;
}

export interface FooterButtonConfig {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly onClick: () => void;
  readonly tooltip?: string;
}

export interface WindowConfig {
  readonly title: string;
  readonly width: number;
  readonly height: number;
  readonly resizable?: boolean;
  readonly component: React.ComponentType;
}

export interface PluginWindow {
  readonly id: string;
  close(): void;
  focus(): void;
  setTitle(title: string): void;
}

export interface FileSystemAPI {
  readFile(path: string, encoding?: string): Promise<string>;
  writeFile(path: string, content: string, encoding?: string): Promise<void>;
  readDirectory(path: string, options?: ReadDirOptions): Promise<DirectoryEntry[]>;
  createDirectory(path: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  deleteDirectory(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  stat(path: string): Promise<FileStats>;
  watch(path: string, callback: (event: FileWatchEvent) => void): FileWatcher;
}

export interface ReadDirOptions {
  readonly recursive?: boolean;
  readonly includeHidden?: boolean;
  readonly filter?: (entry: DirectoryEntry) => boolean;
}

export interface DirectoryEntry {
  readonly name: string;
  readonly path: string;
  readonly isDirectory: boolean;
  readonly isFile: boolean;
  readonly size?: number;
  readonly lastModified?: Date;
}

export interface FileStats {
  readonly size: number;
  readonly isDirectory: boolean;
  readonly isFile: boolean;
  readonly lastModified: Date;
  readonly created: Date;
}

export interface FileWatchEvent {
  readonly type: 'created' | 'modified' | 'deleted';
  readonly path: string;
}

export interface FileWatcher {
  close(): void;
}

export interface EventEmitter {
  on(event: string, callback: (...args: unknown[]) => void): void;
  off(event: string, callback: (...args: unknown[]) => void): void;
  emit(event: string, ...args: unknown[]): void;
}

export interface UserInfo {
  readonly id: string;
  readonly username: string;
  readonly role: 'admin' | 'editor' | 'viewer';
  hasPermission(permission: string): boolean;
}
