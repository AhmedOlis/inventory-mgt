
import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_NAME, ICONS } from '../constants';

export const Navbar: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${
      isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-blue-600 hover:text-white'
    }`;

  return (
    <nav className="bg-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/dashboard" className="flex-shrink-0 text-white text-xl font-bold">
              {APP_NAME}
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/dashboard" className={navLinkClass}>
                <span>Dashboard</span>
              </NavLink>
               <NavLink to="/suppliers" className={navLinkClass}>
                {ICONS.suppliers}
                <span>Suppliers</span>
              </NavLink>
              <NavLink to="/customers" className={navLinkClass}>
                {ICONS.customers}
                <span>Customers</span>
              </NavLink>
              <NavLink to="/products/new" className={navLinkClass}>
                {ICONS.add}
                <span>Add Product</span>
              </NavLink>
              <NavLink to="/scan" className={navLinkClass}>
                {ICONS.scan}
                <span>Scan Barcode</span>
              </NavLink>
              <NavLink to="/import-export" className={navLinkClass}>
                {ICONS.import}
                <span>Import/Export</span>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};