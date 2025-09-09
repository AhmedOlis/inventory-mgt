import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarcodeScannerComponent } from '../components/BarcodeScannerComponent';
import { BarcodeDetectionResult } from '../types';
import { productService } from '../services/productService';
import { Spinner } from '../components/Spinner';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const ScanBarcodePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');

  const handleScanSuccess = async (result: BarcodeDetectionResult) => {
    setIsLoading(true);
    setScanError(null);
    const barcodeValue = result.rawValue;

    if (!barcodeValue || !barcodeValue.trim()) {
      setScanError("Barcode cannot be empty.");
      setIsLoading(false);
      return;
    }

    try {
      const existingProduct = await productService.getProductByBarcode(barcodeValue);
      if (existingProduct) {
        navigate(`/products/${existingProduct.id}/edit`);
      } else {
        navigate(`/products/new?barcode=${encodeURIComponent(barcodeValue)}`);
      }
    } catch (err) {
      console.error("Error processing barcode:", err);
      setScanError("Error processing barcode. Please try again.");
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScanSuccess({ rawValue: manualBarcode });
  };

  const handleScanError = (error: Error) => {
    console.error("Scan Error:", error);
    setScanError(`Scan failed: ${error.message}. Please try again or ensure camera permissions are enabled.`);
    setIsLoading(false);
  };

  const handleCancelScan = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-lg text-gray-700">Processing barcode...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {scanError && (
         <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md max-w-md w-full text-center">
           {scanError}
         </div>
      )}
      <BarcodeScannerComponent 
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
        onCancel={handleCancelScan}
      />

      <div className="mt-8 w-full max-w-md px-4 sm:px-0">
        <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
                <span className="bg-gray-100 px-3 text-sm font-medium text-gray-500">Or enter manually</span>
            </div>
        </div>
        <form onSubmit={handleManualSubmit} className="flex gap-2 mt-6">
            <Input 
              containerClassName="flex-grow mb-0"
              placeholder="Enter barcode..."
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              aria-label="Manually enter barcode"
            />
            <Button type="submit" variant="secondary">Find Product</Button>
        </form>
      </div>

    </div>
  );
};