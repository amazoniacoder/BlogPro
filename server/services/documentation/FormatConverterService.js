/**
 * Format Converter Service
 * Handles content conversion between different formats
 */

const marked = require('marked');
const TurndownService = require('turndown');
const puppeteer = require('puppeteer');
const ContentService = require('./ContentService');

class FormatConverterService {
  constructor() {
    this.contentService = new ContentService();
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
  }

  /**
   * Convert content to specified format
   */
  async convertContent(contentId, targetFormat) {
    const content = await this.contentService.getContent(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    switch (targetFormat.toLowerCase()) {
      case 'html':
        return this.toHtml(content);
      case 'markdown':
        return this.toMarkdown(content);
      case 'json':
        return this.toJson(content);
      case 'pdf':
        return this.toPdf(content);
      case 'txt':
        return this.toText(content);
      default:
        throw new Error(`Unsupported format: ${targetFormat}`);
    }
  }

  /**
   * Convert to HTML
   */
  toHtml(content) {
    let html = content.content;
    
    if (content.content_type === 'markdown') {
      html = marked.parse(content.content);
    }
    
    return {
      content: this.wrapInHtmlDocument(html, content.title),
      filename: `${content.slug}.html`,
      mimeType: 'text/html'
    };
  }

  /**
   * Convert to Markdown
   */
  toMarkdown(content) {
    let markdown = content.content;
    
    if (content.content_type === 'html') {
      markdown = this.turndownService.turndown(content.content);
    }
    
    return {
      content: this.addMarkdownMetadata(markdown, content),
      filename: `${content.slug}.md`,
      mimeType: 'text/markdown'
    };
  }

  /**
   * Convert to JSON
   */
  toJson(content) {
    const jsonData = {
      id: content.id,
      title: content.title,
      slug: content.slug,
      content: content.content,
      content_type: content.content_type,
      excerpt: content.excerpt,
      section: {
        id: content.section_id,
        name: content.section_name
      },
      metadata: {
        tags: content.tags || [],
        meta_title: content.meta_title,
        meta_description: content.meta_description,
        created_at: content.created_at,
        updated_at: content.updated_at,
        created_by: content.created_by_name
      }
    };
    
    return {
      content: JSON.stringify(jsonData, null, 2),
      filename: `${content.slug}.json`,
      mimeType: 'application/json'
    };
  }

  /**
   * Convert to PDF
   */
  async toPdf(content) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Convert content to HTML if needed
      let html = content.content;
      if (content.content_type === 'markdown') {
        html = marked.parse(content.content);
      }
      
      // Create full HTML document with styling
      const fullHtml = this.createPdfHtml(html, content.title);
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true
      });
      
      return {
        content: pdf,
        filename: `${content.slug}.pdf`,
        mimeType: 'application/pdf'
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Convert to plain text
   */
  toText(content) {
    let text = content.content;
    
    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Convert markdown to plain text
    if (content.content_type === 'markdown') {
      text = text
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/`(.*?)`/g, '$1') // Remove code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links
    }
    
    return {
      content: `${content.title}\n${'='.repeat(content.title.length)}\n\n${text}`,
      filename: `${content.slug}.txt`,
      mimeType: 'text/plain'
    };
  }

  /**
   * Wrap content in full HTML document
   */
  wrapInHtmlDocument(content, title) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3, h4, h5, h6 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
  }

  /**
   * Add metadata to markdown content
   */
  addMarkdownMetadata(content, metadata) {
    const frontMatter = `---
title: ${metadata.title}
slug: ${metadata.slug}
section: ${metadata.section_name || ''}
tags: ${(metadata.tags || []).join(', ')}
created: ${metadata.created_at}
updated: ${metadata.updated_at}
---

`;
    return frontMatter + content;
  }

  /**
   * Create styled HTML for PDF generation
   */
  createPdfHtml(content, title) {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #333; }
        h1 { font-size: 18pt; margin-bottom: 20pt; border-bottom: 2pt solid #333; }
        h2 { font-size: 16pt; margin-top: 20pt; margin-bottom: 10pt; }
        h3 { font-size: 14pt; margin-top: 15pt; margin-bottom: 8pt; }
        p { margin-bottom: 10pt; text-align: justify; }
        code { font-family: 'Courier New', monospace; background: #f5f5f5; padding: 2pt; }
        pre { background: #f5f5f5; padding: 10pt; border: 1pt solid #ddd; font-family: 'Courier New', monospace; }
        blockquote { border-left: 3pt solid #ccc; margin-left: 0; padding-left: 15pt; color: #666; }
        table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
        th, td { border: 1pt solid #ddd; padding: 8pt; text-align: left; }
        th { background-color: #f5f5f5; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${content}
</body>
</html>`;
  }
}

module.exports = FormatConverterService;