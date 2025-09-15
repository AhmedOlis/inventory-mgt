// Simple client-side data store using localStorage
import { Product } from '../types';
import { generateId } from '../utils/idGenerator';

const PRODUCTS_KEY = 'inventory_products';

const getProductsFromStorage = (): Product[] => {
  try {
    const productsJson = localStorage.getItem(PRODUCTS_KEY);
    return productsJson ? JSON.parse(productsJson) : [];
  } catch (e) {
    console.error("Failed to parse products from localStorage", e);
    return [];
  }
};

const saveProductsToStorage = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};


export const productService = {
  getProducts: async (): Promise<Product[]> => {
    return getProductsFromStorage();
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    const products = getProductsFromStorage();
    return products.find(p => p.id === id);
  },

  getProductByBarcode: async (barcode: string): Promise<Product | undefined> => {
    const products = getProductsFromStorage();
    return products.find(p => p.barcode === barcode);
  },

  addProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const products = getProductsFromStorage();
    if (products.some(p => p.sku === productData.sku)) {
        throw new Error(`A product with SKU "${productData.sku}" already exists.`);
    }
    const newProduct: Product = { ...productData, id: generateId() };
    saveProductsToStorage([...products, newProduct]);
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Omit<Product, 'id'>>): Promise<Product> => {
    const products = getProductsFromStorage();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");
    
    // Check for SKU conflict if SKU is being updated
    if (updates.sku && products.some(p => p.sku === updates.sku && p.id !== id)) {
        throw new Error(`A product with SKU "${updates.sku}" already exists.`);
    }

    products[index] = { ...products[index], ...updates };
    saveProductsToStorage(products);
    return products[index];
  },

  deleteProduct: async (id: string): Promise<void> => {
    let products = getProductsFromStorage();
    products = products.filter(p => p.id !== id);
    saveProductsToStorage(products);
  },

  updateStock: async (productId: string, quantityChange: number): Promise<void> => {
    const products = getProductsFromStorage();
    const index = products.findIndex(p => p.id === productId);
    if (index > -1) {
      products[index].quantity += quantityChange;
      saveProductsToStorage(products);
    }
  },

  generateSku: (): string => {
    return `SKU-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
};
