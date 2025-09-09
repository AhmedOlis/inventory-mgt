
import { Product } from '../types';
import { generateId } from '../utils/idGenerator';

const PRODUCTS_STORAGE_KEY = 'inventoryProProducts';

const getStoredProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveProducts = (products: Product[]): void => {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
};

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    return getStoredProducts();
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    const products = getStoredProducts();
    return products.find(p => p.id === id);
  },

  getProductByBarcode: async (barcode: string): Promise<Product | undefined> => {
    const products = getStoredProducts();
    return products.find(p => p.barcode === barcode);
  },

  addProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const products = getStoredProducts();
    // Basic SKU uniqueness check
    if (products.some(p => p.sku === productData.sku)) {
      throw new Error(`Product with SKU ${productData.sku} already exists.`);
    }
    const newProduct: Product = { ...productData, id: generateId() };
    saveProducts([...products, newProduct]);
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Omit<Product, 'id'>>): Promise<Product | undefined> => {
    let products = getStoredProducts();
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return undefined;
    }
    // Check for SKU conflict if SKU is being updated
    if (updates.sku && updates.sku !== products[productIndex].sku) {
        if (products.some(p => p.sku === updates.sku && p.id !== id)) {
            throw new Error(`Another product with SKU ${updates.sku} already exists.`);
        }
    }
    products[productIndex] = { ...products[productIndex], ...updates };
    saveProducts(products);
    return products[productIndex];
  },

  deleteProduct: async (id: string): Promise<void> => {
    let products = getStoredProducts();
    products = products.filter(p => p.id !== id);
    saveProducts(products);
  },

  generateSku: (): string => {
    // Simple SKU generator, can be improved
    return `SKU-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
};
