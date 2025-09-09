
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


export interface BarcodeDetectionResult {
  rawValue: string;
}