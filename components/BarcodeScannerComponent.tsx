
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import { BarcodeDetectionResult } from '../types';
import { Spinner } from './Spinner';
import { Button } from './common/Button';
import { ICONS } from '../constants';

interface BarcodeScannerProps {
  onScanSuccess: (result: BarcodeDetectionResult) => void;
  onScanError?: (error: Error) => void;
  onCancel?: () => void;
}

export const BarcodeScannerComponent: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onScanError, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    const codeReader = codeReaderRef.current;

    const startScanning = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => { // Ensure video is loaded before playing
            videoRef.current?.play().catch(playError => {
                 console.error("Error playing video:", playError);
                 setError("Could not start video playback. Please check camera permissions and try again.");
            });
          };
          
          setIsLoading(false);

          codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
            if (result) {
              onScanSuccess({ rawValue: result.getText() });
              stopScanning(); // Stop after successful scan
            }
            if (err && !(err instanceof NotFoundException || err instanceof ChecksumException || err instanceof FormatException)) {
              console.error('Barcode scan error:', err);
              setError(`Scan Error: ${err.message}`);
              if (onScanError) {
                onScanError(err);
              }
            }
          });
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        let message = 'Could not access camera. Please ensure permissions are granted.';
        if (err instanceof Error) {
          if (err.name === "NotAllowedError") {
            message = "Camera access denied. Please grant permission in your browser settings.";
          } else if (err.name === "NotFoundError") {
            message = "No camera found. Please ensure a camera is connected and enabled.";
          }
        }
        setError(message);
        setIsLoading(false);
        if (onScanError) {
          onScanError(err as Error);
        }
      }
    };

    startScanning();

    return () => {
      stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScanSuccess, onScanError]); // Dependencies should be stable

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset(); // Stops scanning and releases camera
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-xl text-white relative w-full max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-center">Scan Barcode</h3>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-800 bg-opacity-75 z-10">
          <Spinner size="lg" />
          <p className="mt-2">Initializing camera...</p>
        </div>
      )}
      <div className="relative w-full aspect-video bg-black rounded overflow-hidden mb-4">
        <video ref={videoRef} className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`} playsInline />
        {!isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-1/2 border-2 border-dashed border-green-400 opacity-75 rounded-lg"></div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-700 border border-red-900 text-red-100 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {!isLoading && !error && <p className="text-sm text-gray-400 text-center mb-4">Position the barcode within the frame.</p>}
      
      {onCancel && (
        <Button variant="secondary" onClick={() => { stopScanning(); onCancel(); }} className="w-full">
          Cancel Scan
        </Button>
      )}
    </div>
  );
};
