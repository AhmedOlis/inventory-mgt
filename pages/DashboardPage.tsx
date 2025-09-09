
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ICONS, CATEGORIES } from '../constants';
import { Modal } from '../components/Modal';

const StockStatusBadge: React.FC<{ quantity: number, reorderLevel?: number }> = ({ quantity, reorderLevel = 0 }) => {
  if (quantity <= 0) {
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Out of Stock</span>;
  }
  if (quantity <= reorderLevel) {
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>;
  }
  return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">In Stock</span>;
};

const ProductRow: React.FC<{ product: Product; onDelete: (id: string) => void; onEdit: (id: string) => void; }> = ({ product, onDelete, onEdit }) => {
  const placeholderImg = `https://picsum.photos/seed/${product.sku}/50/50`;
  return (
    <tr className="bg-white hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <img 
          src={product.imageUrl || placeholderImg} 
          alt={product.name} 
          className="w-10 h-10 rounded-md object-cover"
          onError={(e) => (e.currentTarget.src = placeholderImg)} 
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{product.sku}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
        <StockStatusBadge quantity={product.quantity} reorderLevel={product.reorderLevel} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{product.quantity}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${product.price.toFixed(2)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(product.id)} leftIcon={ICONS.edit}>Edit</Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(product.id)} leftIcon={ICONS.delete}>Delete</Button>
      </td>
    </tr>
  );
};

export const DashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setIsLoading(true);
      try {
        await productService.deleteProduct(productToDelete.id);
        setProductToDelete(null);
        fetchProducts(); // Refresh list
      } catch (err) {
        setError(`Failed to delete product: ${productToDelete.name}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/products/${productId}/edit`);
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => filterCategory ? p.category === filterCategory : true)
      .sort((a,b) => a.name.localeCompare(b.name)); // Sort by name
  }, [products, searchTerm, filterCategory]);

  if (isLoading && products.length === 0) { // Show spinner only on initial load
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4 bg-red-100 border border-red-500 rounded">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Product Dashboard</h1>
        <Link to="/products/new">
          <Button variant="primary" leftIcon={ICONS.add}>Add New Product</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow">
        <Input 
          placeholder="Search by name or SKU..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          containerClassName="mb-0"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {filteredProducts.length === 0 && !isLoading ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10.5 11.25h3M12 15V7.5M21 7.5H3" />
          </svg>
          <p className="text-xl text-gray-600">No products found.</p>
          <p className="text-gray-500">Try adjusting your search or filters, or add a new product.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <ProductRow key={product.id} product={product} onDelete={() => handleDeleteClick(product)} onEdit={handleEdit} />
              ))}
            </tbody>
          </table>
        </div>
      )}
       <Modal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete the product "<strong>{productToDelete?.name}</strong>"? This action cannot be undone.</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setProductToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isLoading}>
            {isLoading ? <Spinner size="sm"/> : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};