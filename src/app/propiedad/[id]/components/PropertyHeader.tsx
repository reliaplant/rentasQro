import { PropertyData, ZoneData, CondoData } from '@/app/shared/interfaces';
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
import { useEffect, useState } from 'react';
import { useExchangeRate } from '@/app/hooks/useExchangeRate';

interface PropertyHeaderProps {
  property: PropertyData;
  zoneData: ZoneData | null;
  condoData: CondoData | null;
}

export default function PropertyHeader({ property, zoneData, condoData }: PropertyHeaderProps) {
  // Currency state and conversion hook
  const [selectedCurrency, setSelectedCurrency] = useState<'MXN' | 'USD'>('MXN');
  const { exchangeRate, convertMXNtoUSD } = useExchangeRate();
  
  // Load currency preference from localStorage - add a refresh interval to catch changes from other components
  useEffect(() => {
    // Initial load
    loadCurrencyFromLocalStorage();
    
    // Set up a lightweight polling to detect changes from other components
    const intervalId = setInterval(loadCurrencyFromLocalStorage, 500);
    
    // Cleanup
    return () => clearInterval(intervalId);
    
    function loadCurrencyFromLocalStorage() {
      try {
        if (typeof window !== 'undefined') {
          const filtersJson = localStorage.getItem('propertyFilters');
          if (filtersJson) {
            const filters = JSON.parse(filtersJson);
            if (filters && (filters.currency === 'USD' || filters.currency === 'MXN')) {
              setSelectedCurrency(prev => {
                // Only update if different to avoid unnecessary re-renders
                if (prev !== filters.currency) {
                  return filters.currency;
                }
                return prev;
              });
            }
          }
        }
      } catch (error) {
        console.error('Error reading currency from localStorage:', error);
      }
    }
  }, []);
  
  // Format property details
  const isRental = ['renta', 'ventaRenta'].includes(property.transactionType);
  const propertyTypeFormatted = 
    property.propertyType === 'casa' ? 'Casa' : 
    property.propertyType === 'depa' ? 'Depa' : 
    property.propertyType;
    
  // Get the price in the selected currency
  const getDisplayPrice = () => {
    if (selectedCurrency === 'USD') {
      return convertMXNtoUSD(property.price);
    }
    return property.price;
  };
  
  // Format price as currency based on selected currency
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: selectedCurrency,
    maximumFractionDigits: 0,
  }).format(getDisplayPrice()).replace(selectedCurrency, '').trim();
  
  // Get property type icon
  const PropertyTypeIcon = property.propertyType === 'casa' ? BiHome : BiBuildings;

  // Create a more descriptive title
  const fullTitle = `${propertyTypeFormatted} en ${
    property.preventa ? 'Preventa' : 
    isRental ? 'Renta' : 'Venta'
  }${
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
        <span className={`inline-block ml-2 px-3 py-1 rounded-full text-xs font-medium ${
        property.preventa ? 'ml-4 bg-orange-50 border border-orange-500 text-orange-600' :
        isRental ? 'ml-4 bg-violet-50 border border-violet-500 text-violet-600' : 
        'border border-green-600 bg-green-50 text-green-600'
          }`}>
        {property.preventa ? 'En preventa' : isRental ? 'En renta' : 'En venta'}
          </span>
          
      </div>

      {/* Main property info */}
      <div className="space-y-6">
        {/* Title and transaction type */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mt-2">
            {fullTitle.charAt(0).toUpperCase() + fullTitle.slice(1)}
          </h1>
            {property.modelo && (
            <h2 className="mt-2 text-2xl text-gray-600">Modelo: {property.modelo}</h2>
            )}
        </div>

        {/* Combined price and features section */}
        <div className="bg-gray-100 rounded-xl p-6 mb-4">
          {/* Price display */}
          <div className="mb-6 border-b border-gray-200 pb-6">
            <div className="flex justify-between items-baseline">
              <span className="block text-sm text-gray-500 mb-1">
                Precio {isRental ? 'mensual' : 'de venta'}
              </span>
              
              {/* Currency toggle - Only visible on mobile */}
              <div className="md:hidden flex bg-white rounded-full p-0.5 border border-gray-200">
                {['MXN', 'USD'].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      setSelectedCurrency(curr as 'MXN' | 'USD');
                      // Update localStorage
                      try {
                        const filtersJson = localStorage.getItem('propertyFilters');
                        let filters = filtersJson ? JSON.parse(filtersJson) : {};
                        filters.currency = curr;
                        localStorage.setItem('propertyFilters', JSON.stringify(filters));
                      } catch (error) {
                        console.error('Error updating currency in localStorage:', error);
                      }
                    }}
                    className={`
                      px-2 py-1 rounded-full text-xs font-medium transition-all duration-200
                      ${selectedCurrency === curr
                        ? 'bg-violet-100 text-violet-700 shadow-sm'
                        : 'text-gray-500 hover:text-violet-600'}
                    `}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-baseline">
              <span className="text-3xl font-medium text-gray-900">{formattedPrice}</span>
              <span className="text-gray-500 ml-1">
                {selectedCurrency} {isRental && '/ mes'}
              </span>
            </div>

          </div>

          {/* Features grid */}
          <div className="grid grid-cols-3 gap-6">
            {property.propertyType === 'terreno' ? (
              // Display for land/terreno property type
              <>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiMap className="text-gray-600 text-xl" />
                  </div>
                  <div>
                    <span className="block text-xl font-light">{property.terrenoM2 || 0}</span>
                    <span className="text-sm text-gray-500 hidden sm:block">m² de terreno</span>
                    <span className="text-sm text-gray-500 sm:hidden">m² terreno</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiHome className="text-gray-600 text-xl" />
                  </div>
                  <div>
                    <span className="block text-xl font-light">{property.construccionM2 || 0}</span>
                    <span className="text-sm text-gray-500 hidden sm:block">m² de construcción</span>
                    <span className="text-sm text-gray-500 sm:hidden">m² constr.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiCar className="text-gray-600 text-xl" />
                  </div>
                  <div>
                    <span className="block text-xl font-light">{property.parkingSpots || 0}</span>
                    <span className="text-sm text-gray-500 hidden sm.block">Estacionamiento</span>
                    <span className="text-sm text-gray-500 sm.hidden">Est.</span>
                  </div>
                </div>
              </>
            ) : (
              // Display for other property types (casa, departamento, etc.)
              <>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiDoorOpen className="text-gray-600 text-xl" />
                  </div>
                  <div>
                    <span className="block text-xl font-light">{property.bedrooms}</span>
                    <span className="text-sm text-gray-500 hidden sm.block">Habitaciones</span>
                    <span className="text-sm text-gray-500 sm.hidden">Hab.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiBath className="text-gray-600 text-xl" />
                  </div>
                  <div>
                    <span className="block text-xl font-light">{property.bathrooms}</span>
                    <span className="text-sm text-gray-500 hidden sm.block">Baños</span>
                    <span className="text-sm text-gray-500 sm.hidden">Bañ.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BiCar className="text-gray-600 text-xl" />
                  </div>
                  <div>
                    <span className="block text-xl font-light">{property.parkingSpots}</span>
                    <span className="text-sm text-gray-500 hidden sm.block">Estacionamiento</span>
                    <span className="text-sm text-gray-500 sm.hidden">Est.</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
