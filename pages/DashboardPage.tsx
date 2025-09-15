import React, { useState, useEffect, useMemo } from 'react';
import { SalesOrder, PurchaseOrder, Product, Customer } from '../types';
import { salesService } from '../services/salesService';
import { purchaseService } from '../services/purchaseService';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';
import { Spinner } from '../components/Spinner';
import { StatCard } from '../components/dashboard/StatCard';
import { ICONS } from '../constants';
import { SalesChart } from '../components/dashboard/SalesChart';
import { TopProductsChart } from '../components/dashboard/TopProductsChart';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';

type TimeRange = '7d' | '30d' | 'all';

export const DashboardPage: React.FC = () => {
    const [sales, setSales] = useState<SalesOrder[]>([]);
    const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [salesData, purchasesData, productsData, customersData] = await Promise.all([
                    salesService.getSalesOrders(),
                    purchaseService.getPurchaseOrders(),
                    productService.getProducts(),
                    customerService.getCustomers(),
                ]);
                setSales(salesData);
                setPurchases(purchasesData);
                setProducts(productsData);
                setCustomers(customersData);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const { filteredSales, filteredPurchases } = useMemo(() => {
        const now = new Date();
        const getStartDate = (range: TimeRange) => {
            if (range === 'all') return new Date(0);
            const days = range === '7d' ? 7 : 30;
            return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        };
        const startDate = getStartDate(timeRange);

        return {
            filteredSales: sales.filter(s => new Date(s.orderDate) >= startDate),
            filteredPurchases: purchases.filter(p => new Date(p.orderDate) >= startDate),
        };
    }, [sales, purchases, timeRange]);

    const stats = useMemo(() => {
        const totalSales = filteredSales.reduce((acc, order) => acc + order.totalAmountUSD, 0);
        const totalPurchases = filteredPurchases.reduce((acc, order) => acc + order.totalAmountUSD, 0);
        const lowStockItems = products.filter(p => p.quantity > 0 && p.reorderLevel && p.quantity <= p.reorderLevel).length;
        const outOfStockItems = products.filter(p => p.quantity === 0).length;

        return { totalSales, totalPurchases, lowStockItems, outOfStockItems };
    }, [filteredSales, filteredPurchases, products]);

    const recentActivity = useMemo(() => {
        const combined = [
            ...sales.map(s => ({ ...s, type: 'Sale' as const, date: new Date(s.orderDate) })),
            ...purchases.map(p => ({ ...p, type: 'Purchase' as const, date: new Date(p.orderDate) }))
        ];
        return combined.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
    }, [sales, purchases]);

    const lowStockProducts = useMemo(() => {
        return products
            .filter(p => p.quantity > 0 && p.reorderLevel && p.quantity <= p.reorderLevel)
            .sort((a, b) => a.quantity - b.quantity);
    }, [products]);


    if (isLoading) {
        return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Spinner size="lg" /></div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4 bg-red-100 border border-red-500 rounded">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm">
                    {(['7d', '30d', 'all'] as const).map(range => (
                        <Button
                            key={range}
                            variant={timeRange === range ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setTimeRange(range)}
                        >
                            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Sales" value={`$${stats.totalSales.toFixed(2)}`} icon={ICONS.sales} color="blue" />
                <StatCard title="Total Purchases" value={`$${stats.totalPurchases.toFixed(2)}`} icon={ICONS.purchases} color="green" />
                <StatCard title="Low Stock Items" value={stats.lowStockItems.toString()} icon={ICONS.reports} color="yellow" />
                <StatCard title="Out of Stock" value={stats.outOfStockItems.toString()} icon={ICONS.delete} color="red" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Sales vs Purchases</h3>
                    <SalesChart salesData={filteredSales} purchaseData={filteredPurchases} />
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Selling Products</h3>
                    <TopProductsChart salesData={filteredSales} />
                </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Low Stock Alerts</h3>
                    {lowStockProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2">Product</th>
                                        <th className="px-4 py-2">SKU</th>
                                        <th className="px-4 py-2 text-center">Qty</th>
                                        <th className="px-4 py-2 text-center">Reorder Lvl</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockProducts.slice(0, 5).map(p => (
                                        <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium text-gray-900"><Link to={`/products/${p.id}/edit`} className="hover:underline">{p.name}</Link></td>
                                            <td className="px-4 py-2">{p.sku}</td>
                                            <td className="px-4 py-2 text-center font-bold text-yellow-600">{p.quantity}</td>
                                            <td className="px-4 py-2 text-center">{p.reorderLevel}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-gray-500">No items are low on stock. Great job!</p>}
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Category Distribution</h3>
                    <CategoryChart products={products} />
                </div>
             </div>

        </div>
    );
};