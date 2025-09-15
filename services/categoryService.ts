import { Category, Product } from '../types';
import { generateId } from '../utils/idGenerator';
import { DEFAULT_CATEGORIES } from '../constants';

const CATEGORIES_KEY = 'inventory_categories';
const PRODUCTS_KEY = 'inventory_products'; // For checking usage

const getCategoriesFromStorage = (): Category[] => {
  const categoriesJson = localStorage.getItem(CATEGORIES_KEY);
  if (categoriesJson) {
    return JSON.parse(categoriesJson);
  }
  // Seed default categories if none exist
  const defaultCategories = DEFAULT_CATEGORIES.map(name => ({ id: generateId(), name }));
  saveCategoriesToStorage(defaultCategories);
  return defaultCategories;
};

const saveCategoriesToStorage = (categories: Category[]) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    return getCategoriesFromStorage();
  },

  addCategory: async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    const categories = getCategoriesFromStorage();
    if (categories.some(c => c.name.toLowerCase() === categoryData.name.toLowerCase())) {
        throw new Error(`Category "${categoryData.name}" already exists.`);
    }
    const newCategory: Category = { ...categoryData, id: generateId() };
    saveCategoriesToStorage([...categories, newCategory]);
    return newCategory;
  },

  updateCategory: async (id: string, updates: Partial<Omit<Category, 'id'>>): Promise<Category> => {
    const categories = getCategoriesFromStorage();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Category not found");

    if (updates.name && categories.some(c => c.name.toLowerCase() === updates.name!.toLowerCase() && c.id !== id)) {
      throw new Error(`Category "${updates.name}" already exists.`);
    }

    categories[index] = { ...categories[index], ...updates };
    saveCategoriesToStorage(categories);
    return categories[index];
  },

  deleteCategory: async (id: string): Promise<void> => {
    const productsJson = localStorage.getItem(PRODUCTS_KEY);
    const products: Product[] = productsJson ? JSON.parse(productsJson) : [];
    const categoryToDelete = getCategoriesFromStorage().find(c => c.id === id);

    if (categoryToDelete && products.some(p => p.category === categoryToDelete.name)) {
        throw new Error(`Cannot delete category "${categoryToDelete.name}" as it is currently in use by one or more products.`);
    }

    let categories = getCategoriesFromStorage();
    categories = categories.filter(c => c.id !== id);
    saveCategoriesToStorage(categories);
  },
};
