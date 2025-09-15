import React from 'react';
import { Line } from 'react-chartjs-2';
import { SalesOrder, PurchaseOrder } from '../../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface SalesChartProps {
  salesData: SalesOrder[];
  purchaseData: PurchaseOrder[];
}

const groupDataByDay = (data: (SalesOrder | PurchaseOrder)[]) => {
  const grouped: { [key: string]: number } = {};
  data.forEach(item => {
    const day = new Date(item.orderDate).toISOString().split('T')[0];
    if (!grouped[day]) {
      grouped[day] = 0;
    }
    grouped[day] += item.totalAmountUSD;
  });
  return grouped;
};


export const SalesChart: React.FC<SalesChartProps> = ({ salesData, purchaseData }) => {
  const groupedSales = groupDataByDay(salesData);
  const groupedPurchases = groupDataByDay(purchaseData);

  const allDates = [...Object.keys(groupedSales), ...Object.keys(groupedPurchases)];
  const uniqueDates = [...new Set(allDates)].sort();

  const chartData = {
    labels: uniqueDates.map(date => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})),
    datasets: [
      {
        label: 'Sales',
        data: uniqueDates.map(date => groupedSales[date] || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Purchases',
        data: uniqueDates.map(date => groupedPurchases[date] || 0),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.3,
        fill: true,
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: (value: any) => `$${value}`
            }
        }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };


  return <div style={{ height: '300px' }}><Line data={chartData} options={options} /></div>;
};