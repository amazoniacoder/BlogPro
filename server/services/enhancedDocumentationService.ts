/**
 * Enhanced Documentation Service
 * 
 * Comprehensive service for managing documentation content, sections, and file system integration.
 */

import { pool } from '../db/db';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Section {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  level: number;
  order_index: number;
  icon?: string;
  is_active: boolean;
  library_type?: string;
  children?: Section[];
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  section_id?: string;
  parent_id?: string;
  order_index: number;
  is_published: boolean;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  library_type?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
}

export interface DocumentationFile {
  id: string;
  filename: string;
  filepath: string;
  file_type: string;
  file_size?: number;
  content?: string;
  section_id?: string;
  library_type?: string;
  is_synced: boolean;
  last_modified?: Date;
}

export class EnhancedDocumentationService {
  private readonly DOCS_PATH = path.join(__dirname, '../../client/src/plugins/texteditor/docs');

  // ===== SECTIONS MANAGEMENT =====

  async getSectionsHierarchy(): Promise<Section[]> {
    const query = `
      SELECT * FROM documentation_sections 
      WHERE is_active = true 
      ORDER BY level, order_index, name
    `;
    
    const result = await pool.query(query);
    return this.buildSectionHierarchy(result.rows);
  }

  async getSectionsByLibrary(libraryType: string): Promise<Section[]> {
    const query = `
      SELECT * FROM documentation_sections 
      WHERE library_type = $1 AND is_active = true
      ORDER BY level, order_index, name
    `;
    
    const result = await pool.query(query, [libraryType]);
    return this.buildSectionHierarchy(result.rows);
  }

