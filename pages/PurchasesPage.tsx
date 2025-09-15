import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PurchaseOrder } from '../types';
import { purchaseService } from '../services/purchaseService';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ICONS } from '../constants';
import { Modal } from '../components/Modal';

export const PurchasesPage: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderToDelete, setOrderToDelete] = useState<PurchaseOrder | null>(null);

  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await purchaseService.getPurchaseOrders();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch purchase orders.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const handleDeleteClick = (order: PurchaseOrder) => {
    setOrderToDelete(order);
  };
  
  const confirmDelete = async () => {
    if (orderToDelete) {
      setIsLoading(true);
      try {
        await purchaseService.deletePurchaseOrder(orderToDelete.id);
        setOrderToDelete(null);
        fetchOrders();
      } catch (err: any) {
        setError(err.message || `Failed to delete order ${orderToDelete.id}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => o.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [orders, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Purchase Orders</h1>
        <Link to="/purchases/new">
          <Button variant="primary" leftIcon={ICONS.add}>New Purchase</Button>
        </Link>
      </div>

       <div className="p-4 bg-white rounded-lg shadow">
        <Input 
          placeholder="Search by Supplier or Order ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          containerClassName="mb-0"
        />
      </div>

      {isLoading ? <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div> :
       error ? <div className="text-red-500 text-center p-4 bg-red-100 border border-red-500 rounded">{error}</div> :
       filteredOrders.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">No purchase orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total (USD)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{order.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.supplierName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${order.totalAmountUSD.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{order.shippingStatus}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{order.paymentStatus}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/purchases/${order.id}/edit`)} leftIcon={ICONS.edit}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteClick(order)} leftIcon={ICONS.delete}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
       <Modal isOpen={!!orderToDelete} onClose={() => setOrderToDelete(null)} title="Confirm Deletion">
        <p>Are you sure you want to delete purchase order <strong>{orderToDelete?.id}</strong>?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOrderToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isLoading}>
            {isLoading ? <Spinner size="sm"/> : 'Delete'}
          </Button>
        </div>
      </Modal>

    </div>
  );
};