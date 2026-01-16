/**
 * Document Converter Service
 * 
 * Handles conversion between different document formats.
 */

import { pool } from '../db/db';

export interface ConversionResult {
  conversionId: string;
  status: 'pending' | 'completed' | 'failed';
  message?: string;
}

export interface SupportedFormat {
  extension: string;
  name: string;
  mimeType: string;
  canConvertTo: string[];
  canConvertFrom: string[];
}

export class DocumentConverter {
  private readonly supportedFormats: SupportedFormat[] = [
    {
      extension: 'md',
      name: 'Markdown',
      mimeType: 'text/markdown',
      canConvertTo: ['html', 'txt', 'pdf'],
      canConvertFrom: ['txt', 'html']
    },
    {
      extension: 'html',
      name: 'HTML',
      mimeType: 'text/html',
      canConvertTo: ['md', 'txt', 'pdf'],
      canConvertFrom: ['md', 'txt']
    },
    {
      extension: 'txt',
      name: 'Plain Text',
      mimeType: 'text/plain',
      canConvertTo: ['md', 'html', 'pdf'],
      canConvertFrom: ['md', 'html', 'pdf', 'doc', 'docx']
    },
    {
      extension: 'pdf',
      name: 'PDF Document',
      mimeType: 'application/pdf',
      canConvertTo: ['txt', 'md', 'html'],
      canConvertFrom: ['txt', 'md', 'html']
    },
    {
      extension: 'doc',
      name: 'Word Document',
      mimeType: 'application/msword',
      canConvertTo: ['txt', 'md', 'html', 'pdf'],
      canConvertFrom: ['txt', 'md', 'html']
    },
    {
      extension: 'docx',
      name: 'Word Document (Modern)',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      canConvertTo: ['txt', 'md', 'html', 'pdf'],
      canConvertFrom: ['txt', 'md', 'html']
    }
  ];

  /**
   * Get supported formats
   */
  getSupportedFormats(): SupportedFormat[] {
    return this.supportedFormats;
  }

  /**
   * Check if conversion is supported
   */
  isConversionSupported(fromFormat: string, toFormat: string): boolean {
    const format = this.supportedFormats.find(f => f.extension === fromFormat);
    return format ? format.canConvertTo.includes(toFormat) : false;
  }

