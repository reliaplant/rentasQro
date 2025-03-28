"use client";

import { useState, useEffect } from 'react';
import { db } from '@/app/shared/firebase';
import { doc, setDoc, collection, addDoc, updateDoc } from 'firebase/firestore';

type Advisor = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  properties?: number;
  status: 'active' | 'inactive';
  userId: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

type EditAdvisorProps = {
  advisor: Advisor | null;
  users: User[];
  onClose: () => void;
  onUpdate: () => void;
};

export default function EditAdvisor({ advisor, users, onClose, onUpdate }: EditAdvisorProps) {
  const [formData, setFormData] = useState<Advisor>({
    name: '',
    email: '',
    phone: '',
    properties: 0,
    status: 'active',
    userId: '',
  });
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (advisor) {
      setFormData({
        ...advisor,
      });
      setSelectedUser(advisor.userId);
    }
  }, [advisor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    
    // Find the selected user to get name and email
    const user = users.find((u) => u.id === userId);
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        userId: userId
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (advisor?.id) {
        // Update existing advisor
        await updateDoc(doc(db, 'advisors', advisor.id), {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          status: formData.status,
          userId: formData.userId,
        });
      } else {
        // Create new advisor
        if (!selectedUser) {
          throw new Error('Debe seleccionar un usuario');
        }
        
        await addDoc(collection(db, 'advisors'), {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          properties: 0,
          status: 'active',
          userId: selectedUser,
          createdAt: new Date()
        });
        
        // Update the user document to mark as advisor
        await updateDoc(doc(db, 'users', selectedUser), {
          isAdvisor: true
        });
      }

      onUpdate();
    } catch (error: any) {
      console.error('Error saving advisor:', error);
      setError(error.message || 'Error al guardar el asesor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {advisor ? 'Editar Asesor' : 'Agregar Nuevo Asesor'}
                </h3>
                
                {error && (
                  <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="mt-4">
                  {!advisor && (
                    <div className="mb-4">
                      <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                        Seleccionar Usuario
                      </label>
                      <select
                        id="user"
                        name="user"
                        value={selectedUser}
                        onChange={handleUserSelect}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option value="">Seleccione un usuario</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                      readOnly={!advisor}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                      readOnly={!advisor}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  {advisor && (
                    <div className="mb-4">
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Estado
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
