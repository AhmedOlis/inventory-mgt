import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { SalesOrder } from '../../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopProductsChartProps {
  salesData: SalesOrder[];
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({ salesData }) => {
  const topProductsData = useMemo(() => {
    const productSales: { [key: string]: number } = {};
    salesData.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = 0;
        }
        productSales[item.name] += item.quantity;
      });
    });

    return Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [salesData]);

  const chartData = {
    labels: topProductsData.map(([name]) => name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: topProductsData.map(([, quantity]) => quantity),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
     scales: {
        x: {
            beginAtZero: true
        }
    }
  };

  return <div style={{ height: '300px' }}><Bar data={chartData} options={options} /></div>;
};