  /**
   * Convert document
   */
  async convertDocument(
    sourceFileId: string,
    targetFormat: string,
    sourceContent?: string
  ): Promise<ConversionResult> {
    try {
      // Get source file info
      const fileQuery = `SELECT * FROM documentation_files WHERE id = $1`;
      const fileResult = await pool.query(fileQuery, [sourceFileId]);
      
      if (fileResult.rows.length === 0) {
        throw new Error('Source file not found');
      }
      
      const sourceFile = fileResult.rows[0];
      const sourceFormat = sourceFile.file_type;
      
      if (!this.isConversionSupported(sourceFormat, targetFormat)) {
        throw new Error(`Conversion from ${sourceFormat} to ${targetFormat} not supported`);
      }
      
      // Create conversion record
      const conversionId = await this.createConversionRecord(
        sourceFileId,
        sourceFormat,
        targetFormat
      );
      
      // Start conversion process
      this.performConversion(
        conversionId,
        sourceContent || sourceFile.content || '',
        sourceFormat,
        targetFormat
      ).catch(error => {
        console.error('Conversion failed:', error);
        this.updateConversionStatus(conversionId, 'failed', error instanceof Error ? error.message : 'Unknown error');
      });
      
      return {
        conversionId,
        status: 'pending',
        message: 'Conversion started'
      };
    } catch (error) {
      throw new Error(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get conversion status
   */
  async getConversionStatus(conversionId: string): Promise<any> {
    const query = `
      SELECT 
        id,
        source_format,
        target_format,
        conversion_status,
        error_message,
        created_at,
        completed_at
      FROM documentation_conversions 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [conversionId]);
    
    if (result.rows.length === 0) {
      throw new Error('Conversion not found');
    }
    
    return result.rows[0];
  }

  /**
   * Get converted content
   */
  async getConvertedContent(conversionId: string): Promise<string> {
    const query = `
      SELECT converted_content, conversion_status 
      FROM documentation_conversions 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [conversionId]);
    
    if (result.rows.length === 0) {
      throw new Error('Conversion not found');
    }
    
    const conversion = result.rows[0];
    
    if (conversion.conversion_status !== 'completed') {
      throw new Error('Conversion not completed');
    }
    
    return conversion.converted_content;
  }

  /**
   * Perform the actual conversion
   */
  private async performConversion(
    conversionId: string,
    content: string,
    fromFormat: string,
    toFormat: string
  ): Promise<void> {
    try {
      let convertedContent: string;
      
      // Simple text-based conversions for now
      // In production, you would use libraries like:
      // - pdf-parse for PDF extraction
      // - mammoth for DOC/DOCX
      // - marked for Markdown
      // - puppeteer for PDF generation
      
      switch (`${fromFormat}->${toFormat}`) {
        case 'md->html':
          convertedContent = this.markdownToHtml(content);
          break;
        case 'html->md':
          convertedContent = this.htmlToMarkdown(content);
          break;
        case 'txt->md':
          convertedContent = this.textToMarkdown(content);
          break;
        case 'md->txt':
          convertedContent = this.markdownToText(content);
          break;
        case 'html->txt':
          convertedContent = this.htmlToText(content);
          break;
        case 'txt->html':
          convertedContent = this.textToHtml(content);
          break;
        default:
          // For unsupported conversions, return as plain text
          convertedContent = this.stripFormatting(content);
      }
      
      await this.updateConversionResult(conversionId, convertedContent, 'completed');
    } catch (error) {
      await this.updateConversionStatus(conversionId, 'failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Simple conversion methods (basic implementations)
   */
  private markdownToHtml(markdown: string): string {
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>');
  }

  private htmlToMarkdown(html: string): string {
    return html
      .replace(/<h1>(.*?)<\/h1>/gim, '# $1\n')
      .replace(/<h2>(.*?)<\/h2>/gim, '## $1\n')
      .replace(/<h3>(.*?)<\/h3>/gim, '### $1\n')
      .replace(/<strong>(.*?)<\/strong>/gim, '**$1**')
      .replace(/<em>(.*?)<\/em>/gim, '*$1*')
      .replace(/<br\s*\/?>/gim, '\n')
      .replace(/<[^>]*>/gim, '');
  }

  private textToMarkdown(text: string): string {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        if (line.length < 50 && !line.includes('.')) {
          return `## ${line}`;
        }
        return line;
      })
      .join('\n\n');
  }

  private markdownToText(markdown: string): string {
    return markdown
      .replace(/^#+\s*/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  private textToHtml(text: string): string {
    return text
      .split('\n')
      .map(line => `<p>${line}</p>`)
      .join('\n');
  }

  private stripFormatting(content: string): string {
    return content
      .replace(/<[^>]*>/g, '')
      .replace(/[#*_`]/g, '')
      .trim();
  }

  /**
   * Database helper methods
   */
  private async createConversionRecord(
    sourceFileId: string,
    sourceFormat: string,
    targetFormat: string
  ): Promise<string> {
    const query = `
      INSERT INTO documentation_conversions 
      (source_file_id, source_format, target_format)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    
    const result = await pool.query(query, [sourceFileId, sourceFormat, targetFormat]);
    return result.rows[0].id;
  }

  private async updateConversionResult(
    conversionId: string,
    content: string,
    status: string
  ): Promise<void> {
    const query = `
      UPDATE documentation_conversions 
      SET converted_content = $2, conversion_status = $3, completed_at = NOW()
      WHERE id = $1
    `;
    
    await pool.query(query, [conversionId, content, status]);
  }

  private async updateConversionStatus(
    conversionId: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    const query = `
      UPDATE documentation_conversions 
      SET conversion_status = $2, error_message = $3, completed_at = NOW()
      WHERE id = $1
    `;
    
    await pool.query(query, [conversionId, status, errorMessage]);
  }
}

export const documentConverter = new DocumentConverter();