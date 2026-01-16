/**
 * File System Service for Documentation Manager
 * Handles all file operations within the docs directory
 * Max 400 lines, strict TypeScript compliance
 */

import { 
  FileSystemAPI
} from '../types/TextEditorPlugin';
import { 
  DocumentFile, 
  DirectoryStructure
} from '../types/Documentation';
import {
  FileOperationResult,
  FileTemplate
} from '../types/FileSystem';

export class FileSystemService {
  private readonly DOCS_PATH = 'D:/BlogPro/client/src/plugins/texteditor/docs';
  private readonly SUPPORTED_EXTENSIONS = ['.html', '.md', '.json', '.css', '.js', '.ts', '.txt'];
  
  constructor(private readonly fileSystemAPI: FileSystemAPI) {}

  /**
   * Scan entire docs directory and build structure tree
   */
  async scanDocsDirectory(): Promise<DirectoryStructure> {
    try {
      // Fetch sections from database API
      const response = await fetch('/api/documentation/sections');
      if (!response.ok) {
        throw new Error('Failed to fetch sections from database');
      }
      
      const sections = await response.json();
      return this.convertSectionsToDirectoryStructure(sections);
    } catch (error) {
      console.warn('Database API unavailable, using fallback structure:', error);
      return this.getFallbackStructure();
    }
  }

  /**
   * Read and parse documentation file with metadata
   */
  async readDocumentationFile(contentId: string): Promise<DocumentFile> {
    try {
      // Try database first
      const response = await fetch(`/api/documentation/content/${contentId}`);
      if (response.ok) {
        const content = await response.json();
        return {
          path: content.slug,
          name: content.title,
          type: content.content_type || 'markdown',
          size: content.content.length,
          lastModified: new Date(content.updated_at),
          content: content.content,
          isEditable: true
        };
      }
    } catch (error) {
      console.warn('Database content lookup failed:', error);
    }
    
    // Fallback to mock content
    const mockContent = `# ${contentId}

This is mock documentation content.

## Features
- Feature 1
- Feature 2
- Feature 3

## Usage
\`\`\`typescript
const example = 'Hello World';
console.log(example);
\`\`\`

## Documentation
This file contains documentation for the BlogPro Text Editor plugin system.`;
    
    return {
      path: contentId,
      name: contentId,
      type: 'markdown',
      size: mockContent.length,
      lastModified: new Date(),
      content: mockContent,
      isEditable: true
    };
  }

