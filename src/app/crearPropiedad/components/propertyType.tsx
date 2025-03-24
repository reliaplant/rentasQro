"use client";

import { motion } from 'framer-motion';
import type { PropertyData } from '@/app/interfaces'; 
import { useState, useEffect } from 'react';
import { getZones, getCondosByZone } from '@/app/services/firebase';
import { ZoneData, CondoData } from '@/app/interfaces';

interface PropertyTypeProps {
  data: Pick<PropertyData, 'propertyType' | 'transactionTypes' | 'price' | 'maintenanceIncluded' | 'maintenanceCost' | 'zone' | 'privateComplex'>;
  onChange: (field: keyof PropertyData, value: any) => void;
  error?: string | null;
}

export default function PropertyType({ data, onChange, error }: PropertyTypeProps) {
  const propertyTypes = [
    { value: 'casa', label: 'Casa', icon: '🏠', description: 'Casa unifamiliar o en condominio' },
    { value: 'departamento', label: 'Departamento', icon: '🏢', description: 'Apartamento o flat' }
  ];

  const transactionTypes = [
    { value: 'renta', label: 'Renta', icon: '📝', description: 'Disponible para arrendar' },
    { value: 'venta', label: 'Venta', icon: '🏷', description: 'Disponible para comprar' },
    { value: 'ambos', label: 'Renta y Venta', icon: '💰', description: 'Disponible para ambas opciones' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleTransactionTypeChange = (value: string) => {
    if (value === 'ambos') {
      onChange('transactionTypes', ['renta', 'venta']);
    } else {
      onChange('transactionTypes', [value]);
    }
  };

  const isTransactionSelected = (value: string) => {
    if (value === 'ambos') {
      return data.transactionTypes?.length === 2;
    }
    return data.transactionTypes?.includes(value);
  };

  const [zones, setZones] = useState<ZoneData[]>([]);
  const [condos, setCondos] = useState<CondoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zonesData = await getZones();
        setZones(zonesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching zones:', error);
      }
    };
    fetchZones();
  }, []);

  useEffect(() => {
    const fetchCondos = async () => {
      if (data.zone) {
        try {
          const condosData = await getCondosByZone(data.zone);
          setCondos(condosData);
        } catch (error) {
          console.error('Error fetching condos:', error);
        }
      } else {
        setCondos([]);
      }
    };
    fetchCondos();
  }, [data.zone]);

  return (
    <div className="space-y-12">
      {/* Property Type Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Tipo de Propiedad
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Selecciona el tipo de inmueble que deseas publicar
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {propertyTypes.map((type) => (
            <motion.button
              key={type.value}
              onClick={() => onChange('propertyType', type.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-6 border-2 rounded-xl text-left transition-all ${
                data.propertyType === type.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{type.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{type.label}</h4>
                  <p className="mt-1 text-sm text-gray-500">{type.description}</p>
                </div>
              </div>
              {data.propertyType === type.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4"
                >
                  <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Transaction Type Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Tipo de Operación
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Define si la propiedad está disponible para renta, venta o ambas
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transactionTypes.map((type) => (
            <motion.button
              key={type.value}
              onClick={() => handleTransactionTypeChange(type.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-6 border-2 rounded-xl text-left transition-all ${
                isTransactionSelected(type.value)
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{type.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{type.label}</h4>
                  <p className="mt-1 text-sm text-gray-500">{type.description}</p>
                </div>
              </div>
              {isTransactionSelected(type.value) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4"
                >
                  <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Price Section */}
      {(data.propertyType && data.transactionTypes?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Precio {data.transactionTypes.includes('renta') ? 'Mensual' : 'de Venta'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Define el precio {data.transactionTypes.includes('renta') ? 'de renta mensual' : 'de venta'}
            </p>
            <div className="relative mt-2 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={data.price || ''}
                onChange={(e) => onChange('price', Number(e.target.value))}
                className="block w-full rounded-md border-0 py-3 pl-8 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="0"
                min="0"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">MXN</span>
              </div>
            </div>
          </div>

          {/* Maintenance Section - Only for rentals */}
          {data.transactionTypes.includes('renta') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Mantenimiento Incluido</h4>
                  <p className="text-sm text-gray-500">¿El precio incluye mantenimiento?</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange('maintenanceIncluded', !data.maintenanceIncluded)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    data.maintenanceIncluded ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    data.maintenanceIncluded ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {!data.maintenanceIncluded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    Costo de Mantenimiento Mensual
                  </label>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={data.maintenanceCost || ''}
                      onChange={(e) => onChange('maintenanceCost', Number(e.target.value))}
                      className="block w-full rounded-md border-0 py-3 pl-8 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      placeholder="0"
                      min="0"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">MXN</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          <div className="space-y-4 mt-6">
            {/* Zone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zona
              </label>
              <select
                value={data.zone}
                onChange={(e) => onChange('zone', e.target.value)}
                className="block w-full rounded-md border-0 py-3 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
              >
                <option value="">Selecciona una zona</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Condominium Selection */}
            {data.zone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condominio
                </label>
                <select
                  value={data.privateComplex}
                  onChange={(e) => onChange('privateComplex', e.target.value)}
                  className="block w-full rounded-md border-0 py-3 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                >
                  <option value="">Selecciona un condominio</option>
                  {condos.map((condo) => (
                    <option key={condo.id} value={condo.id}>
                      {condo.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-2"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}