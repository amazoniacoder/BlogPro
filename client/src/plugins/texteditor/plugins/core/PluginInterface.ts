/**
 * Plugin Interface for Text Editor
 */

export interface EditorInstance {
  getContent(): string;
  setContent(content: string): void;
  insertText(text: string): void;
  getSelection(): Selection | null;
  focus(): void;
  addEventListener(event: string, handler: Function): void;
  removeEventListener(event: string, handler: Function): void;
  getElement?(): HTMLElement | null;
}

export interface PluginConfig {
  [key: string]: any;
}

export interface IEditorPlugin {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly dependencies?: string[];
  
  initialize(editor: EditorInstance, config?: PluginConfig): Promise<void>;
  destroy(): Promise<void>;
  
  // Optional lifecycle methods
  onContentChange?(content: string): void;
  onSelectionChange?(selection: Selection | null): void;
  onFocus?(): void;
  onBlur?(): void;
}

export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
  config?: PluginConfig;
}

export abstract class BasePlugin implements IEditorPlugin {
  abstract readonly name: string;
  abstract readonly version: string;
  readonly description?: string;
  readonly dependencies?: string[] = [];
  
  protected editor?: EditorInstance;
  protected config?: PluginConfig;
  
  async initialize(editor: EditorInstance, config?: PluginConfig): Promise<void> {
    this.editor = editor;
    this.config = config;
    await this.onInitialize();
  }
  
  async destroy(): Promise<void> {
    await this.onDestroy();
    this.editor = undefined;
    this.config = undefined;
  }
  
  protected abstract onInitialize(): Promise<void>;
  protected abstract onDestroy(): Promise<void>;
  
  protected getEditor(): EditorInstance {
    if (!this.editor) {
      // Return a mock editor to prevent crashes
      return {
        getContent: () => '',
        setContent: () => {},
        insertText: () => {},
        getSelection: () => null,
        focus: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        getElement: () => null
      };
    }
    return this.editor;
  }
}
