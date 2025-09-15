import React from 'react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
      <div className="text-center py-20 bg-white rounded-lg shadow">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-gray-300 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V5.25A2.25 2.25 0 0 0 18 3H6A2.25 2.25 0 0 0 3.75 5.25v12.75A2.25 2.25 0 0 0 6 20.25Z" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-700">Reporting Feature Coming Soon</h2>
        <p className="mt-2 text-gray-500">
          Detailed reports on sales, purchases, profits, and best-selling products will be available here.
        </p>
      </div>
    </div>
  );
};