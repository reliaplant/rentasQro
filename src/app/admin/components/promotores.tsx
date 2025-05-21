"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '@/app/shared/firebase';

// Fix the Promotor interface with proper typing
interface Promotor {
  id: string;  // Make ID required to avoid type issues
  name: string;
  code: string;
  createdAt?: any;
}

// Type for new promotor (no ID yet)
interface NewPromotor {
  name: string;
  code: string;
  createdAt?: any;
}

export default function ReferidosPage() {
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPromotorName, setNewPromotorName] = useState('');
  const [editingPromotor, setEditingPromotor] = useState<Promotor | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all promotores
  useEffect(() => {
    fetchPromotores();
  }, []);

  const fetchPromotores = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "promotores"));
      const promotoresList: Promotor[] = [];
      
      querySnapshot.forEach((doc) => {
        // Ensure each document has an id
        const data = doc.data();
        promotoresList.push({
          id: doc.id,
          name: data.name || '',
          code: data.code || '',
          createdAt: data.createdAt
        });
      });
      
      setPromotores(promotoresList);
    } catch (error) {
      console.error("Error fetching promotores:", error);
      setError('Error al cargar los promotores');
    } finally {
      setLoading(false);
    }
  };

  // Generate random 4-character code
  const generateRandomCode = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Create a new promotor - Updated to use setDoc with custom ID
  const handleCreatePromotor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPromotorName.trim()) {
      setError('El nombre del promotor es requerido');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Generate normalized name without spaces/special chars
      const normalizedName = newPromotorName.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      
      // Check if name already exists (case insensitive)
      const exists = promotores.some(p => 
        p.name.toLowerCase() === newPromotorName.trim().toLowerCase()
      );
      
      if (exists) {
        setError('Ya existe un promotor con ese nombre');
        setLoading(false);
        return;
      }
      
      // Generate the 4-character code
      const code = generateRandomCode();
      
      // Create document ID by concatenating code and normalized name
      const promotorId = `${code}-${normalizedName}`;
      
      // Create new promotor object
      const newPromotor: NewPromotor = {
        name: newPromotorName.trim(),
        code: code,
        createdAt: Timestamp.now()
      };
      
      // Use setDoc instead of addDoc to specify the document ID
      const promotorRef = doc(db, "promotores", promotorId);
      await setDoc(promotorRef, newPromotor);
      
      setSuccess('Promotor creado correctamente');
      setNewPromotorName('');
      fetchPromotores();
    } catch (error) {
      console.error("Error creating promotor:", error);
      setError('Error al crear el promotor');
    } finally {
      setLoading(false);
    }
  };

  // Update a promotor
  const handleUpdatePromotor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPromotor) {
      setError('No hay promotor seleccionado para editar');
      return;
    }
    
    if (!editingPromotor.name.trim()) {
      setError('El nombre del promotor es requerido');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const promotorRef = doc(db, "promotores", editingPromotor.id);
      await updateDoc(promotorRef, {
        name: editingPromotor.name.trim()
      });
      
      setSuccess('Promotor actualizado correctamente');
      setEditingPromotor(null);
      fetchPromotores();
    } catch (error) {
      console.error("Error updating promotor:", error);
      setError('Error al actualizar el promotor');
    } finally {
      setLoading(false);
    }
  };

  // Delete a promotor
  const handleDeletePromotor = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este promotor?')) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await deleteDoc(doc(db, "promotores", id));
      
      setSuccess('Promotor eliminado correctamente');
      fetchPromotores();
    } catch (error) {
      console.error("Error deleting promotor:", error);
      setError('Error al eliminar el promotor');
    } finally {
      setLoading(false);
    }
  };

  // Safely set the editing promotor
  const handleEditPromotor = (promotor: Promotor) => {
    setEditingPromotor({
      id: promotor.id,
      name: promotor.name,
      code: promotor.code,
      createdAt: promotor.createdAt
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Gestión de Promotores</h1>
      
      {/* Notification messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {/* Create Promotor Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-4">Crear Nuevo Promotor</h2>
        <form onSubmit={handleCreatePromotor} className="flex space-x-4">
          <input
            type="text"
            value={newPromotorName}
            onChange={(e) => setNewPromotorName(e.target.value)}
            placeholder="Nombre del promotor"
            className="flex-1 border border-gray-300 p-2 rounded-md"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Promotor'}
          </button>
        </form>
      </div>
      
      {/* Promotores List */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Lista de Promotores</h2>
        
        {loading && promotores.length === 0 ? (
          <p className="text-gray-500">Cargando promotores...</p>
        ) : promotores.length === 0 ? (
          <p className="text-gray-500">No hay promotores registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promotores.map((promotor) => (
                  <tr key={promotor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingPromotor?.id === promotor.id ? (
                        <input
                          type="text"
                          value={editingPromotor.name}
                          onChange={(e) => {
                            if (editingPromotor) {
                              setEditingPromotor({
                                ...editingPromotor,
                                name: e.target.value
                              });
                            }
                          }}
                          className="border border-gray-300 p-1 rounded-md w-full"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{promotor.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono bg-gray-100 p-1 rounded inline-block">
                        {promotor.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingPromotor?.id === promotor.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdatePromotor}
                            className="text-indigo-600 hover:text-indigo-900"
                            disabled={loading}
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingPromotor(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPromotor(promotor)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeletePromotor(promotor.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={loading}
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
