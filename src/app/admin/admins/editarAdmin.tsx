"use client";

import { useState } from 'react';
import { auth, db, checkIfUserExists } from '@/app/shared/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface EditarAdminProps {
  onClose: () => void;
}

export default function EditarAdmin({ onClose }: EditarAdminProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userFound, setUserFound] = useState(false);
  const [userData, setUserData] = useState<{ name: string; id: string } | null>(null);

  const checkUserExists = async () => {
    setLoading(true);
    setError('');
    try {
      const exists = await checkIfUserExists(email);
      if (exists) {
        setUserData({
          name: email.split('@')[0],
          id: email.replace(/[.#$]/g, '_'),
        });
        setUserFound(true);
      } else {
        setError('Usuario no encontrado');
        setUserFound(false);
      }
    } catch (error) {
      setError('Error al buscar usuario');
      setUserFound(false);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!userData) return;

    try {
      await setDoc(doc(db, 'adminRoles', userData.id), {
        id: userData.id,
        name: userData.name,
        email: email,
      });
      onClose();
    } catch (error) {
      setError('Error al crear administrador');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Agregar Administrador</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          {!userFound ? (
            <button
              onClick={checkUserExists}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            >
              {loading ? 'Buscando...' : 'Buscar Usuario'}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
            >
              Crear Administrador
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full mt-2 bg-gray-200 text-gray-800 p-2 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
