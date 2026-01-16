import { useState } from 'react';
import { Product } from '../../../shared/types/product';
import { ProductExportService } from '../services/export/ProductExportService';
import { CatalogExportService } from '../services/export/CatalogExportService';

export const useProductExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportProduct = async (product: Product, format: 'pdf' | 'json' | 'markdown') => {
    setIsExporting(true);
    setError(null);
    
    try {
      switch (format) {
        case 'pdf':
          await ProductExportService.exportToPDF(product);
          break;
        case 'json':
          await ProductExportService.exportToJSON(product);
          break;
        case 'markdown':
          await ProductExportService.exportToMarkdown(product);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      throw err;
    } finally {
      setIsExporting(false);
    }
  };

  const exportCatalog = async (products: Product[], format: 'csv' | 'json' | 'xlsx') => {
    setIsExporting(true);
    setError(null);
    
    try {
      switch (format) {
        case 'csv':
          await CatalogExportService.exportToCSV(products);
          break;
        case 'json':
          await CatalogExportService.exportToJSON(products);
          break;
        case 'xlsx':
          await CatalogExportService.exportToExcel(products);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      throw err;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    error,
    exportProduct,
    exportCatalog
  };
};
