
import { Customer } from '../types';
import { generateId } from '../utils/idGenerator';

const CUSTOMERS_STORAGE_KEY = 'inventoryProCustomers';

const getStoredCustomers = (): Customer[] => {
  const stored = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveCustomers = (customers: Customer[]): void => {
  localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
};

export const customerService = {
  getCustomers: async (): Promise<Customer[]> => {
    return getStoredCustomers();
  },

  getCustomerById: async (id: string): Promise<Customer | undefined> => {
    const customers = getStoredCustomers();
    return customers.find(c => c.id === id);
  },

  addCustomer: async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
    const customers = getStoredCustomers();
    const newCustomer: Customer = { ...customerData, id: generateId() };
    saveCustomers([...customers, newCustomer]);
    return newCustomer;
  },

  updateCustomer: async (id: string, updates: Partial<Omit<Customer, 'id'>>): Promise<Customer | undefined> => {
    let customers = getStoredCustomers();
    const customerIndex = customers.findIndex(c => c.id === id);
    if (customerIndex === -1) {
      return undefined;
    }
    customers[customerIndex] = { ...customers[customerIndex], ...updates };
    saveCustomers(customers);
    return customers[customerIndex];
  },

  deleteCustomer: async (id: string): Promise<void> => {
    let customers = getStoredCustomers();
    customers = customers.filter(c => c.id !== id);
    saveCustomers(customers);
  },
};