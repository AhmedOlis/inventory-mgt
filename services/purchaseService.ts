import { PurchaseOrder } from '../types';
import { generateId } from '../utils/idGenerator';
import { productService } from './productService';

const PURCHASE_ORDERS_KEY = 'inventory_purchase_orders';

const getOrdersFromStorage = (): PurchaseOrder[] => {
  const ordersJson = localStorage.getItem(PURCHASE_ORDERS_KEY);
  return ordersJson ? JSON.parse(ordersJson) : [];
};

const saveOrdersToStorage = (orders: PurchaseOrder[]) => {
  localStorage.setItem(PURCHASE_ORDERS_KEY, JSON.stringify(orders));
};

export const purchaseService = {
  getPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    return getOrdersFromStorage();
  },

  getPurchaseOrderById: async (id: string): Promise<PurchaseOrder | undefined> => {
    const orders = getOrdersFromStorage();
    return orders.find(o => o.id === id);
  },

  addPurchaseOrder: async (orderData: Omit<PurchaseOrder, 'id'>): Promise<PurchaseOrder> => {
    const orders = getOrdersFromStorage();
    const newOrder: PurchaseOrder = { ...orderData, id: generateId() };

    // If order is created as 'Received', update stock immediately
    if (newOrder.shippingStatus === 'Received') {
      for (const item of newOrder.items) {
        await productService.updateStock(item.productId, item.quantity);
      }
    }

    saveOrdersToStorage([...orders, newOrder]);
    return newOrder;
  },

  updatePurchaseOrder: async (id: string, updates: Partial<Omit<PurchaseOrder, 'id'>>): Promise<PurchaseOrder> => {
    const orders = getOrdersFromStorage();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Purchase order not found");

    const oldOrder = orders[index];
    const updatedOrder = { ...oldOrder, ...updates };

    // Check if status changed to 'Received' to update stock
    if (updates.shippingStatus === 'Received' && oldOrder.shippingStatus !== 'Received') {
      for (const item of updatedOrder.items) {
        await productService.updateStock(item.productId, item.quantity);
      }
    }
    
    // If status is changed *from* 'Received' to something else, revert stock.
    if (oldOrder.shippingStatus === 'Received' && updates.shippingStatus && updates.shippingStatus !== 'Received') {
      for (const item of oldOrder.items) {
        await productService.updateStock(item.productId, -item.quantity);
      }
    }

    orders[index] = updatedOrder;
    saveOrdersToStorage(orders);
    return updatedOrder;
  },

  deletePurchaseOrder: async (id: string): Promise<void> => {
    let orders = getOrdersFromStorage();
    const orderToDelete = orders.find(o => o.id === id);

    // If the order was 'Received', we must revert the stock addition.
    if (orderToDelete && orderToDelete.shippingStatus === 'Received') {
        for (const item of orderToDelete.items) {
            await productService.updateStock(item.productId, -item.quantity);
        }
    }

    orders = orders.filter(o => o.id !== id);
    saveOrdersToStorage(orders);
  },
};
