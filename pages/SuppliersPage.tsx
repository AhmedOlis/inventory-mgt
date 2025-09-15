import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Supplier } from '../types';
import { supplierService } from '../services/supplierService';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ICONS } from '../constants';
import { Modal } from '../components/Modal';

const defaultSupplierState: Omit<Supplier, 'id'> = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
};

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | Omit<Supplier, 'id'> | null>(defaultSupplierState);
  const [modalError, setModalError] = useState<string | null>(null);

  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await supplierService.getSuppliers();
      setSuppliers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch suppliers.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleAddNew = () => {
    setEditingSupplier(defaultSupplierState);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
  };

  const confirmDelete = async () => {
    if (supplierToDelete) {
      try {
        await supplierService.deleteSupplier(supplierToDelete.id);
        setSupplierToDelete(null);
        fetchSuppliers();
      } catch(err: any) {
        setError(err.message || `Failed to delete ${supplierToDelete.name}.`);
        setSupplierToDelete(null);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier || !editingSupplier.name.trim()) {
        setModalError("Supplier name cannot be empty.");
        return;
    };
    
    setModalError(null);

    try {
      if ('id' in editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, editingSupplier);
      } else {
        await supplierService.addSupplier(editingSupplier);
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch(err: any) {
        setModalError(err.message || 'An unknown error occurred.');
    }
  };
  
  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [suppliers, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
        <Button variant="primary" leftIcon={ICONS.add} onClick={handleAddNew}>Add New Supplier</Button>
      </div>

      {error && <div className="text-red-500 text-center p-4 bg-red-100 border border-red-500 rounded">{error}</div>}

      <div className="p-4 bg-white rounded-lg shadow">
        <Input 
          placeholder="Search by name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          containerClassName="mb-0"
        />
      </div>
      
      {isLoading && suppliers.length === 0 ? <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div> :
       filteredSuppliers.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">No suppliers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.map(supplier => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.contactPerson}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.city}, {supplier.state}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)} leftIcon={ICONS.edit}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(supplier)} leftIcon={ICONS.delete}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSupplier && 'id' in editingSupplier ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSave} className="space-y-4">
          {modalError && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md text-sm">{modalError}</div>}
          <Input label="Supplier Name" value={editingSupplier?.name || ''} onChange={e => setEditingSupplier({...editingSupplier!, name: e.target.value})} required />
          <Input label="Contact Person" value={editingSupplier?.contactPerson || ''} onChange={e => setEditingSupplier({...editingSupplier!, contactPerson: e.target.value})} />
          <Input label="Email" type="email" value={editingSupplier?.email || ''} onChange={e => setEditingSupplier({...editingSupplier!, email: e.target.value})} />
          <Input label="Phone" value={editingSupplier?.phone || ''} onChange={e => setEditingSupplier({...editingSupplier!, phone: e.target.value})} />
          <Input label="Address" value={editingSupplier?.address || ''} onChange={e => setEditingSupplier({...editingSupplier!, address: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={editingSupplier?.city || ''} onChange={e => setEditingSupplier({...editingSupplier!, city: e.target.value})} required />
            <Input label="State" value={editingSupplier?.state || ''} onChange={e => setEditingSupplier({...editingSupplier!, state: e.target.value})} required />
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!supplierToDelete} onClose={() => setSupplierToDelete(null)} title="Confirm Deletion">
        <p>Are you sure you want to delete "<strong>{supplierToDelete?.name}</strong>"?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setSupplierToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};