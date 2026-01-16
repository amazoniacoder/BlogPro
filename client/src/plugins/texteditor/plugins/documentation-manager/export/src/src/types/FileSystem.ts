/**
 * File system operation types and interfaces
 * Handles directory scanning, file operations, and watching
 */

import { DirectoryNode, DocumentFile } from './Documentation';
import { FileWatcher } from './TextEditorPlugin';

export interface FileSystemService {
  scanDocsDirectory(): Promise<DirectoryNode>;
  readDocumentationFile(filePath: string): Promise<DocumentFile>;
  writeDocumentationFile(filePath: string, content: string): Promise<void>;
  createFile(dirPath: string, fileName: string, template?: string): Promise<string>;
  createDirectory(path: string): Promise<void>;
  deleteFile(filePath: string): Promise<void>;
  deleteDirectory(dirPath: string): Promise<void>;
  moveFile(sourcePath: string, targetPath: string): Promise<void>;
  copyFile(sourcePath: string, targetPath: string): Promise<void>;
  watchDirectory(path: string, callback: FileChangeCallback): FileWatcher;
}

export type FileChangeCallback = (event: FileChangeEvent) => void;

export interface FileChangeEvent {
  readonly type: 'created' | 'modified' | 'deleted' | 'renamed';
  readonly path: string;
  readonly oldPath?: string;
  readonly timestamp: Date;
}

export interface FileOperationResult {
  readonly success: boolean;
  readonly path: string;
  readonly message?: string;
  readonly error?: Error;
}

export interface DirectoryStructure {
  readonly root: DirectoryNode;
  readonly totalFiles: number;
  readonly totalDirectories: number;
  readonly supportedFiles: number;
  readonly lastScanned: Date;
}

export interface FileTemplate {
  readonly name: string;
  readonly extension: string;
  readonly content: string;
  readonly description: string;
  readonly category: 'html' | 'markdown' | 'json' | 'config';
}

export interface BackupInfo {
  readonly originalPath: string;
  readonly backupPath: string;
  readonly timestamp: Date;
  readonly size: number;
}

export interface FileValidationResult {
  readonly isValid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
}

export interface ValidationError {
  readonly line: number;
  readonly column: number;
  readonly message: string;
  readonly severity: 'error' | 'warning';
}

export interface ValidationWarning {
  readonly line: number;
  readonly column: number;
  readonly message: string;
  readonly suggestion?: string;
}

export interface FileMetrics {
  readonly lineCount: number;
  readonly characterCount: number;
  readonly wordCount: number;
  readonly codeBlocks: number;
  readonly images: number;
  readonly links: number;
}
