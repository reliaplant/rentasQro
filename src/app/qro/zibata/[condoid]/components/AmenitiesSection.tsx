'use client';

import React from 'react';
import { Building, Education, Fire, Temperature, Box, Sprout, Tree } from '@carbon/icons-react';
import { Shield, WashingMachine } from 'lucide-react';
import { condoAmenities } from '@/app/constants/amenities';

interface AmenitiesSectionProps {
  amenities: string[];
}

const AmenityCard = ({ label, icon }: { label: string; icon: JSX.Element }) => (
  <div className="flex flex-col items-center gap-3 py-4">
    {React.cloneElement(icon, { 
      size: 48,
      className: 'text-gray-500'
    })}
    <span className="text-sm text-gray-600 text-center">
      {label}
    </span>
  </div>
);

export default function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  const getAmenityIcon = (label: string) => {
    switch (label) {
      case 'General':
        return <Building />;
      case 'Alberca':
        return <WashingMachine />;
      case 'Gimnasio':
        return <Education />;
      case 'Salón de eventos':
        return <Building />;
      case 'Área de asadores':
        return <Fire />;
      case 'Sauna':
        return <Temperature />;
      case 'Business Center':
        return <Box />;
      case 'Parque infantil':
        return <Sprout />;
      case 'Ludoteca':
        return <Tree />;
      case 'Vigilancia':
        return <Shield />;
      case 'Areas verdes':
        return <Sprout />;
      default:
        return <Building />;
    }
  };

  return (
    <div className="mt-8 mb-12">
      <div className="flex items-center gap-2 mb-8">
        <h3 className="text-lg font-semibold">Amenidades disponibles</h3>
        <span className="text-sm text-gray-500">({amenities.length})</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {(amenities || []).map((amenityId) => {
          const amenityDetails = condoAmenities.find(a => a.id === amenityId);
          if (!amenityDetails) return null;

          return (
            <AmenityCard
              key={amenityId}
              label={amenityDetails.label}
              icon={getAmenityIcon(amenityDetails.label)}
            />
          );
        })}
      </div>

      {(!amenities || amenities.length === 0) && (
        <p className="text-sm text-gray-500 italic mt-4">No hay amenidades registradas</p>
      )}
    </div>
  );
}
