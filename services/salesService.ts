import { SalesOrder, Product } from '../types';
import { generateId } from '../utils/idGenerator';
import { productService } from './productService';

const SALES_ORDERS_KEY = 'inventory_sales_orders';

const getOrdersFromStorage = (): SalesOrder[] => {
  const ordersJson = localStorage.getItem(SALES_ORDERS_KEY);
  return ordersJson ? JSON.parse(ordersJson) : [];
};

const saveOrdersToStorage = (orders: SalesOrder[]) => {
  localStorage.setItem(SALES_ORDERS_KEY, JSON.stringify(orders));
};

export const salesService = {
  getSalesOrders: async (): Promise<SalesOrder[]> => {
    return getOrdersFromStorage();
  },

  getSalesOrderById: async (id: string): Promise<SalesOrder | undefined> => {
    const orders = getOrdersFromStorage();
    return orders.find(o => o.id === id);
  },

  addSalesOrder: async (orderData: Omit<SalesOrder, 'id'>): Promise<SalesOrder> => {
    // Transactional logic: Update stock first
    for (const item of orderData.items) {
      const product = await productService.getProductById(item.productId);
      if (!product || product.quantity < item.quantity) {
        throw new Error(`Not enough stock for ${item.name}. Available: ${product?.quantity || 0}, Requested: ${item.quantity}.`);
      }
      await productService.updateStock(item.productId, -item.quantity);
    }
    
    // If stock updates are successful, save the order
    const orders = getOrdersFromStorage();
    const newOrder: SalesOrder = { ...orderData, id: generateId() };
    saveOrdersToStorage([...orders, newOrder]);
    return newOrder;
  },

  updateSalesOrder: async (id: string, updates: Partial<Omit<SalesOrder, 'id'>>): Promise<SalesOrder> => {
    // Note: This simplified version does not handle stock changes on item updates.
    // A full implementation would require comparing old vs new items.
    const orders = getOrdersFromStorage();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Sales order not found");
    orders[index] = { ...orders[index], ...updates };
    saveOrdersToStorage(orders);
    return orders[index];
  },

  deleteSalesOrder: async (id: string): Promise<void> => {
    let orders = getOrdersFromStorage();
    const orderToDelete = orders.find(o => o.id === id);
    if (!orderToDelete) return;

    // Transactional logic: Return items to stock
    for (const item of orderToDelete.items) {
      await productService.updateStock(item.productId, item.quantity);
    }

    orders = orders.filter(o => o.id !== id);
    saveOrdersToStorage(orders);
  },
};
