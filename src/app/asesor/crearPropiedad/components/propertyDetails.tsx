"use client";

import { motion } from 'framer-motion';
import type { PropertyData } from '@/app/shared/interfaces'
import { useState, useEffect } from 'react';

interface PropertyDetailsProps {
  data: PropertyData;
  onChange: (newData: Partial<PropertyData>) => void;
  error?: string | null;
  onError?: (error: string | null) => void; // Add this prop
}

export default function PropertyDetails({ data, onChange, error, onError }: PropertyDetailsProps) {
  // State for showing/hiding advanced fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Fix the transactionTypes error by using transactionType instead
  const isRental = data.transactionType === 'renta' || data.transactionType === 'ventaRenta';
  const isHouse = data.propertyType === 'casa';
  const isApartment = data.propertyType === 'departamento';

  // Fix the onChange handler to match the parent component
  const handleChange = (field: keyof PropertyData, value: any) => {
    onChange({ [field]: value });
  };

  // Helper function to safely get boolean values
  const getBooleanValue = (value: boolean | undefined): boolean => {
    return value ?? false;
  };

  // Helper function to safely get number values with default
  const getNumberValue = (value: number | undefined, defaultValue: number): number => {
    return value ?? defaultValue;
  };

  // Add validation for construccionM2
  useEffect(() => {
    if (!data.construccionM2 || data.construccionM2 <= 0) {
      onError?.('Los metros de construcción son requeridos');
    } else {
      onError?.(null);
    }
  }, [data.construccionM2, onError]);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-medium">Detalles de la propiedad</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Description Section - Add this before Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Descripción</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe la propiedad
          </label>
          <textarea
            value={data.descripcion || ''}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-violet-500 focus:border-violet-500"
            placeholder="Describe las características principales de la propiedad..."
          />
          <p className="mt-2 text-sm text-gray-500">
            Incluye detalles importantes como acabados, orientación, vista, etc.
          </p>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h3 className="text-lg font-medium border-b pb-2">Información Básica</h3>
        
        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recámaras</label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleChange('bedrooms', Math.max(1, data.bedrooms - 1))}
              className="border border-gray-300 rounded-l-lg px-3 py-2 text-lg"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={data.bedrooms}
              onChange={(e) => handleChange('bedrooms', parseInt(e.target.value) || 1)}
              className="border-y border-gray-300 py-2 px-3 text-center w-16 focus:ring-violet-500 focus:border-violet-500"
            />
            <button
              type="button"
              onClick={() => handleChange('bedrooms', data.bedrooms + 1)}
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
              onClick={() => handleChange('bathrooms', Math.max(1, data.bathrooms - 0.5))}
              className="border border-gray-300 rounded-l-lg px-3 py-2 text-lg"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              step="0.5"
              value={data.bathrooms}
              onChange={(e) => handleChange('bathrooms', parseFloat(e.target.value) || 1)}
              className="border-y border-gray-300 py-2 px-3 text-center w-16 focus:ring-violet-500 focus:border-violet-500"
            />
            <button
              type="button"
              onClick={() => handleChange('bathrooms', data.bathrooms + 0.5)}
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
              onClick={() => handleChange('parkingSpots', Math.max(0, data.parkingSpots - 1))}
              className="border border-gray-300 rounded-l-lg px-3 py-2 text-lg"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              value={data.parkingSpots}
              onChange={(e) => handleChange('parkingSpots', parseInt(e.target.value) || 0)}
              className="border-y border-gray-300 py-2 px-3 text-center w-16 focus:ring-violet-500 focus:border-violet-500"
            />
            <button
              type="button"
              onClick={() => handleChange('parkingSpots', data.parkingSpots + 1)}
              className="border border-gray-300 rounded-r-lg px-3 py-2 text-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Construction Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año de construcción</label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="unknownYear"
                type="checkbox"
                checked={!data.constructionYear}
                onChange={(e) => handleChange('constructionYear', e.target.checked ? null : new Date().getFullYear())}
                className="h-4 w-4 text-violet-600 rounded"
              />
              <label htmlFor="unknownYear" className="ml-2 text-sm text-gray-700">
                Año desconocido
              </label>
            </div>
            
            {data.constructionYear !== null && (
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={data.constructionYear || ''}
                onChange={(e) => handleChange('constructionYear', parseInt(e.target.value) || null)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-violet-500 focus:border-violet-500"
              />
            )}
          </div>
        </div>

         {/* Conservation state */}
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado de conservación</label>
          <select
            value={data.estadoConservacion || ''}
            onChange={(e) => handleChange('estadoConservacion', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="nuevo">A estrenar</option>
            <option value="como_nuevo">Como nuevo</option>
            <option value="remodelado">Remodelado</option>
            <option value="usado">Usado</option>
            <option value="requiere_renovacion">Requiere renovación</option>
          </select>
        </div>
        
        {/* Only show furnished and pets allowed for rentals */}
        {(data.transactionType === 'renta' || data.transactionType === 'ventaRenta') && (
          <>
            {/* Furnished */}
            <div>
              <div className="flex items-center">
                <input
                  id="furnished"
                  type="checkbox"
                  checked={data.furnished}
                  onChange={(e) => handleChange('furnished', e.target.checked)}
                  className="h-4 w-4 text-violet-600 rounded"
                />
                <label htmlFor="furnished" className="ml-2 text-sm text-gray-700">
                  Amueblado
                </label>
              </div>
            </div>
            
            {/* Pets Allowed */}
            <div className="flex items-center">
              <input
                id="petsAllowed"
                type="checkbox"
                checked={getBooleanValue(data.petsAllowed)}
                onChange={(e) => handleChange('petsAllowed', e.target.checked)}
                className="h-4 w-4 text-violet-600 rounded"
              />
              <label htmlFor="petsAllowed" className="ml-2 text-sm text-gray-700">
                Mascotas permitidas
              </label>
            </div>
          </>
        )}
      </div>

      {/* Layout and spaces */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h3 className="text-lg font-medium border-b pb-2">Distribución y Espacios</h3>
        
        {/* Square meters and Levels */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metros de construcción</label>
            <input
              type="number"
              min="1"
              value={data.construccionM2 || ''}
              onChange={(e) => handleChange('construccionM2', parseInt(e.target.value) || 0)}
              className={`border rounded-lg px-3 py-2 w-full focus:ring-violet-500 focus:border-violet-500 ${
                !data.construccionM2 ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {!data.construccionM2 && (
              <p className="text-sm text-red-600 mt-1">
                Este campo es requerido
              </p>
            )}
          </div>

          {/* House Levels or Apartment Floor */}
          {isHouse ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveles de la casa</label>
              <input
                type="number"
                min="1"
                value={data.nivelesCasa || 1}
                onChange={(e) => handleChange('nivelesCasa', parseInt(e.target.value) || 1)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
          ) : isApartment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Piso del departamento</label>
              <input
                type="number"
                min="1"
                value={data.pisoDepto || 1}
                onChange={(e) => handleChange('pisoDepto', parseInt(e.target.value) || 1)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
          )}
        </div>

        {/* Appliances Section */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Equipamiento</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                id="cocinaEquipada"
                type="checkbox"
                checked={getBooleanValue(data.cocinaEquipada)}
                onChange={(e) => handleChange('cocinaEquipada', e.target.checked)}
                className="h-4 w-4 text-violet-600 rounded"
              />
              <label htmlFor="cocinaEquipada" className="ml-2 text-sm text-gray-700">
                Cocina equipada
              </label>
            </div>

             {/* State and Characteristics */}
    
       
        
        {/* Gas type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de gas</label>
          <select
            value={data.tipoGas || ''}
            onChange={(e) => handleChange('tipoGas', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="">Seleccionar...</option>
            <option value="estacionario">Estacionario</option>
            <option value="natural">Natural</option>
          </select>
        </div>

            <div className="flex items-center">
              <input
                id="calentadorAgua"
                type="checkbox"
                checked={getBooleanValue(data.calentadorAgua)}
                onChange={(e) => handleChange('calentadorAgua', e.target.checked)}
                className="h-4 w-4 text-violet-600 rounded"
              />
              <label htmlFor="calentadorAgua" className="ml-2 text-sm text-gray-700">
                Calentador de agua
              </label>
            </div>
          </div>
        </div>

        {/* Additional spaces */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center">
              <input
                id="cuartoEstudio"
                type="checkbox"
                checked={getBooleanValue(data.cuartoEstudio)}
                onChange={(e) => handleChange('cuartoEstudio', e.target.checked)}
                className="h-4 w-4 text-violet-600 rounded"
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
                checked={getBooleanValue(data.cuartoLavado)}
                onChange={(e) => handleChange('cuartoLavado', e.target.checked)}
                className="h-4 w-4 text-violet-600 rounded"
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
                checked={getBooleanValue(data.balcon)}
                onChange={(e) => handleChange('balcon', e.target.checked)}
                className="h-4 w-4 text-violet-600 rounded"
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
                checked={getBooleanValue(data.jardin)}
                onChange={(e) => handleChange('jardin', e.target.checked)}
                className="h-4 w-4 text-violet-600 rounded"
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
                checked={getBooleanValue(data.roofGarden)}
                onChange={(e) => handleChange('roofGarden', e.target.checked)}
                className="h-4 w-4 text-violet-600 rounded"
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
                checked={getBooleanValue(data.bodega)}
                onChange={(e) => handleChange('bodega', e.target.checked)}
                className="h-4 w-4 text-violet-600 rounded"
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
      
      {/* Construction Details */}
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-medium text-gray-900">Detalles de construcción</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metros cuadrados de construcción
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                name="construccionM2"
                id="construccionM2"
                className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                placeholder="0"
                value={data.construccionM2 || ''}
                onChange={(e) => onChange({
                  ...data,
                  construccionM2: parseInt(e.target.value) || 0
                })}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">m²</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metros cuadrados de terreno
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                name="terrenoM2"
                id="terrenoM2"
                className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                placeholder="0"
                value={data.terrenoM2 || ''}
                onChange={(e) => onChange({
                  ...data,
                  terrenoM2: parseInt(e.target.value) || 0
                })}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">m²</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año de construcción
            </label>
            <input
              type="number"
              name="constructionYear"
              id="constructionYear"
              className="block w-full rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
              placeholder="2023"
              value={data.constructionYear || ''}
              onChange={(e) => onChange({
                ...data,
                constructionYear: parseInt(e.target.value) || null
              })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de conservación
            </label>
            <select
              name="estadoConservacion"
              id="estadoConservacion"
              className="block w-full rounded-md border-gray-300 focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
              value={data.estadoConservacion || 'como_nuevo'}
              onChange={(e) => onChange({
                ...data,
                estadoConservacion: e.target.value as "como_nuevo" | "nuevo" | "remodelado" | "aceptable" | "requiere_reparaciones"
              })}
            >
              <option value="como_nuevo">Como nuevo</option>
              <option value="nuevo">Nuevo</option>
              <option value="remodelado">Remodelado</option>
              <option value="aceptable">Aceptable</option>
              <option value="requiere_reparaciones">Requiere reparaciones</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}