
import { Supplier } from '../types';
import { generateId } from '../utils/idGenerator';

const SUPPLIERS_STORAGE_KEY = 'inventoryProSuppliers';

const getStoredSuppliers = (): Supplier[] => {
  const stored = localStorage.getItem(SUPPLIERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveSuppliers = (suppliers: Supplier[]): void => {
  localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(suppliers));
};

export const supplierService = {
  getSuppliers: async (): Promise<Supplier[]> => {
    return getStoredSuppliers();
  },

  getSupplierById: async (id: string): Promise<Supplier | undefined> => {
    const suppliers = getStoredSuppliers();
    return suppliers.find(p => p.id === id);
  },

  addSupplier: async (supplierData: Omit<Supplier, 'id'>): Promise<Supplier> => {
    const suppliers = getStoredSuppliers();
    const newSupplier: Supplier = { ...supplierData, id: generateId() };
    saveSuppliers([...suppliers, newSupplier]);
    return newSupplier;
  },

  updateSupplier: async (id: string, updates: Partial<Omit<Supplier, 'id'>>): Promise<Supplier | undefined> => {
    let suppliers = getStoredSuppliers();
    const supplierIndex = suppliers.findIndex(p => p.id === id);
    if (supplierIndex === -1) {
      return undefined;
    }
    suppliers[supplierIndex] = { ...suppliers[supplierIndex], ...updates };
    saveSuppliers(suppliers);
    return suppliers[supplierIndex];
  },

  deleteSupplier: async (id: string): Promise<void> => {
    let suppliers = getStoredSuppliers();
    suppliers = suppliers.filter(p => p.id !== id);
    saveSuppliers(suppliers);
  },
};