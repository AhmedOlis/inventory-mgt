import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SalesOrder } from '../types';
import { salesService } from '../services/salesService';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ICONS } from '../constants';
import { Modal } from '../components/Modal';

export const SalesPage: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderToDelete, setOrderToDelete] = useState<SalesOrder | null>(null);

  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'ETB'>('USD');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'All' | 'Paid' | 'Unpaid' | 'Partial'>('All');

  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await salesService.getSalesOrders();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales orders.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const handleDeleteClick = (order: SalesOrder) => {
    setOrderToDelete(order);
  };
  
  const confirmDelete = async () => {
    if (orderToDelete) {
      setIsLoading(true);
      try {
        await salesService.deleteSalesOrder(orderToDelete.id);
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
      .filter(o => {
          const searchTermMatch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase());
          const paymentStatusMatch = paymentStatusFilter === 'All' || o.paymentStatus === paymentStatusFilter;
          return searchTermMatch && paymentStatusMatch;
      })
      .sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [orders, searchTerm, paymentStatusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Sales Orders</h1>
        <Link to="/sales/new">
          <Button variant="primary" leftIcon={ICONS.add}>New Sale</Button>
        </Link>
      </div>

       <div className="p-4 bg-white rounded-lg shadow space-y-4">
        <Input 
          placeholder="Search by Customer or Order ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          containerClassName="mb-0"
        />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Payment Status Filter */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                {(['All', 'Paid', 'Unpaid', 'Partial'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setPaymentStatusFilter(status)}
                        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                            paymentStatusFilter === status
                                ? 'bg-indigo-700 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>
            {/* Currency Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <Button
                    size="sm"
                    variant={activeCurrency === 'USD' ? 'primary' : 'secondary'}
                    onClick={() => setActiveCurrency('USD')}
                    className="!rounded-md"
                >
                    USD
                </Button>
                <Button
                    size="sm"
                    variant={activeCurrency === 'ETB' ? 'primary' : 'secondary'}
                    onClick={() => setActiveCurrency('ETB')}
                    className="!rounded-md"
                >
                    ETB
                </Button>
            </div>
        </div>
      </div>

      {isLoading ? <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div> :
       error ? <div className="text-red-500 text-center p-4 bg-red-100 border border-red-500 rounded">{error}</div> :
       filteredOrders.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">No sales orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total ({activeCurrency})</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{order.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {activeCurrency === 'USD' 
                        ? `$${order.totalAmountUSD.toFixed(2)}`
                        : `${(order.totalAmountUSD * order.exchangeRate).toFixed(2)} ETB`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{order.paymentStatus}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/sales/${order.id}/edit`)} leftIcon={ICONS.edit}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteClick(order)} leftIcon={ICONS.delete}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
       <Modal isOpen={!!orderToDelete} onClose={() => setOrderToDelete(null)} title="Confirm Deletion">
        <p>Are you sure you want to delete sales order <strong>{orderToDelete?.id}</strong>? This will also return the sold items to your inventory stock.</p>
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