  /**
   * Write content to documentation file with backup
   */
  async writeDocumentationFile(
    contentId: string, 
    content: string,
    metadata?: any
  ): Promise<FileOperationResult> {
    try {
      // Save to database
      const response = await fetch(`/api/documentation/content/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title: metadata?.title,
          content_type: metadata?.content_type || 'markdown',
          is_published: metadata?.is_published || false
        })
      });
      
      if (response.ok) {
        return {
          success: true,
          path: contentId,
          message: 'Content saved to database successfully'
        };
      }
      
      throw new Error(`Database save failed: ${response.statusText}`);
    } catch (error) {
      console.error('Database save failed:', error);
      return {
        success: false,
        path: contentId,
        error: error as Error
      };
    }
  }

  /**
   * Create new file from template
   */
  async createFile(
    dirPath: string, 
    fileName: string, 
    template?: string
  ): Promise<string> {
    const fullPath = `${dirPath}/${fileName}`;
    
    if (await this.fileSystemAPI.exists(fullPath)) {
      throw new Error(`File ${fileName} already exists`);
    }

    const content = template || this.getDefaultTemplate(fileName);
    await this.fileSystemAPI.writeFile(fullPath, content, 'utf8');
    
    return fullPath;
  }

  /**
   * Create new directory
   */
  async createDirectory(path: string): Promise<FileOperationResult> {
    try {
      await this.fileSystemAPI.createDirectory(path);
      return {
        success: true,
        path,
        message: 'Directory created successfully'
      };
    } catch (error) {
      return {
        success: false,
        path,
        error: error as Error
      };
    }
  }

  /**
   * Delete file with confirmation
   */
  async deleteFile(filePath: string): Promise<FileOperationResult> {
    try {
      await this.createBackup(filePath);
      await this.fileSystemAPI.deleteFile(filePath);
      
      return {
        success: true,
        path: filePath,
        message: 'File deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        path: filePath,
        error: error as Error
      };
    }
  }

  /**
   * Get available file templates
   */
  getFileTemplates(): FileTemplate[] {
    return [
      {
        name: 'HTML Documentation',
        extension: '.html',
        content: this.getHTMLTemplate(),
        description: 'Standard HTML documentation page',
        category: 'html'
      },
      {
        name: 'Markdown Guide',
        extension: '.md',
        content: this.getMarkdownTemplate(),
        description: 'Markdown documentation file',
        category: 'markdown'
      },
      {
        name: 'API Reference',
        extension: '.json',
        content: this.getJSONTemplate(),
        description: 'JSON API reference structure',
        category: 'json'
      }
    ];
  }

  /**
   * Watch directory for changes
   */
  watchDirectory(
    path: string, 
    callback: (event: { type: string; path: string }) => void
  ) {
    return this.fileSystemAPI.watch(path, (event) => {
      if (this.isRelevantFile(event.path)) {
        callback({
          type: event.type,
          path: event.path
        });
      }
    });
  }

  // Private helper methods

  private isRelevantFile(filePath: string): boolean {
    return this.SUPPORTED_EXTENSIONS.some(ext => 
      filePath.toLowerCase().endsWith(ext)
    );
  }

  private extractFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath.split('\\').pop() || '';
  }

  private getFileExtension(filePath: string): string {
    const name = this.extractFileName(filePath);
    const lastDot = name.lastIndexOf('.');
    return lastDot > 0 ? name.substring(lastDot) : '';
  }



  private async createBackup(filePath: string): Promise<void> {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    const content = await this.fileSystemAPI.readFile(filePath, 'utf8');
    await this.fileSystemAPI.writeFile(backupPath, content, 'utf8');
  }

  private getDefaultTemplate(fileName: string): string {
    const ext = this.getFileExtension(fileName);
    switch (ext) {
      case '.html': return this.getHTMLTemplate();
      case '.md': return this.getMarkdownTemplate();
      case '.json': return this.getJSONTemplate();
      default: return '// New file\n';
    }
  }

  private getHTMLTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Documentation</title>
</head>
<body>
    <h1>New Documentation</h1>
    <p>Add your content here...</p>
</body>
</html>`;
  }

  private getMarkdownTemplate(): string {
    return `# New Documentation

## Overview

Add your content here...

## Examples

\`\`\`javascript
// Code example
console.log('Hello World');
\`\`\`

## References

- [Link 1](#)
- [Link 2](#)
`;
  }

  private getJSONTemplate(): string {
    return `{
  "title": "New Documentation",
  "description": "Add description here",
  "version": "1.0.0",
  "sections": []
}`;
  }

  /**
   * Convert database sections to directory structure
   */
  private convertSectionsToDirectoryStructure(sections: any[]): DirectoryStructure {
    const convertSection = (section: any): any => {
      return {
        path: section.slug,
        name: section.name,
        isDirectory: true,
        children: section.children ? section.children.map(convertSection) : [],
        files: []
      };
    };

    return {
      root: {
        path: 'documentation',
        name: 'Documentation',
        isDirectory: true,
        children: sections.map(convertSection),
        files: []
      },
      totalFiles: 0,
      totalDirectories: sections.length,
      supportedFiles: 0,
      lastScanned: new Date()
    };
  }

  /**
   * Get fallback structure when database is unavailable
   */
  private getFallbackStructure(): DirectoryStructure {
    return {
      root: {
        path: this.DOCS_PATH,
        name: 'docs',
        isDirectory: true,
        children: [
          {
            path: 'getting-started',
            name: 'Getting Started',
            isDirectory: true,
            children: [],
            files: []
          }
        ],
        files: []
      },
      totalFiles: 0,
      totalDirectories: 1,
      supportedFiles: 0,
      lastScanned: new Date()
    };
  }

  /**
   * Create new content in database
   */
  async createContent(sectionId: string, title: string, content: string): Promise<string> {
    try {
      const response = await fetch('/api/documentation/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          section_id: sectionId,
          content_type: 'markdown',
          is_published: false
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.id.toString();
      }
      
      throw new Error('Failed to create content');
    } catch (error) {
      console.error('Content creation failed:', error);
      throw error;
    }
  }
}
