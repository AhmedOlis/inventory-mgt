import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Category } from '../types';
import { categoryService } from '../services/categoryService';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ICONS } from '../constants';
import { Modal } from '../components/Modal';

const defaultCategoryState: Omit<Category, 'id'> = {
  name: '',
};

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | Omit<Category, 'id'> | null>(defaultCategoryState);
  const [modalError, setModalError] = useState<string | null>(null);
  
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddNew = () => {
    setEditingCategory(defaultCategoryState);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setError(null); // Clear main page error
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await categoryService.deleteCategory(categoryToDelete.id);
        setCategoryToDelete(null);
        fetchCategories();
      } catch (err: any) {
         setError(err.message);
         setCategoryToDelete(null); // Close modal on error
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) {
        setModalError("Category name cannot be empty.");
        return;
    };

    try {
      if ('id' in editingCategory) {
        await categoryService.updateCategory(editingCategory.id, { name: editingCategory.name });
      } else {
        await categoryService.addCategory({ name: editingCategory.name });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
        setModalError(err.message);
    }
  };
  
  const filteredCategories = useMemo(() => {
    return categories
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Product Categories</h1>
        <Button variant="primary" leftIcon={ICONS.add} onClick={handleAddNew}>Add New Category</Button>
      </div>

       {error && <div className="text-red-500 text-center p-4 bg-red-100 border border-red-500 rounded">{error}</div>}

      <div className="p-4 bg-white rounded-lg shadow">
        <Input 
          placeholder="Search by category name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          containerClassName="mb-0"
        />
      </div>
      
      {isLoading && categories.length === 0 ? <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div> :
       filteredCategories.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">No categories found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map(category => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(category)} leftIcon={ICONS.edit}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(category)} leftIcon={ICONS.delete}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory && 'id' in editingCategory ? 'Edit Category' : 'Add New Category'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input 
            label="Category Name" 
            value={editingCategory?.name || ''} 
            onChange={e => {
                setEditingCategory({...editingCategory!, name: e.target.value});
                if(modalError) setModalError(null);
            }} 
            error={modalError || undefined}
            required 
            />
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!categoryToDelete} onClose={() => setCategoryToDelete(null)} title="Confirm Deletion">
        <p>Are you sure you want to delete the category "<strong>{categoryToDelete?.name}</strong>"? This action cannot be undone.</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setCategoryToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};