import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus, Upload } from 'lucide-react';
import { CondoData, ZoneData } from '@/app/interfaces';
import { getZones } from '@/app/services/firebase';
import { condoAmenities } from '@/app/constants/amenities';

interface CondoBasicInfoProps {
  formData: Partial<CondoData>;
  onFormDataChange: (newData: Partial<CondoData>) => void;
  logoFile: File | null;
  onLogoFileChange: (file: File | null) => void;
  logoPreview: string;
  onLogoPreviewChange: (preview: string) => void;
}

export default function CondoBasicInfo({
  formData,
  onFormDataChange,
  logoFile,
  onLogoFileChange,
  logoPreview,
  onLogoPreviewChange
}: CondoBasicInfoProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const portadaInputRef = useRef<HTMLInputElement>(null);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [zoneError, setZoneError] = useState<string | null>(null);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zonesData = await getZones();
        setZones(zonesData);
      } catch (error) {
        setZoneError('Error al cargar las zonas');
      } finally {
        setLoadingZones(false);
      }
    };
    fetchZones();
  }, []);

  return (
    <div className="space-y-12">
      {/* Basic Info Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Información Básica
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Ingresa los detalles principales del condominio
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del condominio
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              className="input1"
              placeholder="Nombre del condominio"
              required
            />
          </div>

          {/* Zone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona
            </label>
            <select
              value={formData.zoneId || ''}
              onChange={(e) => onFormDataChange({ ...formData, zoneId: e.target.value })}
              className="select1"
              disabled={loadingZones}
              required
            >
              <option value="">Seleccionar zona</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Media Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Imágenes del Condominio
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Sube el logo y la imagen de portada del condominio
        </p>

        <div className="relative">
          {/* Portada Upload */}
          <motion.div 
            onClick={() => portadaInputRef.current?.click()}
            className="h-[300px] w-full rounded border-2 border-gray-200 cursor-pointer relative overflow-hidden"
          >
            {formData.portada ? (
              <Image
                src={formData.portada}
                alt="Portada"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">Agregar imagen de portada</p>
                </div>
              </div>
            )}

            {/* Logo Overlay */}
            <div className="absolute top-4 left-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  logoInputRef.current?.click();
                }}
                className="w-24 h-24 bg-white/90  shadow-lg hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex items-center justify-center"
              >
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Logo"
                    fill
                    className="object-contain p-0.5"
                  />
                ) : (
                  <div className="text-center">
                    <Plus size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500">Logo</p>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          <input
            ref={portadaInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  onFormDataChange({
                    ...formData,
                    portada: e.target?.result as string
                  });
                };
                reader.readAsDataURL(file);
              }
            }}
          />

          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onLogoFileChange(file);
                const reader = new FileReader();
                reader.onload = (e) => onLogoPreviewChange(e.target?.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
      </div>

      {/* Description Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Descripción
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Describe el condominio para atraer a potenciales compradores o inquilinos
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción corta
            </label>
            <input
              type="text"
              value={formData.shortDescription || ''}
              onChange={(e) => onFormDataChange({ ...formData, shortDescription: e.target.value })}
              className="input1"
              placeholder="Breve descripción para listados"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción detallada
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              rows={6}
              className="textArea1"
              placeholder="Descripción completa del condominio"
              required
            />
          </div>
        </div>
      </div>

      {/* Amenities Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Amenidades
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Selecciona las amenidades disponibles en el condominio
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {condoAmenities.map((amenity) => (
            <motion.button
              key={amenity.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const current = formData.amenities || [];
                onFormDataChange({
                  ...formData,
                  amenities: current.includes(amenity.id)
                    ? current.filter(id => id !== amenity.id)
                    : [...current, amenity.id]
                });
              }}
              className={`relative p-4 border-2 text-left transition-all ${
                formData.amenities?.includes(amenity.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{amenity.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{amenity.label}</h4>
                  <p className="mt-1 text-xs text-gray-500">{amenity.description}</p>
                </div>
              </div>

              {formData.amenities?.includes(amenity.id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3"
                >
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}