
import Papa from 'papaparse';
import { Product } from '../types';

export const csvService = {
  parseCsv: <T,>(file: File): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data as T[]);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  },

  exportToCsv: (products: Product[]): string => {
    // Define headers based on Product interface keys
    const headers = ["id", "sku", "name", "description", "category", "quantity", "price", "imageUrl", "barcode"];
    const csvData = products.map(product => 
        headers.map(header => (product as any)[header] ?? '') // Handle undefined values
    );
    
    return Papa.unparse({
        fields: headers,
        data: csvData
    });
  },
};