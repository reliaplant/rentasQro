import { PropertyData, ZoneData, CondoData } from '@/app/interfaces';
import { BedDouble, Bath, Car, Sofa, PawPrint, Home, Building2, CalendarIcon, Building, 
  Tv, WashingMachine, Flower, DoorOpen } from 'lucide-react';
import { MdBalcony, MdRoofing } from 'react-icons/md';
import { Fire, RainDrop, Restaurant } from '@carbon/icons-react';

interface PropertyDetailsProps {
  property: PropertyData;
  zoneData?: ZoneData;
  condoData?: CondoData;
}

export default function PropertyDetails({ property, zoneData, condoData }: PropertyDetailsProps) {
  return (
    <div className="space-y-12">
      {/* Header */}
      <section>
        <h1 className="text-2xl text-black font-bold mb-4">
          {property.propertyType} {property.transactionTypes.includes('renta') ? 'en renta' : 'en venta'} en {zoneData?.name || property.zone} {condoData?.name ? `- ${condoData.name}` : ''}
        </h1>
        <div className="flex items-baseline space-x-6">
          <div className="flex items-center space-x-4 text-lg">
            <div className="flex items-center">
              <BedDouble className="w-5 h-5 mr-2 text-gray-500" />
              <span>{property.bedrooms} {property.bedrooms === 1 ? 'habitación' : 'habitaciones'}</span>
            </div>
            <span>·</span>
            <div className="flex items-center">
              <Bath className="w-5 h-5 mr-2 text-gray-500" />
              <span>{property.bathrooms} {property.bathrooms === 1 ? 'baño' : 'baños'}</span>
            </div>
            <span>·</span>
            <div className="flex items-center">
              <Car className="w-5 h-5 mr-2 text-gray-500" />
              <span>{property.parkingSpots} {property.parkingSpots === 1 ? 'estacionamiento' : 'estacionamientos'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Features */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Características básicas</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* ... Copy all basic features grid items ... */}
        </div>
      </section>

      {/* Additional Features */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Comodidades</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* ... Copy all additional features grid items ... */}
        </div>
      </section>

      {/* Services and Equipment */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Equipamiento</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* ... Copy all services and equipment grid items ... */}
        </div>
      </section>
    </div>
  );
}