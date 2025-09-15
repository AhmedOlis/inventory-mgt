
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ProductPage } from './pages/ProductPage';
import { ImportExportPage } from './pages/ImportExportPage';
import { ScanBarcodePage } from './pages/ScanBarcodePage';
import { SuppliersPage } from './pages/SuppliersPage';
import { CustomersPage } from './pages/CustomersPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SalesPage } from './pages/SalesPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SalesOrderPage } from './pages/SalesOrderPage';
import { PurchaseOrderPage } from './pages/PurchaseOrderPage';

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
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/scan" element={<ScanBarcodePage />} />
          <Route path="/import-export" element={<ImportExportPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/sales/new" element={<SalesOrderPage />} />
          <Route path="/sales/:orderId/edit" element={<SalesOrderPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/purchases/new" element={<PurchaseOrderPage />} />
          <Route path="/purchases/:orderId/edit" element={<PurchaseOrderPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;