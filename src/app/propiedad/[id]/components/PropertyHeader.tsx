import { PropertyData, ZoneData, CondoData } from '@/app/interfaces';
import { 
  BiDoorOpen, 
  BiBath, 
  BiCar, 
  BiHome, 
  BiBuildings, 
  BiMoney, 
  BiKey,
  BiMap
} from 'react-icons/bi';

interface PropertyHeaderProps {
  property: PropertyData;
  zoneData: ZoneData | null;
  condoData: CondoData | null;
}

export default function PropertyHeader({ property, zoneData, condoData }: PropertyHeaderProps) {
  // Format property details
  const isRental = property.transactionTypes.includes('renta');
  const propertyTypeFormatted = 
    property.propertyType === 'casa' ? 'Casa' : 
    property.propertyType === 'depa' ? 'Departamento' : 
    property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1);
    
  // Format price as currency but more minimal
  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  });
  const formattedPrice = formatter.format(property.price).replace('MXN', '').trim();
  
  // Get property type icon
  const PropertyTypeIcon = property.propertyType === 'casa' ? BiHome : BiBuildings;

  // Create a more descriptive title
  const fullTitle = `${propertyTypeFormatted} en ${isRental ? 'renta' : 'venta'}${
    condoData?.name ? ` en ${condoData.name}` : ''
  }${zoneData?.name ? `, ${zoneData.name}` : ''}`;

  return (
    <div className="max-w-4xl">
      {/* Location breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <BiMap className="mr-2" />
        <span className="hover:text-gray-700 cursor-pointer">Querétaro</span>
        {zoneData?.name && (
          <>
            <span className="mx-2">›</span>
            <span className="hover:text-gray-700 cursor-pointer">{zoneData.name}</span>
          </>
        )}
        {condoData?.name && (
          <>
            <span className="mx-2">›</span>
            <span className="hover:text-gray-700 cursor-pointer">{condoData.name}</span>
          </>
        )}
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            isRental ? 'ml-4 bg-blue-50 border border-blue-500 text-blue-600' : 'border border-green-600 bg-green-50 text-green-600'
          }`}>
            {isRental ? 'En renta' : 'En venta'}
          </span>
      </div>

      {/* Main property info */}
      <div className="space-y-6">
        {/* Title and transaction type */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mt-2">
            {fullTitle}
          </h1>
        </div>

        {/* Combined price and features section */}
        <div className="bg-gray-100 rounded-xl p-6 mb-4">
          {/* Price display */}
          <div className="mb-6 border-b border-gray-200 pb-6">
            <span className="block text-sm text-gray-500 mb-1">
              Precio {isRental ? 'mensual' : 'de venta'}
            </span>
            <div className="flex items-baseline">
              <span className="text-3xl font-medium text-gray-900">{formattedPrice}</span>
              {isRental && <span className="text-gray-500 ml-1">/ mes</span>}
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <BiDoorOpen className="text-gray-600 text-xl" />
              </div>
              <div>
                <span className="block text-xl font-light">{property.bedrooms}</span>
                <span className="text-sm text-gray-500">Habitaciones</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <BiBath className="text-gray-600 text-xl" />
              </div>
              <div>
                <span className="block text-xl font-light">{property.bathrooms}</span>
                <span className="text-sm text-gray-500">Baños</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <BiCar className="text-gray-600 text-xl" />
              </div>
              <div>
                <span className="block text-xl font-light">{property.parkingSpots}</span>
                <span className="text-sm text-gray-500">Estacionamiento</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
