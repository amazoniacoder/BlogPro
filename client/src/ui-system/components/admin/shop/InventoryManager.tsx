import React, { useState, useEffect } from 'react';
import { Icon } from '../../../icons/components';

export interface Product {
  id: string;
  title: string;
  sku: string;
  stockQuantity: number;
  trackInventory: boolean;
  categoryName: string;
}

export const InventoryManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly]);

  const fetchInventory = async () => {
    // Skip API call - not implemented yet
    setProducts([]);
    setLoading(false);
  };

  const updateStock = async (productId: string, newStock: number) => {
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: newStock })
      });
      fetchInventory();
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  const getStockStatusClass = (stock: number) => {
    if (stock === 0) return 'inventory-grid__stock-status--out';
    if (stock <= 10) return 'inventory-grid__stock-status--low';
    return 'inventory-grid__stock-status--good';
  };

  return (
    <div className="inventory-manager">
      <div className="inventory-manager__header">
        <h1 className="inventory-manager__title">Inventory Management</h1>
        
        <div className="inventory-manager__controls">
          <label className="inventory-manager__filter">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            Show low stock only
          </label>
        </div>
      </div>

      {loading ? (
        <div className="inventory-manager__loading">Loading inventory...</div>
      ) : (
        <div className="inventory-grid">
          {products && products.length > 0 && products.map((product) => (
            <div key={product.id} className="inventory-grid__item">
              <div className="inventory-grid__header">
                <h3 className="inventory-grid__title">{product.title}</h3>
                <span className="inventory-grid__sku">SKU: {product.sku || 'N/A'}</span>
              </div>

              <div className="inventory-grid__content">
                <div className="inventory-grid__category">{product.categoryName}</div>
                
                <div className="inventory-grid__stock">
                  <div className={`inventory-grid__stock-status ${getStockStatusClass(product.stockQuantity)}`}>
                    <Icon name="circle" size={8} />
                    <span>{product.stockQuantity} in stock</span>
                  </div>

                  {product.trackInventory && (
                    <div className="inventory-grid__stock-controls">
                      <button
                        className="inventory-grid__stock-btn"
                        onClick={() => updateStock(product.id, Math.max(0, product.stockQuantity - 1))}
                      >
                        <Icon name="minus" size={16} />
                      </button>
                      
                      <input
                        type="number"
                        className="inventory-grid__stock-input"
                        value={product.stockQuantity}
                        onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                        min="0"
                      />
                      
                      <button
                        className="inventory-grid__stock-btn"
                        onClick={() => updateStock(product.id, product.stockQuantity + 1)}
                      >
                        <Icon name="add" size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {!product.trackInventory && (
                  <div className="inventory-grid__no-tracking">
                    <Icon name="info" size={16} />
                    <span>Inventory tracking disabled</span>
                  </div>
                )}
              </div>

              {product.stockQuantity <= 10 && product.trackInventory && (
                <div className="inventory-grid__alert">
                  <Icon name="warning" size={16} />
                  <span>Low stock alert</span>
                </div>
              )}
            </div>
          ))}

          {(!products || products.length === 0) && !loading && (
            <div className="inventory-grid__empty">
              <Icon name="folder" size={48} />
              <p>{lowStockOnly ? 'No low stock items' : 'No products found'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
