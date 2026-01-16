/**
 * Documentation-specific type definitions
 * Covers file types, content structures, and export formats
 */

export type FileType = 'html' | 'markdown' | 'json' | 'css' | 'javascript' | 'typescript' | 'image' | 'text';

export interface DocumentFile {
  readonly path: string;
  readonly name: string;
  readonly type: FileType;
  readonly size: number;
  readonly lastModified: Date;
  readonly content?: string;
  readonly isEditable: boolean;
}

export interface DirectoryNode {
  readonly path: string;
  readonly name: string;
  readonly isDirectory: boolean;
  readonly children?: DirectoryNode[];
  readonly files?: DocumentFile[];
}

export interface DirectoryStructure {
  readonly root: DirectoryNode;
  readonly totalFiles: number;
  readonly totalDirectories: number;
  readonly supportedFiles: number;
  readonly lastScanned: Date;
}

export interface DocumentContent {
  readonly title: string;
  readonly description: string;
  readonly sections: ContentSection[];
  readonly metadata: DocumentMetadata;
}

export interface ContentSection {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly type: SectionType;
  readonly level: number;
  readonly subsections?: ContentSection[];
}

export type SectionType = 'heading' | 'paragraph' | 'code' | 'list' | 'table' | 'image' | 'alert';

export interface DocumentMetadata {
  readonly title: string;
  readonly description: string;
  readonly author: string;
  readonly created: Date;
  readonly lastModified: Date;
  readonly tags: string[];
  readonly category: string;
  readonly version: string;
}

export interface ExportFormat {
  readonly id: string;
  readonly name: string;
  readonly extension: string;
  readonly mimeType: string;
  readonly aiOptimized: boolean;
}

export interface ExportOptions {
  readonly format: ExportFormat;
  readonly includeMetadata: boolean;
  readonly includeImages: boolean;
  readonly preserveStructure: boolean;
  readonly aiEnhanced: boolean;
}

export interface ExportResult {
  readonly success: boolean;
  readonly content: string;
  readonly format: string;
  readonly metadata: DocumentMetadata;
  readonly warnings: string[];
  readonly errors: string[];
}

export interface AIExportFormat {
  readonly format: 'structured-markdown' | 'json-ld' | 'semantic-xml' | 'plain-text';
  readonly includeSchema: boolean;
  readonly includeRelationships: boolean;
  readonly includeCodeExamples: boolean;
}

export interface CodeExample {
  readonly language: string;
  readonly code: string;
  readonly description: string;
  readonly context: string;
}

export interface DocumentRelationship {
  readonly type: 'related' | 'dependency' | 'reference';
  readonly targetPath: string;
  readonly description: string;
}

export interface SearchResult {
  readonly file: DocumentFile;
  readonly matches: SearchMatch[];
  readonly score: number;
}

export interface SearchMatch {
  readonly text: string;
  readonly context: string;
  readonly line: number;
  readonly column: number;
}
