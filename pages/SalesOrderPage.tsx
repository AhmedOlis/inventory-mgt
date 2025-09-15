// FIX: Imported `useMemo` from React to resolve reference error.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SalesOrder, OrderItem, Customer, Product, Settings } from '../types';
import { salesService } from '../services/salesService';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { settingsService } from '../services/settingsService';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Spinner } from '../components/Spinner';
import { ICONS } from '../constants';

type SalesOrderFormData = Omit<SalesOrder, 'id' | 'customerName' | 'totalAmountUSD'>;

const defaultOrderState: SalesOrderFormData = {
  customerId: '',
  items: [],
  orderDate: new Date().toISOString().split('T')[0],
  exchangeRate: 115,
  paymentStatus: 'Unpaid',
};

export const SalesOrderPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<SalesOrderFormData>(defaultOrderState);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const totalAmountUSD = useMemo(() => {
        return order.items.reduce((sum, item) => sum + item.priceUSD * item.quantity, 0);
    }, [order.items]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [customersData, productsData, settingsData] = await Promise.all([
                customerService.getCustomers(),
                productService.getProducts(),
                settingsService.getSettings()
            ]);
            setCustomers(customersData);
            setProducts(productsData);
            setSettings(settingsData);
            
            if (orderId) {
                const existingOrder = await salesService.getSalesOrderById(orderId);
                if (existingOrder) {
                    setOrder({
                        customerId: existingOrder.customerId,
                        items: existingOrder.items,
                        orderDate: existingOrder.orderDate,
                        exchangeRate: existingOrder.exchangeRate,
                        paymentStatus: existingOrder.paymentStatus
                    });
                } else {
                    setError(`Sales order with ID ${orderId} not found.`);
                }
            } else {
                setOrder(prev => ({ ...prev, exchangeRate: settingsData.exchangeRateUSD_ETB }));
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load data.');
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setOrder(prev => ({...prev, [name]: value }));
    };

    const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
        const newItems = [...order.items];
        (newItems[index] as any)[field] = value;
        setOrder(prev => ({...prev, items: newItems}));
    };

    const handleAddItem = () => {
        if (products.length === 0) return;
        setOrder(prev => ({
            ...prev,
            items: [...prev.items, { productId: products[0].id, name: products[0].name, quantity: 1, priceUSD: products[0].price }]
        }));
    };

    const handleRemoveItem = (index: number) => {
        setOrder(prev => ({...prev, items: prev.items.filter((_, i) => i !== index)}));
    };
    
    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const newItems = [...order.items];
            newItems[index] = { ...newItems[index], productId, name: product.name, priceUSD: product.price };
            setOrder(prev => ({ ...prev, items: newItems }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (order.items.length === 0 || !order.customerId) {
            setError("Please select a customer and add at least one item.");
            return;
        }
        
        const customerName = customers.find(c => c.id === order.customerId)?.name || 'Unknown';
        const finalOrder: Omit<SalesOrder, 'id'> = {
            ...order,
            customerName,
            totalAmountUSD,
        };

        setIsLoading(true);
        try {
            if (orderId) {
                await salesService.updateSalesOrder(orderId, finalOrder);
            } else {
                await salesService.addSalesOrder(finalOrder);
            }
            navigate('/sales');
        } catch (err: any) {
            setError(err.message || 'Failed to save order.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoading && !orderId) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{orderId ? 'Edit Sales Order' : 'Create Sales Order'}</h1>
            {error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select label="Customer" name="customerId" value={order.customerId} onChange={handleOrderChange} options={customers.map(c => ({ value: c.id, label: c.name }))} required />
                    <Input label="Order Date" name="orderDate" type="date" value={order.orderDate} onChange={handleOrderChange} required />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-700 pt-4 border-t">Order Items</h3>
                <div className="space-y-4">
                    {order.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-x-4 gap-y-2 items-center border p-3 rounded-md">
                            <div className="col-span-12 md:col-span-4">
                               <Select containerClassName="mb-0" label={`Item ${index + 1}`} value={item.productId} onChange={e => handleProductSelect(index, e.target.value)} options={products.map(p => ({ value: p.id, label: `${p.name} (In Stock: ${p.quantity})` }))} />
                            </div>
                            <div className="col-span-6 md:col-span-2">
                                <Input containerClassName="mb-0" label="Quantity" type="number" min="1" value={item.quantity.toString()} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} />
                            </div>
                            <div className="col-span-6 md:col-span-2">
                                <Input containerClassName="mb-0" label="Price (USD)" type="number" step="0.01" value={item.priceUSD.toString()} onChange={e => handleItemChange(index, 'priceUSD', parseFloat(e.target.value) || 0)} />
                            </div>
                            <div className="col-span-10 md:col-span-3">
                                <Input containerClassName="mb-0" label="Price (ETB)" type="number" value={(item.priceUSD * order.exchangeRate).toFixed(2)} readOnly disabled />
                            </div>
                             <div className="col-span-2 md:col-span-1 flex items-end justify-center">
                                <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveItem(index)} aria-label="Remove item">{ICONS.delete}</Button>
                            </div>
                        </div>
                    ))}
                </div>
                 <Button type="button" variant="outline" onClick={handleAddItem} leftIcon={ICONS.add}>Add Item</Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                    <Select label="Payment Status" name="paymentStatus" value={order.paymentStatus} onChange={handleOrderChange} options={[{value: 'Unpaid', label: 'Unpaid'}, {value: 'Paid', label: 'Paid'}, {value: 'Partial', label: 'Partial'}]} />
                    <div className="text-right space-y-2">
                         <p className="text-lg font-semibold text-gray-800">Total: ${totalAmountUSD.toFixed(2)} USD</p>
                         <p className="text-md text-gray-500">Total: {(totalAmountUSD * order.exchangeRate).toFixed(2)} ETB</p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/sales')} disabled={isLoading}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (orderId ? 'Update Order' : 'Create Order')}
                    </Button>
                </div>
            </form>
        </div>
    );
};