

import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { productService } from '../services/productService';
import { csvService } from '../services/csvService';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/Spinner';
import { ICONS } from '../constants';

export const ImportExportPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);
    try {
      const parsedProducts = await csvService.parseCsv<Partial<Product>>(file);
      if (!parsedProducts || parsedProducts.length === 0) {
        setMessage({ type: 'error', text: 'CSV file is empty or could not be parsed.' });
        setIsLoading(false);
        return;
      }

      let importedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      for (const item of parsedProducts) {
        // Basic validation: ensure required fields are present
        if (!item.name || !item.sku || !item.category || item.quantity === undefined || item.price === undefined) {
          skippedCount++;
          errors.push(`Skipped product due to missing required fields (Name, SKU, Category, Quantity, Price): ${JSON.stringify(item)}`);
          continue;
        }
        
        // Check if SKU already exists
        const existingProducts = await productService.getProducts();
        if (existingProducts.some(p => p.sku === item.sku)) {
            skippedCount++;
            errors.push(`Skipped product with SKU ${item.sku} as it already exists.`);
            continue;
        }

        const productToAdd: Omit<Product, 'id'> = {
          name: item.name,
          sku: item.sku,
          description: item.description || '',
          category: item.category,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          imageUrl: item.imageUrl || '',
          barcode: item.barcode || '',
        };
        await productService.addProduct(productToAdd);
        importedCount++;
      }
      
      let successMessage = `Successfully imported ${importedCount} products.`;
      if (skippedCount > 0) {
        successMessage += ` Skipped ${skippedCount} products.`;
      }
      setMessage({ type: 'success', text: successMessage });
      if (errors.length > 0) {
        console.warn("Import errors/warnings:", errors);
        // Optionally display these errors to the user in more detail
      }

    } catch (error) {
      console.error("Import error:", error);
      setMessage({ type: 'error', text: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsLoading(false);
      if(fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const products = await productService.getProducts();
      if (products.length === 0) {
        setMessage({ type: 'error', text: 'No products to export.' });
        setIsLoading(false);
        return;
      }
      const csvData = csvService.exportToCsv(products);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'products_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage({ type: 'success', text: 'Products exported successfully.' });
    } catch (error) {
      console.error("Export error:", error);
      setMessage({ type: 'error', text: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center">Import / Export Products</h1>

      {message && (
        <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Import Products from CSV</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload a CSV file with product data. Ensure columns include: <code>name, sku, description, category, quantity, price, imageUrl, barcode</code>.
            Required columns are: <code>name, sku, category, quantity, price</code>. SKU must be unique.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            ref={fileInputRef}
            disabled={isLoading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
           {isLoading && <div className="mt-4"><Spinner /> <p className="text-sm text-gray-500">Processing...</p></div>}
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Export Products to CSV</h2>
        <p className="text-sm text-gray-600 mb-4">
          Download all current products as a CSV file.
        </p>        
        <Button onClick={handleExport} disabled={isLoading} variant="primary" leftIcon={isLoading ? <Spinner size="sm" /> : ICONS.export}>
          {isLoading ? 'Exporting...' : 'Export All Products'}
        </Button>
      </div>
    </div>
  );
};