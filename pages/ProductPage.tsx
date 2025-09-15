import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import { ProductForm } from '../components/ProductForm';
import { Spinner } from '../components/Spinner';

export const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [initialProduct, setInitialProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('Add New Product');
  const [barcodeFromScanner, setBarcodeFromScanner] = useState<string | undefined>(undefined);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const barcode = queryParams.get('barcode');
    if (barcode) {
      setBarcodeFromScanner(barcode);
    }
  }, [location.search]);
  
  const fetchProduct = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const product = await productService.getProductById(id);
      if (product) {
        setInitialProduct(product);
        setPageTitle(`Edit Product: ${product.name}`);
      } else {
        setError(`Product with ID ${id} not found.`);
        setPageTitle('Error');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product details.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    } else {
      setPageTitle('Add New Product');
      setInitialProduct(null); // Ensure form resets for new product
    }
  }, [productId, fetchProduct]);

  const handleSubmit = async (productData: Product) => {
    setIsLoading(true);
    setError(null);
    try {
      if (productId) { // Editing existing product
        const { id, ...updateData } = productData;
        await productService.updateProduct(productId, updateData);
      } else { // Adding new product
        const { id, ...newProductData } = productData;
        await productService.addProduct(newProductData);
      }
      navigate('/sales');
    } catch (err: any) {
      setError(err.message || 'Failed to save product. Please check SKU uniqueness.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && productId) { // Show spinner only when fetching existing product
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error && !initialProduct && productId) { // If error fetching specific product
     return <div className="text-red-500 text-center p-4 bg-red-100 border border-red-500 rounded">{error}</div>;
  }


  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{pageTitle}</h1>
      {error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
      <ProductForm
        initialProduct={initialProduct}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/sales')}
        isLoading={isLoading && !productId} // Show loading on form for new product submission
        barcodeFromScanner={barcodeFromScanner}
      />
    </div>
  );