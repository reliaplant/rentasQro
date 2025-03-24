import { PropertyData, ZoneData, CondoData } from '@/app/interfaces';

interface PropertyInfoProps {
  property: PropertyData;
  zoneData?: ZoneData;
  condoData?: CondoData;
}

export default function PropertyInfo({ property, zoneData, condoData }: PropertyInfoProps) {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-black font-bold mb-4">
          {property.propertyType} {property.transactionTypes.includes('renta') ? 'en renta' : 'en venta'} en {zoneData?.name || property.zone} {condoData?.name ? `- ${condoData.name}` : ''}
        </h1>
        <div className="flex items-baseline space-x-6">
          <p className="text-1xl font-semibold">
            ${property.price.toLocaleString('es-MX')}
            {property.transactionTypes.includes('renta') && (
              <span className="text-lg font-normal text-gray-500">/mes</span>
            )}
          </p>
          <div className="flex items-center space-x-4 text-lg">
            <span>{property.bedrooms} hab</span>
            <span>·</span>
            <span>{property.bathrooms} baños</span>
            <span>·</span>
            <span>{property.parkingSpots} est</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <section>
        <h2 className="text-lg font-medium mb-4">Características</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ... existing features grid ... */}
        </div>
      </section>
    </div>
  );
}