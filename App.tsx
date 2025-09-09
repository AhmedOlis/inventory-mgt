
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ProductPage } from './pages/ProductPage';
import { ImportExportPage } from './pages/ImportExportPage';
import { ScanBarcodePage } from './pages/ScanBarcodePage';
import { SuppliersPage } from './pages/SuppliersPage';
import { CustomersPage } from './pages/CustomersPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products/new" element={<ProductPage />} />
          <Route path="/products/:productId/edit" element={<ProductPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/scan" element={<ScanBarcodePage />} />
          <Route path="/import-export" element={<ImportExportPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;