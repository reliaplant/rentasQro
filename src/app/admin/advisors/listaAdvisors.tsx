"use client";

import { useState, useEffect } from 'react';
import { db } from '@/app/shared/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import EditAdvisor from './editAdvisor';

type Advisor = {
  id: string;
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

export default function ListaAdvisors() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch advisors
        const advisorsQuery = query(collection(db, 'advisors'));
        const advisorsSnapshot = await getDocs(advisorsQuery);
        const advisorsList: Advisor[] = [];
        
        advisorsSnapshot.forEach((doc) => {
          const data = doc.data();
          advisorsList.push({
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            properties: data.properties || 0,
            status: data.status || 'active',
            userId: data.userId || '',
          });
        });
        
        setAdvisors(advisorsList);
        
        // Fetch regular users that are not already advisors
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersList: User[] = [];
        
        // Get existing advisor user IDs for filtering
        const advisorUserIds = advisorsList.map(advisor => advisor.userId);
        
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          // Only add users that are not already advisors
          if (!advisorUserIds.includes(doc.id)) {
            usersList.push({
              id: doc.id,
              name: data.name || '',
              email: data.email || '',
            });
          }
        });
        
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  const handleEditAdvisor = (advisor: Advisor) => {
    setEditingAdvisor(advisor);
  };
  
  const handleAddAdvisor = () => {
    setShowAddModal(true);
  };
  
  const handleCloseModal = () => {
    setEditingAdvisor(null);
    setShowAddModal(false);
  };
  
  const handleAdvisorUpdated = () => {
    // Refresh the advisors list
    setLoading(true);
    setEditingAdvisor(null);
    setShowAddModal(false);
    
    // Refetch data
    async function refetchData() {
      try {
        const advisorsQuery = query(collection(db, 'advisors'));
        const advisorsSnapshot = await getDocs(advisorsQuery);
        const advisorsList: Advisor[] = [];
        
        advisorsSnapshot.forEach((doc) => {
          const data = doc.data();
          advisorsList.push({
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            properties: data.properties || 0,
            status: data.status || 'active',
            userId: data.userId || '',
          });
        });
        
        setAdvisors(advisorsList);
      } catch (error) {
        console.error('Error refetching advisors:', error);
      } finally {
        setLoading(false);
      }
    }
    
    refetchData();
  };
  
  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Cargando asesores...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Asesores Inmobiliarios</h2>
        <button
          onClick={handleAddAdvisor}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Agregar Asesor
        </button>
      </div>
      
      {advisors.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No hay asesores registrados.</p>
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
                  Correo Electrónico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propiedades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {advisors.map((advisor) => (
                <tr key={advisor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{advisor.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{advisor.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{advisor.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{advisor.properties || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${advisor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {advisor.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEditAdvisor(advisor)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {(editingAdvisor || showAddModal) && (
        <EditAdvisor
          advisor={editingAdvisor}
          users={users}
          onClose={handleCloseModal}
          onUpdate={handleAdvisorUpdated}
        />
      )}
    </div>
  );
}
