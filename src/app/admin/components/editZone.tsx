import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ZoneData } from '@/app/interfaces';
import { addZone, updateZone } from '@/app/services/firebase';

interface EditZoneProps {
  zone?: ZoneData;
  onClose: () => void;
  onSave: () => void;
}

export default function EditZone({ zone, onClose, onSave }: EditZoneProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(zone?.imageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<ZoneData>>({
    name: zone?.name || '',
    shortDescription: zone?.shortDescription || '',
    longDescription: zone?.longDescription || ''
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (zone?.id) {
        await updateZone(zone.id, formData, imageFile || undefined);
      } else {
        if (!imageFile) throw new Error('La imagen es requerida');
        await addZone({
          ...formData as ZoneData,
          imageUrl: '',
          condominiums: []
        }, imageFile);
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
      className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full"
    >
      <h2 className="text-2xl font-semibold mb-6">
        {zone ? 'Editar Zona' : 'Nueva Zona'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-gray-500">Agregar imagen</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">Imagen de la zona</h3>
              <p className="text-sm text-gray-500 mb-2">
                Sube una imagen representativa de la zona
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Cambiar imagen
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la zona
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción corta
            </label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción detallada
            </label>
            <textarea
              value={formData.longDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Actions */}
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