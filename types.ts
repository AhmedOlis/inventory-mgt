// FIX: Removed self-import of `Product` which was causing a name conflict with the local interface declaration.

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  itemType?: string;
  subcategory?: string;
  quantity: number;
  reorderLevel?: number;
  price: number;
  imageUrl?: string;
  barcode?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
}

export interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface BarcodeDetectionResult {
  rawValue: string;
}

// New types for Sales and Purchases
export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  priceUSD: number;
}

export interface SalesOrder {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  orderDate: string;
  totalAmountUSD: number;
  exchangeRate: number;
  paymentStatus: 'Unpaid' | 'Paid' | 'Partial';
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: OrderItem[];
  orderDate: string;
  status: 'Pending' | 'Partial' | 'Complete';
  shippingStatus: 'Pending' | 'On the Way' | 'Received';
  totalAmountUSD: number;
  exchangeRate: number;
  paymentStatus: 'Unpaid' | 'Paid' | 'Partial';
}

export interface Settings {
  exchangeRateUSD_ETB: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