  async createSection(data: Partial<Section>): Promise<Section> {
    const query = `
      INSERT INTO documentation_sections (name, slug, description, parent_id, level, order_index, icon, library_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const level = data.parent_id ? await this.calculateSectionLevel(data.parent_id) + 1 : 0;
    
    const result = await pool.query(query, [
      data.name,
      data.slug,
      data.description,
      data.parent_id,
      level,
      data.order_index || 0,
      data.icon,
      data.library_type || 'texteditor'
    ]);
    
    return result.rows[0];
  }

  async updateSection(id: string, data: Partial<Section>): Promise<Section> {
    const query = `
      UPDATE documentation_sections 
      SET name = $2, description = $3, icon = $4, order_index = $5, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      id,
      data.name,
      data.description,
      data.icon,
      data.order_index
    ]);
    
    return result.rows[0];
  }

  async deleteSection(id: string): Promise<boolean> {
    const query = `DELETE FROM documentation_sections WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // ===== CONTENT MANAGEMENT =====

  async getContent(): Promise<Content[]> {
    const query = `
      SELECT * FROM documentation_content 
      ORDER BY section_id, order_index, title
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  async getContentByLibrary(libraryType: string): Promise<Content[]> {
    const query = `
      SELECT * FROM documentation_content 
      WHERE library_type = $1 AND is_published = true
      ORDER BY order_index, title
    `;
    
    const result = await pool.query(query, [libraryType]);
    return result.rows;
  }

  async getContentBySlug(slug: string): Promise<Content | null> {
    const query = `SELECT * FROM documentation_content WHERE slug = $1`;
    const result = await pool.query(query, [slug]);
    return result.rows[0] || null;
  }

  async createContent(data: Partial<Content>): Promise<Content> {
    const query = `
      INSERT INTO documentation_content 
      (title, slug, content, excerpt, section_id, parent_id, order_index, is_published, meta_title, meta_description, tags, library_type, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      data.title,
      data.slug,
      data.content,
      data.excerpt,
      data.section_id,
      data.parent_id,
      data.order_index || 0,
      data.is_published || false,
      data.meta_title,
      data.meta_description,
      data.tags,
      data.library_type || 'texteditor',
      data.created_by
    ]);
    
    return result.rows[0];
  }

  async updateContent(id: string, data: Partial<Content>): Promise<Content> {
    const query = `
      UPDATE documentation_content 
      SET title = $2, content = $3, excerpt = $4, section_id = $5, is_published = $6, 
          meta_title = $7, meta_description = $8, tags = $9, updated_by = $10, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      id,
      data.title,
      data.content,
      data.excerpt,
      data.section_id,
      data.is_published,
      data.meta_title,
      data.meta_description,
      data.tags,
      data.updated_by
    ]);
    
    return result.rows[0];
  }

  async deleteContent(id: string): Promise<boolean> {
    const query = `DELETE FROM documentation_content WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // ===== FILE SYSTEM INTEGRATION =====

  async scanDocsDirectory(): Promise<DocumentationFile[]> {
    const files: DocumentationFile[] = [];
    
    try {
      await this.scanDirectoryRecursive(this.DOCS_PATH, '', files);
      
      // Sync with database
      for (const file of files) {
        await this.upsertFile(file);
      }
      
      return files;
    } catch (error) {
      console.error('Error scanning docs directory:', error);
      throw error;
    }
  }

  async getFileContent(filepath: string): Promise<{ content: string; metadata: any }> {
    const fullPath = path.join(this.DOCS_PATH, filepath);
    
    // Security check
    if (!fullPath.startsWith(this.DOCS_PATH)) {
      throw new Error('Invalid file path');
    }
    
    try {
      const content = await fs.readFile(fullPath, 'utf8');
      const stats = await fs.stat(fullPath);
      
      return {
        content,
        metadata: {
          size: stats.size,
          lastModified: stats.mtime,
          type: path.extname(filepath).slice(1)
        }
      };
    } catch (error) {
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateFile(filepath: string, content: string): Promise<void> {
    const fullPath = path.join(this.DOCS_PATH, filepath);
    
    // Security check
    if (!fullPath.startsWith(this.DOCS_PATH)) {
      throw new Error('Invalid file path');
    }
    
    try {
      // Create backup
      const backupPath = `${fullPath}.backup.${Date.now()}`;
      try {
        await fs.copyFile(fullPath, backupPath);
      } catch {
        // Ignore backup errors for new files
      }
      
      // Write new content
      await fs.writeFile(fullPath, content, 'utf8');
      
      // Update database
      await this.updateFileInDatabase(filepath, content);
      
    } catch (error) {
      throw new Error(`Failed to update file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===== SEARCH =====

  async searchContent(query: string, libraryType?: string): Promise<any[]> {
    let searchQuery = `
      SELECT 
        c.id, c.title, c.slug, c.excerpt, c.library_type,
        s.name as section_name,
        ts_rank(si.search_vector, plainto_tsquery('russian', $1)) as rank
      FROM documentation_content c
      LEFT JOIN documentation_sections s ON c.section_id = s.id
      LEFT JOIN documentation_search_index si ON c.id = si.content_id
      WHERE si.search_vector @@ plainto_tsquery('russian', $1)
    `;
    
    const params = [query];
    
    if (libraryType) {
      searchQuery += ` AND c.library_type = $2`;
      params.push(libraryType);
    }
    
    searchQuery += ` ORDER BY rank DESC, c.title LIMIT 50`;
    
    const result = await pool.query(searchQuery, params);
    return result.rows;
  }

  // ===== LIBRARY MANAGEMENT =====

  async getLibraryStats(libraryType: string): Promise<{ sections: number; content: number; published: number }> {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM documentation_sections WHERE library_type = $1 AND is_active = true) as sections,
        (SELECT COUNT(*) FROM documentation_content WHERE library_type = $1) as content,
        (SELECT COUNT(*) FROM documentation_content WHERE library_type = $1 AND is_published = true) as published
    `;
    
    const result = await pool.query(statsQuery, [libraryType]);
    return result.rows[0];
  }

  async getAvailableLibraries(): Promise<string[]> {
    const query = `
      SELECT DISTINCT library_type 
      FROM documentation_content 
      WHERE library_type IS NOT NULL
      ORDER BY library_type
    `;
    
    const result = await pool.query(query);
    return result.rows.map(row => row.library_type);
  }

  // ===== PRIVATE HELPER METHODS =====

  private buildSectionHierarchy(sections: Section[]): Section[] {
    const sectionMap = new Map<string, Section>();
    const rootSections: Section[] = [];
    
    // Create map and initialize children arrays
    sections.forEach(section => {
      section.children = [];
      sectionMap.set(section.id, section);
    });
    
    // Build hierarchy
    sections.forEach(section => {
      if (section.parent_id) {
        const parent = sectionMap.get(section.parent_id);
        if (parent) {
          parent.children!.push(section);
        }
      } else {
        rootSections.push(section);
      }
    });
    
    return rootSections;
  }

  private async calculateSectionLevel(parentId: string): Promise<number> {
    const query = `SELECT level FROM documentation_sections WHERE id = $1`;
    const result = await pool.query(query, [parentId]);
    return result.rows[0]?.level || 0;
  }

  private async scanDirectoryRecursive(dirPath: string, relativePath: string, files: DocumentationFile[]): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativeFilePath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        await this.scanDirectoryRecursive(fullPath, relativeFilePath, files);
      } else {
        const stats = await fs.stat(fullPath);
        const fileType = path.extname(entry.name).slice(1).toLowerCase();
        
        // Only include supported file types
        if (['md', 'txt', 'html', 'pdf', 'doc', 'docx'].includes(fileType)) {
          files.push({
            id: '', // Will be set by database
            filename: entry.name,
            filepath: relativeFilePath.replace(/\\/g, '/'), // Normalize path separators
            file_type: fileType,
            file_size: stats.size,
            is_synced: false,
            last_modified: stats.mtime
          });
        }
      }
    }
  }

  private async upsertFile(file: DocumentationFile): Promise<void> {
    const query = `
      INSERT INTO documentation_files (filename, filepath, file_type, file_size, last_modified)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (filepath) DO UPDATE SET
        filename = EXCLUDED.filename,
        file_type = EXCLUDED.file_type,
        file_size = EXCLUDED.file_size,
        last_modified = EXCLUDED.last_modified,
        updated_at = NOW()
    `;
    
    await pool.query(query, [
      file.filename,
      file.filepath,
      file.file_type,
      file.file_size,
      file.last_modified
    ]);
  }

  private async updateFileInDatabase(filepath: string, content: string): Promise<void> {
    const query = `
      UPDATE documentation_files 
      SET content = $2, is_synced = true, updated_at = NOW()
      WHERE filepath = $1
    `;
    
    await pool.query(query, [filepath, content]);
  }
}

export const enhancedDocumentationService = new EnhancedDocumentationService();