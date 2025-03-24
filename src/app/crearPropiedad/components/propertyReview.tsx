"use client";

import { motion } from 'framer-motion';
import type { PropertyData } from '@/app/services/firebase';

interface PropertyReviewProps {
  data: PropertyData;
}

export default function PropertyReview({ data }: PropertyReviewProps) {
  return (
    <div className="space-y-8">
      {/* Property Type & Price (Most important) */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tipo de Propiedad</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Tipo</dt>
            <dd className="mt-1 text-sm text-gray-900">{data.propertyType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Transacción</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {data.transactionTypes.join(', ')}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Precio</dt>
            <dd className="mt-1 text-xl font-bold text-gray-900">
              ${data.price.toLocaleString('es-MX')} 
              {data.transactionTypes.includes('renta') ? '/mes' : ''}
            </dd>
          </div>
          {data.transactionTypes.includes('renta') && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Mantenimiento</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {data.maintenanceIncluded ? 'Incluido en renta' : 'No incluido'}
                {!data.maintenanceIncluded && (data.maintenanceCost ?? 0) > 0 && 
                  ` - $${(data.maintenanceCost ?? 0).toLocaleString('es-MX')}/mes`
                }
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Basic Counts */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Características Principales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛏</span>
            <div>
              <div className="font-medium">Recámaras</div>
              <div className="text-2xl font-semibold">{data.bedrooms}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚿</span>
            <div>
              <div className="font-medium">Baños</div>
              <div className="text-2xl font-semibold">{data.bathrooms}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚗</span>
            <div>
              <div className="font-medium">Estacionamientos</div>
              <div className="text-2xl font-semibold">{data.parkingSpots}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Rental Features */}
      {data.transactionTypes?.includes('renta') && (
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Características de Renta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛋</span>
              <div>
                <div className="font-medium">Amueblado</div>
                <div className="text-sm text-gray-500">¿Incluye muebles?</div>
                <div className="mt-1 font-medium">{data.furnished ? 'Sí' : 'No'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl">🐾</span>
              <div>
                <div className="font-medium">Mascotas</div>
                <div className="text-sm text-gray-500">¿Se permiten mascotas?</div>
                <div className="mt-1 font-medium">{data.petsAllowed ? 'Sí' : 'No'}</div>
              </div>
            </div>

            {data.includesUtilities && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔌</span>
                <div>
                  <div className="font-medium">Servicios Incluidos</div>
                  <div className="text-sm text-gray-500">¿El precio incluye servicios?</div>
                  <div className="mt-1 font-medium">
                    {data.includedUtilities?.map(util => ({
                      'wifi': 'WiFi 📶',
                      'water': 'Agua 💧',
                      'electricity': 'Luz ⚡',
                      'gas': 'Gas 🔥'
                    }[util])).join(', ') || 'No'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Amenities */}
      {data.amenities && data.amenities.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Amenidades del Complejo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.amenities.map(amenity => {
              const amenityInfo = {
                'pool': { icon: '🏊‍♂️', label: 'Alberca', desc: 'Área de alberca' },
                'gym': { icon: '💪', label: 'Gimnasio', desc: 'Gimnasio equipado' },
                'workCenter': { icon: '💻', label: 'Work Center', desc: 'Sala de trabajo compartido' }
              }[amenity];

              return amenityInfo ? (
                <div key={amenity} className="flex items-start gap-3">
                  <span className="text-2xl">{amenityInfo.icon}</span>
                  <div>
                    <div className="font-medium">{amenityInfo.label}</div>
                    <div className="text-sm text-gray-500">{amenityInfo.desc}</div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </section>
      )}

      {/* Photos */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fotos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.imageUrls.map((url, index) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={url}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Move construction year to the end and make it less prominent */}
      <section className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-gray-400">Año de Construcción:</span>
          <span className="text-gray-700">
            {data.constructionYear || 'Desconocido'}
          </span>
        </div>
      </section>
    </div>
  );
}