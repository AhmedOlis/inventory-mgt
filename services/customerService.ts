import { Customer } from '../types';
import { generateId } from '../utils/idGenerator';

const CUSTOMERS_KEY = 'inventory_customers';

const getCustomersFromStorage = (): Customer[] => {
  const customersJson = localStorage.getItem(CUSTOMERS_KEY);
  return customersJson ? JSON.parse(customersJson) : [];
};

const saveCustomersToStorage = (customers: Customer[]) => {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const customerService = {
  getCustomers: async (): Promise<Customer[]> => {
    return getCustomersFromStorage();
  },

  getCustomerById: async (id: string): Promise<Customer | undefined> => {
    const customers = getCustomersFromStorage();
    return customers.find(c => c.id === id);
  },

  addCustomer: async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
    const customers = getCustomersFromStorage();
    const newCustomer: Customer = { ...customerData, id: generateId() };
    saveCustomersToStorage([...customers, newCustomer]);
    return newCustomer;
  },

  updateCustomer: async (id: string, updates: Partial<Omit<Customer, 'id'>>): Promise<Customer> => {
    const customers = getCustomersFromStorage();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Customer not found");
    customers[index] = { ...customers[index], ...updates };
    saveCustomersToStorage(customers);
    return customers[index];
  },

  deleteCustomer: async (id: string): Promise<void> => {
    let customers = getCustomersFromStorage();
    customers = customers.filter(c => c.id !== id);
    saveCustomersToStorage(customers);
  },
};
