'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/app/shared/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Desarrolladora } from '@/app/shared/interfaces';
import { getDesarrolladoras, addDesarrolladora, updateDesarrolladora, deleteDesarrolladora } from '@/app/shared/firebase';

export default function DesarrolladorasPage() {
  const [desarrolladoras, setDesarrolladoras] = useState<Desarrolladora[]>([]);
  const [newDesarrolladora, setNewDesarrolladora] = useState<Desarrolladora>({
    name: '',
    descripcion: ''
  });
  const [editMode, setEditMode] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDesarrolladoras();
  }, []);

  const loadDesarrolladoras = async () => {
    try {
      setLoading(true);
      const data = await getDesarrolladoras();
      setDesarrolladoras(data);
    } catch (error) {
      alert('Error al cargar desarrolladoras');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('La imagen no debe superar 5MB');
      }

      setUploading(true);
      
      // Asegúrate de que el path sea válido y único
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const fullPath = `desarrolladoras/${filename}`;
      const storageRef = ref(storage, fullPath);

      // Subir archivo
      const uploadResult = await uploadBytes(storageRef, file);
      // Obtener URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(error instanceof Error ? error.message : 'Error al subir el logo');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    id?: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await handleFileUpload(file);
      
      if (id) {
        // Actualizar desarrolladora existente
        const updated = desarrolladoras.map(d => 
          d.id === id ? {...d, logoURL: url} : d
        );
        setDesarrolladoras(updated);
      } else {
        // Nueva desarrolladora
        setNewDesarrolladora({...newDesarrolladora, logoURL: url});
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al subir el logo');
    }
  };

  const handleNewDesarrolladora = async () => {
    try {
      if (!newDesarrolladora.name) {
        alert('El nombre es obligatorio');
        return;
      }
      await addDesarrolladora(newDesarrolladora);
      setNewDesarrolladora({ name: '', descripcion: '' });
      loadDesarrolladoras();
    } catch (error) {
      alert('Error al agregar desarrolladora');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const desarrolladora = desarrolladoras.find(d => d.id === id);
      if (!desarrolladora) return;
      
      // Remover la propiedad id antes de actualizar
      const { id: _, ...dataToUpdate } = desarrolladora;
      await updateDesarrolladora(id, dataToUpdate);
      setEditMode({ ...editMode, [id]: false });
      loadDesarrolladoras();
    } catch (error) {
      alert('Error al actualizar desarrolladora');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta desarrolladora?')) return;
    try {
      await deleteDesarrolladora(id);
      loadDesarrolladoras();
    } catch (error) {
      alert('Error al eliminar desarrolladora');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Desarrolladoras</h1>
      
      {/* Formulario simple para nueva desarrolladora */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow space-y-4">
        <input
          type="text"
          placeholder="Nombre de la desarrolladora"
          className="w-full p-2 border rounded"
          value={newDesarrolladora.name}
          onChange={e => setNewDesarrolladora({...newDesarrolladora, name: e.target.value})}
        />
        <textarea
          placeholder="Descripción"
          className="w-full p-2 border rounded"
          value={newDesarrolladora.descripcion || ''}
          onChange={e => setNewDesarrolladora({...newDesarrolladora, descripcion: e.target.value})}
        />
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e)}
              className="w-full"
              disabled={uploading}
            />
            {uploading && (
              <div className="text-sm text-blue-600 mt-1">
                Subiendo imagen...
              </div>
            )}
          </div>
          <button
            onClick={handleNewDesarrolladora}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={uploading}
          >
            Agregar Desarrolladora
          </button>
        </div>
      </div>

      {/* Lista de desarrolladoras */}
      <div className="space-y-4">
        {desarrolladoras.map((desarrolladora) => (
          <div key={desarrolladora.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-20 h-20 flex-shrink-0">
                {desarrolladora.logoURL ? (
                  <img
                    src={desarrolladora.logoURL}
                    alt={desarrolladora.name}
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-400">Sin logo</span>
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1">
                {editMode[desarrolladora.id!] ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={desarrolladora.name}
                      onChange={e => {
                        const updated = desarrolladoras.map(d => 
                          d.id === desarrolladora.id ? {...d, name: e.target.value} : d
                        );
                        setDesarrolladoras(updated);
                      }}
                      className="w-full p-2 border rounded"
                    />
                    <textarea
                      value={desarrolladora.descripcion || ''}
                      onChange={e => {
                        const updated = desarrolladoras.map(d => 
                          d.id === desarrolladora.id ? {...d, descripcion: e.target.value} : d
                        );
                        setDesarrolladoras(updated);
                      }}
                      className="w-full p-2 border rounded"
                      rows={3}
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, desarrolladora.id)}
                          className="w-full"
                          disabled={uploading}
                        />
                        {uploading && (
                          <div className="text-sm text-blue-600 mt-1">
                            Subiendo imagen...
                          </div>
                        )}
                      </div>
                      {/* Preview del logo actual */}
                      {desarrolladora.logoURL && (
                        <div className="w-16 h-16">
                          <img
                            src={desarrolladora.logoURL}
                            alt="Logo actual"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(desarrolladora.id!)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditMode({ ...editMode, [desarrolladora.id!]: false });
                          loadDesarrolladoras();
                        }}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold">{desarrolladora.name}</h3>
                    <p className="text-gray-600 mt-1">{desarrolladora.descripcion}</p>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setEditMode({ ...editMode, [desarrolladora.id!]: true })}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(desarrolladora.id!)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
