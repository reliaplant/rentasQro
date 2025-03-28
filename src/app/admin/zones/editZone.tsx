import { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoneData } from '@/app/shared/interfaces';
import { addZone, updateZone } from '@/app/shared/firebase';

interface EditZoneProps {
  zone?: ZoneData;
  onClose: () => void;
  onSave: () => void;
}

export default function EditZone({ zone, onClose, onSave }: EditZoneProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(zone?.name || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (zone?.id) {
        await updateZone(zone.id, { name });
      } else {
        await addZone({ name });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full"
    >
      <h2 className="text-2xl font-semibold mb-6">
        {zone ? 'Editar Zona' : 'Nueva Zona'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la zona
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}