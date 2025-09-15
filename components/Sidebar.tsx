import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_NAME, ICONS } from '../constants';

const SidebarCategory: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
    {title}
  </h3>
);

export const Sidebar: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-sm' 
        : 'text-gray-300 hover:bg-blue-700 hover:text-white'
    }`;

  return (
    <aside className="w-64 flex-shrink-0 bg-blue-800 text-white flex flex-col p-4 overflow-y-auto">
      <div className="text-center py-4 border-b border-blue-700">
        <NavLink to="/dashboard" className="text-white text-2xl font-bold tracking-tight">
          {APP_NAME}
        </NavLink>
      </div>
      
      <nav className="flex-1 space-y-4 mt-6">
        <div>
            <SidebarCategory title="Main" />
             <NavLink to="/dashboard" className={navLinkClass}>
                {ICONS.dashboard}
                <span>Dashboard</span>
            </NavLink>
        </div>
        <div>
            <SidebarCategory title="Business" />
            <NavLink to="/sales" className={navLinkClass}>
                {ICONS.sales}
                <span>Sales</span>
            </NavLink>
            <NavLink to="/purchases" className={navLinkClass}>
                {ICONS.purchases}
                <span>Purchases</span>
            </NavLink>
             <NavLink to="/reports" className={navLinkClass}>
                {ICONS.reports}
                <span>Reports</span>
            </NavLink>
        </div>

        <div>
          <SidebarCategory title="Inventory" />
          <NavLink to="/products/new" className={navLinkClass}>
            {ICONS.add}
            <span>Add Product</span>
          </NavLink>
          <NavLink to="/scan" className={navLinkClass}>
            {ICONS.scan}
            <span>Scan Barcode</span>
          </NavLink>
        </div>
        
        <div>
          <SidebarCategory title="Management" />
           <NavLink to="/categories" className={navLinkClass}>
            {ICONS.categories}
            <span>Categories</span>
          </NavLink>
          <NavLink to="/suppliers" className={navLinkClass}>
            {ICONS.suppliers}
            <span>Suppliers</span>
          </NavLink>
          <NavLink to="/customers" className={navLinkClass}>
            {ICONS.customers}
            <span>Customers</span>
          </NavLink>
        </div>

        <div>
          <SidebarCategory title="Tools" />
          <NavLink to="/import-export" className={navLinkClass}>
            {ICONS.import}
            <span>Import/Export</span>
          </NavLink>
          <NavLink to="/settings" className={navLinkClass}>
            {ICONS.settings}
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};