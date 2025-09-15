import { Supplier } from '../types';
import { generateId } from '../utils/idGenerator';

const SUPPLIERS_KEY = 'inventory_suppliers';

const getSuppliersFromStorage = (): Supplier[] => {
  const suppliersJson = localStorage.getItem(SUPPLIERS_KEY);
  return suppliersJson ? JSON.parse(suppliersJson) : [];
};

const saveSuppliersToStorage = (suppliers: Supplier[]) => {
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
};


export const supplierService = {
  getSuppliers: async (): Promise<Supplier[]> => {
    return getSuppliersFromStorage();
  },

  getSupplierById: async (id: string): Promise<Supplier | undefined> => {
    const suppliers = getSuppliersFromStorage();
    return suppliers.find(s => s.id === id);
  },

  addSupplier: async (supplierData: Omit<Supplier, 'id'>): Promise<Supplier> => {
    const suppliers = getSuppliersFromStorage();
    const newSupplier: Supplier = { ...supplierData, id: generateId() };
    saveSuppliersToStorage([...suppliers, newSupplier]);
    return newSupplier;
  },

  updateSupplier: async (id: string, updates: Partial<Omit<Supplier, 'id'>>): Promise<Supplier> => {
    const suppliers = getSuppliersFromStorage();
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Supplier not found");
    suppliers[index] = { ...suppliers[index], ...updates };
    saveSuppliersToStorage(suppliers);
    return suppliers[index];
  },

  deleteSupplier: async (id: string): Promise<void> => {
    let suppliers = getSuppliersFromStorage();
    suppliers = suppliers.filter(s => s.id !== id);
    saveSuppliersToStorage(suppliers);
  },
};
