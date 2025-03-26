"use client";

import { PropertyData } from '@/app/interfaces';
import { formatCurrency } from '@/app/utils/format';

interface PropertyReviewProps {
  data: PropertyData;
  onChange: (newData: Partial<PropertyData>) => void;
}

export default function PropertyReview({ data, onChange }: PropertyReviewProps) {
  // Helper function to format transaction type
  const getTransactionTypeLabel = (type: 'renta' | 'venta' | 'ventaRenta'): string => {
    switch (type) {
      case 'renta':
        return 'Renta';
      case 'venta':
        return 'Venta';
      case 'ventaRenta':
        return 'Venta y Renta';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Revisa los detalles de la propiedad</h2>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Información General</h3>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tipo de Propiedad</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {data.propertyType}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tipo de Transacción</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {getTransactionTypeLabel(data.transactionType)}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Precio</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatCurrency(data.price)}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {data.zone} {data.condo ? `- ${data.condo}` : ''}
              </dd>
            </div>
            
            {/* Basic Details */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Detalles Básicos</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>{data.bedrooms} Recámara(s)</li>
                  <li>{data.bathrooms} Baño(s)</li>
                  <li>{data.parkingSpots} Estacionamiento(s)</li>
                  {data.construccionM2 && <li>{data.construccionM2} m² de construcción</li>}
                  {data.furnished && <li>Amueblado</li>}
                  {data.petsAllowed && <li>Mascotas permitidas</li>}
                  {data.constructionYear ? (
                    <li>Año de construcción: {data.constructionYear}</li>
                  ) : (
                    <li>Año de construcción: Desconocido</li>
                  )}
                </ul>
              </dd>
            </div>

            {/* Additional Features */}
            {(data.cuartoEstudio || data.cuartoLavado || data.balcon || data.jardin || data.roofGarden || data.bodega) && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Características Adicionales</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul className="list-disc pl-5 space-y-1">
                    {data.cuartoEstudio && <li>Cuarto de estudio/TV</li>}
                    {data.cuartoLavado && <li>Cuarto de lavado</li>}
                    {data.balcon && <li>Balcón/Terraza</li>}
                    {data.jardin && <li>Jardín/Patio</li>}
                    {data.roofGarden && <li>Roof garden</li>}
                    {data.bodega && <li>Bodega</li>}
                  </ul>
                </dd>
              </div>
            )}

            {/* Rental Specific Details */}
            {(data.transactionType === 'renta' || data.transactionType === 'ventaRenta') && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Detalles de Renta</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul className="list-disc pl-5 space-y-1">
                    {data.depositoRenta && <li>Depósito: {data.depositoRenta} mes(es)</li>}
                    {data.contratoMinimo && <li>Contrato mínimo: {data.contratoMinimo} mes(es)</li>}
                    {data.maintenanceIncluded ? (
                      <li>Mantenimiento incluido</li>
                    ) : (
                      data.maintenanceCost && <li>Mantenimiento: {formatCurrency(data.maintenanceCost)}/mes</li>
                    )}
                    {data.servicesIncluded && (
                      <li>
                        Servicios incluidos:
                        <ul className="list-disc pl-5 mt-1">
                          {data.includesWater && <li>Agua</li>}
                          {data.includesElectricity && <li>Electricidad</li>}
                          {data.includesGas && <li>Gas</li>}
                          {data.includesWifi && <li>Internet/WiFi</li>}
                        </ul>
                      </li>
                    )}
                  </ul>
                </dd>
              </div>
            )}

            {/* Description */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Descripción</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                {data.descripcion}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}