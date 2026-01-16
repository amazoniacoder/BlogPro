import { Product } from '../../../../shared/types/product';

export class ProductExportService {
  static async exportToPDF(product: Product): Promise<void> {
    const content = this.generatePDFContent(product);
    this.downloadFile(content, `${product.slug}.pdf`, 'application/pdf');
  }

  static async exportToJSON(product: Product): Promise<void> {
    const content = JSON.stringify(product, null, 2);
    this.downloadFile(content, `${product.slug}.json`, 'application/json');
  }

  static async exportToMarkdown(product: Product): Promise<void> {
    const content = this.generateMarkdownContent(product);
    this.downloadFile(content, `${product.slug}.md`, 'text/markdown');
  }

  private static generatePDFContent(product: Product): string {
    return `# ${product.title}\n\n${product.description}\n\n${product.content}`;
  }

  private static generateMarkdownContent(product: Product): string {
    let md = `# ${product.title}\n\n`;
    md += `${product.description}\n\n`;
    if (product.price) md += `**Price:** $${product.price}\n\n`;
    if (product.features.length) {
      md += `## Features\n${product.features.map(f => `- ${f}`).join('\n')}\n\n`;
    }
    md += `## Details\n${product.content}`;
    return md;
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
