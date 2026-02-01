import React, { useState } from 'react';
import { Product } from '../../../../shared/types/product';
import { ProductCategory } from '../../../../shared/types/product-category';
import { ProductExportService } from '@/services/export/ProductExportService';
import { CatalogExportService } from '@/services/export/CatalogExportService';
import { Icon } from '../icons/components';
import { Button } from '../components/button';

interface ProductExportMenuProps {
  product?: Product;
  products?: Product[];
  categories?: ProductCategory[];
  type: 'single' | 'catalog';
}

export const ProductExportMenu: React.FC<ProductExportMenuProps> = ({
  product,
  products = [],
  categories = [],
  type
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeImages: true,
    includeFeatures: true,
    includePrice: true,
    categoryFilter: ''
  });

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      if (type === 'single' && product) {
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
      } else {
        switch (format) {
          case 'csv':
            await CatalogExportService.exportToCSV(products);
            break;
          case 'xlsx':
            await CatalogExportService.exportToExcel(products);
            break;
          case 'json':
            await CatalogExportService.exportToJSON(products);
            break;
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const singleFormats = [
    { format: 'pdf', label: 'PDF Document', icon: 'file' },
    { format: 'markdown', label: 'Markdown', icon: 'file' },
    { format: 'json', label: 'JSON Data', icon: 'file' }
  ];

  const catalogFormats = [
    { format: 'csv', label: 'CSV Data', icon: 'table' },
    { format: 'xlsx', label: 'Excel Spreadsheet', icon: 'table' },
    { format: 'json', label: 'JSON Data', icon: 'file' }
  ];

  const formats = type === 'single' ? singleFormats : catalogFormats;

  return (
    <div className="product-export-menu">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
      >
        <Icon name="download" size={16} />
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>

      {isOpen && (
        <div className="product-export-menu__dropdown">
          <div className="product-export-menu__header">
            <h4>Export Options</h4>
            <button
              className="product-export-menu__close"
              onClick={() => setIsOpen(false)}
            >
              <Icon name="x" size={16} />
            </button>
          </div>

          <div className="product-export-menu__options">
            <label className="product-export-menu__option">
              <input
                type="checkbox"
                checked={exportOptions.includeImages}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
              />
              Include Images
            </label>

            <label className="product-export-menu__option">
              <input
                type="checkbox"
                checked={exportOptions.includeFeatures}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeFeatures: e.target.checked }))}
              />
              Include Features
            </label>

            <label className="product-export-menu__option">
              <input
                type="checkbox"
                checked={exportOptions.includePrice}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includePrice: e.target.checked }))}
              />
              Include Price
            </label>

            {type === 'catalog' && categories.length > 0 && (
              <div className="product-export-menu__option">
                <label>Filter by Category:</label>
                <select
                  value={exportOptions.categoryFilter}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, categoryFilter: e.target.value }))}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="product-export-menu__formats">
            <h5>Export Format</h5>
            {formats.map(({ format, label, icon }) => (
              <button
                key={format}
                className="product-export-menu__format"
                onClick={() => handleExport(format)}
                disabled={isExporting}
              >
                <Icon name={icon as any} size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
