
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Customer } from '../types';
import { customerService } from '../services/customerService';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ICONS } from '../constants';
import { Modal } from '../components/Modal';

const defaultCustomerState: Omit<Customer, 'id'> = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
};

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | Omit<Customer, 'id'> | null>(defaultCustomerState);
  
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch customers.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleAddNew = () => {
    setEditingCustomer(defaultCustomerState);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      await customerService.deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
      fetchCustomers();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editingCustomer.name) return; // Basic validation

    if ('id' in editingCustomer) {
      await customerService.updateCustomer(editingCustomer.id, editingCustomer);
    } else {
      await customerService.addCustomer(editingCustomer);
    }
    setIsModalOpen(false);
    fetchCustomers();
  };
  
  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
        <Button variant="primary" leftIcon={ICONS.add} onClick={handleAddNew}>Add New Customer</Button>
      </div>

      <div className="p-4 bg-white rounded-lg shadow">
        <Input 
          placeholder="Search by name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          containerClassName="mb-0"
        />
      </div>
      
      {isLoading && customers.length === 0 ? <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div> :
       error ? <div className="text-red-500 text-center p-4 bg-red-100 border border-red-500 rounded">{error}</div> :
       filteredCustomers.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">No customers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.city}, {customer.state}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(customer)} leftIcon={ICONS.edit}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(customer)} leftIcon={ICONS.delete}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={'id' in editingCustomer! ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Name" value={editingCustomer?.name || ''} onChange={e => setEditingCustomer({...editingCustomer!, name: e.target.value})} required />
          <Input label="Email" type="email" value={editingCustomer?.email || ''} onChange={e => setEditingCustomer({...editingCustomer!, email: e.target.value})} />
          <Input label="Phone" value={editingCustomer?.phone || ''} onChange={e => setEditingCustomer({...editingCustomer!, phone: e.target.value})} />
          <Input label="Address" value={editingCustomer?.address || ''} onChange={e => setEditingCustomer({...editingCustomer!, address: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={editingCustomer?.city || ''} onChange={e => setEditingCustomer({...editingCustomer!, city: e.target.value})} required />
            <Input label="State" value={editingCustomer?.state || ''} onChange={e => setEditingCustomer({...editingCustomer!, state: e.target.value})} required />
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!customerToDelete} onClose={() => setCustomerToDelete(null)} title="Confirm Deletion">
        <p>Are you sure you want to delete "<strong>{customerToDelete?.name}</strong>"?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setCustomerToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};