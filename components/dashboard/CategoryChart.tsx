import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Product } from '../../types';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  products: Product[];
}

const CHART_COLORS = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(234, 179, 8, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
];

export const CategoryChart: React.FC<CategoryChartProps> = ({ products }) => {
  const categoryData = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {};
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categoryCounts[category]) {
        categoryCounts[category] = 0;
      }
      categoryCounts[category] += 1;
    });
    return Object.entries(categoryCounts).sort(([,a],[,b]) => b - a);
  }, [products]);

  const chartData = {
    labels: categoryData.map(([name]) => name),
    datasets: [
      {
        label: '# of Products',
        data: categoryData.map(([, count]) => count),
        backgroundColor: CHART_COLORS,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };


  return <div style={{ position: 'relative', height: '220px', margin: 'auto' }}><Doughnut data={chartData} options={options} /></div>;
};