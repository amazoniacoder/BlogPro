import { Product } from '../../../../shared/types/product';

export class CatalogExportService {
  static async exportToCSV(products: Product[]): Promise<void> {
    const csv = this.generateCSV(products);
    this.downloadFile(csv, 'product-catalog.csv', 'text/csv');
  }

  static async exportToJSON(products: Product[]): Promise<void> {
    const json = JSON.stringify(products, null, 2);
    this.downloadFile(json, 'product-catalog.json', 'application/json');
  }

  static async exportToExcel(products: Product[]): Promise<void> {
    const csv = this.generateCSV(products);
    this.downloadFile(csv, 'product-catalog.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  private static generateCSV(products: Product[]): string {
    const headers = ['Title', 'Description', 'Category', 'Price', 'Features', 'Active'];
    const rows = products.map(p => [
      p.title,
      p.description,
      p.category?.name || '',
      p.price?.toString() || '',
      p.features.join('; '),
      p.isActive.toString()
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
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
