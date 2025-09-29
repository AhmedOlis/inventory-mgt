

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { csvService } from '../services/csvService';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/Spinner';
import { ICONS } from '../constants';
import { Modal } from '../components/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';

export const SpreadsheetPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editingCell, setEditingCell] = useState<{ productId: string; columnKey: keyof Product } | null>(null);
  const [cellValue, setCellValue] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [skuFilter, setSkuFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
      ]);
      setProducts(productsData.sort((a,b) => a.name.localeCompare(b.name)));
      setCategories(categoriesData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
        const nameMatch = nameFilter ? product.name.toLowerCase().includes(nameFilter.toLowerCase()) : true;
        const skuMatch = skuFilter ? product.sku.toLowerCase().includes(skuFilter.toLowerCase()) : true;
        const categoryMatch = categoryFilter ? product.category === categoryFilter : true;
        return nameMatch && skuMatch && categoryMatch;
    });
  }, [products, nameFilter, skuFilter, categoryFilter]);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setMessage(null);
    try {
      const parsedProducts = await csvService.parseCsv<Partial<Product>>(file);
      if (!parsedProducts || parsedProducts.length === 0) {
        throw new Error('CSV file is empty or could not be parsed.');
      }

      let importedCount = 0;
      let skippedCount = 0;
      const existingProducts = await productService.getProducts();
      const existingSkus = new Set(existingProducts.map(p => p.sku));

      for (const item of parsedProducts) {
        if (!item.name || !item.sku || !item.category || item.quantity === undefined || item.price === undefined) {
          skippedCount++;
          continue;
        }
        if (existingSkus.has(item.sku)) {
          skippedCount++;
          continue;
        }
        await productService.addProduct({
          name: item.name, sku: item.sku, description: item.description || '', category: item.category,
          quantity: Number(item.quantity) || 0, price: Number(item.price) || 0,
          imageUrl: item.imageUrl || '', barcode: item.barcode || '',
        });
        importedCount++;
      }
      
      let successMessage = `Successfully imported ${importedCount} products.`;
      if (skippedCount > 0) successMessage += ` Skipped ${skippedCount} existing or invalid products.`;
      setMessage({ type: 'success', text: successMessage });
      fetchData(); // Refresh grid
    } catch (error: any) {
      setMessage({ type: 'error', text: `Import failed: ${error.message}` });
    } finally {
      setIsProcessing(false);
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExport = async () => {
    setIsProcessing(true);
    setMessage(null);
    try {
      const productsToExport = await productService.getProducts();
      if (productsToExport.length === 0) throw new Error('No products to export.');
      
      const csvData = csvService.exportToCsv(productsToExport);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'products_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage({ type: 'success', text: 'Products exported successfully.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: `Export failed: ${error.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditClick = (product: Product, columnKey: keyof Product) => {
    setEditingCell({ productId: product.id, columnKey });
    setCellValue(String(product[columnKey] || ''));
  };

  const handleCellBlur = async () => {
    if (!editingCell) return;
    const { productId, columnKey } = editingCell;
    const originalProduct = products.find(p => p.id === productId);

    if (originalProduct && String(originalProduct[columnKey] || '') !== cellValue) {
        const updatedValue = (columnKey === 'quantity' || columnKey === 'price') ? parseFloat(cellValue) || 0 : cellValue;
        
        try {
            await productService.updateProduct(productId, { [columnKey]: updatedValue });
            const updatedProducts = products.map(p => p.id === productId ? { ...p, [columnKey]: updatedValue } : p);
            setProducts(updatedProducts);
        } catch (e: any) {
            setError(e.message || 'Failed to update product.');
        }
    }
    setEditingCell(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
    else if (event.key === 'Escape') setEditingCell(null);
  };
  
  const handleDelete = (product: Product) => setProductToDelete(product);
  
  const confirmDelete = async () => {
    if (productToDelete) {
        setIsProcessing(true);
        try {
            await productService.deleteProduct(productToDelete.id);
            setProductToDelete(null);
            fetchData();
        } catch (err: any) {
            setError(err.message || `Failed to delete product.`);
        } finally {
            setIsProcessing(false);
        }
    }
  };
  
  const handleClearFilters = () => {
    setNameFilter('');
    setSkuFilter('');
    setCategoryFilter('');
  };

  const columns: { key: keyof Product; name: string; editable: boolean; type?: string; }[] = [
    { key: 'sku', name: 'SKU', editable: false }, { key: 'name', name: 'Name', editable: true },
    { key: 'category', name: 'Category', editable: true }, { key: 'quantity', name: 'Qty', editable: true, type: 'number' },
    { key: 'price', name: 'Price ($)', editable: true, type: 'number' }, { key: 'barcode', name: 'Barcode', editable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Spreadsheet View</h1>
        <Link to="/products/new">
          <Button variant="primary" leftIcon={ICONS.add}>Add New Product</Button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center gap-4">
          <Button onClick={handleExport} disabled={isProcessing} leftIcon={isProcessing ? <Spinner size="sm" /> : ICONS.export}>Export CSV</Button>
          <div>
            <input type="file" accept=".csv" onChange={handleImport} ref={fileInputRef} disabled={isProcessing} className="hidden" id="csv-import"/>
            <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} leftIcon={isProcessing ? <Spinner size="sm" /> : ICONS.import} variant="outline">Import CSV</Button>
          </div>
        </div>
        {message && <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
                placeholder="Filter by Name..."
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
                containerClassName="mb-0"
            />
            <Input
                placeholder="Filter by SKU..."
                value={skuFilter}
                onChange={e => setSkuFilter(e.target.value)}
                containerClassName="mb-0"
            />
            <Select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                options={categories.map(c => ({ value: c.name, label: c.name }))}
                label="Category"
                containerClassName="mb-0"
            />
        </div>
        <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={handleClearFilters}>Clear Filters</Button>
        </div>
      </div>

      {error && <div className="text-red-500 text-center p-4 bg-red-100 border border-red-500 rounded">{error}</div>}

      {isLoading ? <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div> :
       filteredProducts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">
            {products.length === 0 ? "No products found. Add one or import a CSV file." : "No products match the current filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">{col.name}</th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 group">
                  {columns.map(col => (
                    <td key={col.key} className="px-1 py-1 whitespace-nowrap text-sm text-gray-700 border-b" onClick={() => col.editable && handleEditClick(product, col.key)}>
                      {editingCell?.productId === product.id && editingCell?.columnKey === col.key ? (
                        <Input
                          type={col.type || 'text'}
                          value={cellValue}
                          onChange={e => setCellValue(e.target.value)}
                          onBlur={handleCellBlur}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full h-full text-sm p-2 !m-0 !rounded-none"
                          containerClassName="!mb-0"
                        />
                      ) : (
                        <div className="px-3 py-2 truncate" title={String(product[col.key] || '')}>{product[col.key]}</div>
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium border-b">
                    <button onClick={() => handleDelete(product)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete product">
                      {ICONS.delete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!productToDelete} onClose={() => setProductToDelete(null)} title="Confirm Deletion">
        <p>Are you sure you want to delete "<strong>{productToDelete?.name}</strong>"? This action cannot be undone.</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setProductToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isProcessing}>
            {isProcessing ? <Spinner size="sm"/> : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
