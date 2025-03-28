"use client";

import { useState, useEffect } from 'react';
import { db, createAdminUser } from '@/app/shared/firebase';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';

type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
  userId: string;
};

export default function ListaAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', name: '', userId: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);
  
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      console.log('Fetching admin users...');
      
      const adminsQuery = query(collection(db, 'admins'));
      const adminsSnapshot = await getDocs(adminsQuery);
      
      console.log(`Found ${adminsSnapshot.size} admin documents`);
      
      const adminsList: Admin[] = [];
      
      adminsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Admin ${doc.id}:`, data);
        
        adminsList.push({
          id: doc.id,
          name: data.name || 'Usuario sin nombre',
          email: data.email || 'Sin correo',
          role: data.role || 'admin',
          userId: data.userId || doc.id,
        });
      });
      
      setAdmins(adminsList);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Error al cargar la lista de administradores');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddAdmin = async () => {
    try {
      setError('');
      setSuccess('');
      
      if (!newAdmin.email || !newAdmin.name || !newAdmin.userId) {
        setError('Todos los campos son requeridos');
        return;
      }
      
      await createAdminUser(newAdmin.userId, newAdmin.email, newAdmin.name);
      
      setSuccess('Administrador creado exitosamente');
      setNewAdmin({ email: '', name: '', userId: '' });
      setShowAddModal(false);
      
      // Refresh the list
      fetchAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      setError('Error al crear administrador');
    }
  };
  
  const handleDeleteAdmin = async (adminId: string) => {
    if (window.confirm('¿Está seguro de eliminar este administrador?')) {
      try {
        await deleteDoc(doc(db, 'admins', adminId));
        setSuccess('Administrador eliminado exitosamente');
        fetchAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
        setError('Error al eliminar administrador');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Cargando administradores...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
          <p className="text-green-700">{success}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Administradores</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Añadir Administrador
        </button>
      </div>
      
      {admins.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No hay administradores registrados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{admin.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{admin.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add Admin Modal */}
      {showAddModal && (
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
                      Añadir Nuevo Administrador
                    </h3>
                    
                    <div className="mt-4">
                      <div className="mb-4">
                        <label htmlFor="userId" className="block text-sm font-medium text-gray-700">ID de Usuario</label>
                        <input
                          type="text"
                          id="userId"
                          value={newAdmin.userId}
                          onChange={(e) => setNewAdmin({ ...newAdmin, userId: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                          type="text"
                          id="name"
                          value={newAdmin.name}
                          onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                        <input
                          type="email"
                          id="email"
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddAdmin}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Añadir
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
