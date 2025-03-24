"use client";

import { motion } from 'framer-motion';
import type { PropertyData } from '@/app/interfaces'
import { useState } from 'react';

interface PropertyDetailsProps {
  data: PropertyData;
  onChange: (field: keyof PropertyData, value: any) => void;
  error?: string | null;
}

export default function PropertyDetails({ data, onChange, error }: PropertyDetailsProps) {
  // State for showing/hiding advanced fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const isRental = data.transactionTypes.includes('renta');
  const isHouse = data.propertyType === 'casa';
  const isApartment = data.propertyType === 'departamento';

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-medium">Detalles de la propiedad</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h3 className="text-lg font-medium border-b pb-2">Información Básica</h3>
        
        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recámaras</label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => onChange('bedrooms', Math.max(1, data.bedrooms - 1))}
              className="border border-gray-300 rounded-l-lg px-3 py-2 text-lg"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={data.bedrooms}
              onChange={(e) => onChange('bedrooms', parseInt(e.target.value) || 1)}
              className="border-y border-gray-300 py-2 px-3 text-center w-16"
            />
            <button
              type="button"
              onClick={() => onChange('bedrooms', data.bedrooms + 1)}
              className="border border-gray-300 rounded-r-lg px-3 py-2 text-lg"
            >
              +
            </button>
          </div>
        </div>
        
        {/* Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => onChange('bathrooms', Math.max(1, data.bathrooms - 0.5))}
              className="border border-gray-300 rounded-l-lg px-3 py-2 text-lg"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              step="0.5"
              value={data.bathrooms}
              onChange={(e) => onChange('bathrooms', parseFloat(e.target.value) || 1)}
              className="border-y border-gray-300 py-2 px-3 text-center w-16"
            />
            <button
              type="button"
              onClick={() => onChange('bathrooms', data.bathrooms + 0.5)}
              className="border border-gray-300 rounded-r-lg px-3 py-2 text-lg"
            >
              +
            </button>
          </div>
        </div>
        
        {/* Parking */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estacionamientos</label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => onChange('parkingSpots', Math.max(0, data.parkingSpots - 1))}
              className="border border-gray-300 rounded-l-lg px-3 py-2 text-lg"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              value={data.parkingSpots}
              onChange={(e) => onChange('parkingSpots', parseInt(e.target.value) || 0)}
              className="border-y border-gray-300 py-2 px-3 text-center w-16"
            />
            <button
              type="button"
              onClick={() => onChange('parkingSpots', data.parkingSpots + 1)}
              className="border border-gray-300 rounded-r-lg px-3 py-2 text-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Construction Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año de construcción</label>
          <input
            type="number"
            value={data.constructionYear}
            onChange={(e) => onChange('constructionYear', parseInt(e.target.value) || new Date().getFullYear())}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          />
        </div>
        
        {/* Furnished */}
        <div>
          <div className="flex items-center">
            <input
              id="furnished"
              type="checkbox"
              checked={data.furnished}
              onChange={(e) => onChange('furnished', e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="furnished" className="ml-2 text-sm text-gray-700">
              Amueblado
            </label>
          </div>
        </div>
        
        {/* Pets Allowed */}
        <div>
          <div className="flex items-center">
            <input
              id="petsAllowed"
              type="checkbox"
              checked={data.petsAllowed}
              onChange={(e) => onChange('petsAllowed', e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="petsAllowed" className="ml-2 text-sm text-gray-700">
              Mascotas permitidas
            </label>
          </div>
        </div>
      </div>

      {/* Property Location Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h3 className="text-lg font-medium border-b pb-2">Ubicación</h3>
        
        {/* Location within property */}
        
        {/* House Levels or Apartment Floor */}
        {isHouse ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niveles de la casa</label>
            <input
              type="number"
              min="1"
              value={data.nivelesCasa || 1}
              onChange={(e) => onChange('nivelesCasa', parseInt(e.target.value) || 1)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            />
          </div>
        ) : isApartment && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Piso del departamento</label>
            <input
              type="number"
              min="1"
              value={data.pisoDepto || 1}
              onChange={(e) => onChange('pisoDepto', parseInt(e.target.value) || 1)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            />
          </div>
        )}
        
       
      </div>

      {/* Layout and spaces */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h3 className="text-lg font-medium border-b pb-2">Distribución y Espacios</h3>
        
        {/* Square meters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metros de construcción</label>
            <input
              type="number"
              min="1"
              value={data.construccionM2 || ''}
              onChange={(e) => onChange('construccionM2', parseInt(e.target.value) || 0)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            />
          </div>
          
         
        </div>
        
        {/* Additional spaces */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center">
              <input
                id="cuartoEstudio"
                type="checkbox"
                checked={data.cuartoEstudio || false}
                onChange={(e) => onChange('cuartoEstudio', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="cuartoEstudio" className="ml-2 text-sm text-gray-700">
                Cuarto de estudio/TV
              </label>
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <input
                id="cuartoLavado"
                type="checkbox"
                checked={data.cuartoLavado || false}
                onChange={(e) => onChange('cuartoLavado', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="cuartoLavado" className="ml-2 text-sm text-gray-700">
                Cuarto de lavado
              </label>
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <input
                id="balcon"
                type="checkbox"
                checked={data.balcon || false}
                onChange={(e) => onChange('balcon', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="balcon" className="ml-2 text-sm text-gray-700">
                Balcón/Terraza
              </label>
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <input
                id="jardin"
                type="checkbox"
                checked={data.jardin || false}
                onChange={(e) => onChange('jardin', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="jardin" className="ml-2 text-sm text-gray-700">
                Jardín/Patio
              </label>
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <input
                id="roofGarden"
                type="checkbox"
                checked={data.roofGarden || false}
                onChange={(e) => onChange('roofGarden', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="roofGarden" className="ml-2 text-sm text-gray-700">
                Roof garden
              </label>
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <input
                id="bodega"
                type="checkbox"
                checked={data.bodega || false}
                onChange={(e) => onChange('bodega', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="bodega" className="ml-2 text-sm text-gray-700">
                Bodega/Almacenamiento
              </label>
            </div>
          </div>
          
          <div>

          </div>
        </div>
      </div>
      
      {/* State and Characteristics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h3 className="text-lg font-medium border-b pb-2">Estado y Características</h3>
        
        {/* Conservation state */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado de conservación</label>
          <select
            value={data.estadoConservacion || ''}
            onChange={(e) => onChange('estadoConservacion', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          >
            <option value="">Seleccionar...</option>
            <option value="nuevo">Nuevo</option>
            <option value="como_nuevo">Como nuevo</option>
            <option value="remodelado">Remodelado</option>
            <option value="usado">Usado</option>
            <option value="requiere_renovacion">Requiere renovación</option>
          </select>
        </div>
        
        {/* Water heater */}

        
        {/* Gas type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de gas</label>
          <select
            value={data.tipoGas || ''}
            onChange={(e) => onChange('tipoGas', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          >
            <option value="">Seleccionar...</option>
            <option value="estacionario">Estacionario</option>
            <option value="natural">Natural</option>
            <option value="ninguno">Ninguno</option>
          </select>
        </div>
        
        {/* Other features */}
        <div className="grid grid-cols-2 gap-4">
          
        </div>
      </div>
      
      {/* Rental Specific Fields */}
      {isRental && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h3 className="text-lg font-medium border-b pb-2">Requisitos de Renta</h3>
          
          {/* Maintenance */}
          <div>
            <div className="flex items-center mb-2">
              <input
                id="maintenanceIncluded"
                type="checkbox"
                checked={data.maintenanceIncluded}
                onChange={(e) => onChange('maintenanceIncluded', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="maintenanceIncluded" className="ml-2 text-sm text-gray-700">
                Mantenimiento incluido
              </label>
            </div>
            
            {!data.maintenanceIncluded && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Costo de mantenimiento (mensual)</label>
                <input
                  type="number"
                  min="0"
                  value={data.maintenanceCost || 0}
                  onChange={(e) => onChange('maintenanceCost', parseInt(e.target.value) || 0)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
              </div>
            )}
          </div>
          
          {/* Utilities */}
          <div>
            

          </div>
          
          {/* Deposit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Depósito (número de mensualidades)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={data.depositoRenta || 1}
              onChange={(e) => onChange('depositoRenta', parseFloat(e.target.value) || 1)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            />
          </div>
          
          {/* Contract */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contrato mínimo (meses)
            </label>
            <input
              type="number"
              min="1"
              value={data.contratoMinimo || 12}
              onChange={(e) => onChange('contratoMinimo', parseInt(e.target.value) || 12)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            />
          </div>
          
          {/* Guarantor */}
          
        </div>
      )}
    </div>
  );
}