import { PropertyData, ZoneData, CondoData } from '@/app/shared/interfaces';
import {
  BedDouble, Bath, Car, Sofa, PawPrint, Home, Building2,
  CalendarIcon, Building, Tv, WashingMachine, Flower, DoorOpen,
  Flame, Droplets, ChefHat, Wifi // Add Wifi icon to imports
} from 'lucide-react';
import { MdBalcony, MdRoofing } from 'react-icons/md';

// Update interface
interface PropertyInfoProps {
  property: PropertyData;
  zoneData?: ZoneData | null;
  condoData?: CondoData | null;
}

// Update component props
export default function PropertyInfo({
  property,
  zoneData,
  condoData,
}: PropertyInfoProps) {
  // Check if property is land type
  const isLand = property.propertyType === 'terreno';
  
  // Check if property is for rent
  const isRental = property.transactionType === 'renta' || property.transactionType === 'ventaRenta';

  return (
    <div>
      {!isLand && (
        <>
          <div className="space-y-12 py-3">
            <section>
              <h3 className="text-lg font-semibold mb-4">Características básicas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.furnished !== undefined && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Sofa className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Amueblado</p>
                      <p className="text-sm sm:text-base font-medium">{property.furnished ? "Si" : "No"}</p>
                    </div>
                  </div>
                )}

                {property.petsAllowed !== undefined && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <PawPrint className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Acepta mascotas</p>
                      <p className="text-sm sm:text-base font-medium">{property.petsAllowed ? "Si" : "No"}</p>
                    </div>
                  </div>
                )}

                {/* Show construction area only if it's greater than 0 */}
                {property.construccionM2 !== undefined && property.construccionM2 > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Construcción</p>
                      <p className="text-sm sm:text-base font-medium">{property.construccionM2}m²</p>
                    </div>
                  </div>
                )}

                {/* Show terrain area only if it's greater than 0 */}
                {property.terrenoM2 !== undefined && property.terrenoM2 > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Flower className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Terreno</p>
                      <p className="text-sm sm:text-base font-medium">{property.terrenoM2}m²</p>
                    </div>
                  </div>
                )}

                {property.estadoConservacion && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Estado</p>
                      <p className="text-sm sm:text-base font-medium capitalize">{property.estadoConservacion.replace('_', ' ')}</p>
                    </div>
                  </div>
                )}

                {property.constructionYear && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Año construcción</p>
                      <p className="text-sm sm:text-base font-medium">{property.constructionYear}</p>
                    </div>
                  </div>
                )}

                {property.nivelesCasa && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Niveles</p>
                      <p className="text-sm sm:text-base font-medium">{property.nivelesCasa}</p>
                    </div>
                  </div>
                )}

                {property.pisoDepto && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Piso</p>
                      <p className="text-sm sm:text-base font-medium">{property.pisoDepto}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
            <section className=''>
              <h3 className="text-lg font-semibold mb-4">Comodidades</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {property.cuartoEstudio && (
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-800">Cuarto de estudio/TV</span>
                  </div>
                )}
                {property.cuartoLavado && (
                  <div className="flex items-center gap-2">
                    <WashingMachine className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-800">Cuarto de lavado</span>
                  </div>
                )}
                {property.balcon && (
                  <div className="flex items-center gap-2">
                    <MdBalcony className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-800">Balcón/Terraza</span>
                  </div>
                )}
                {property.jardin && (
                  <div className="flex items-center gap-2">
                    <Flower className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-800">Jardín</span>
                  </div>
                )}
                {property.bodega && (
                  <div className="flex items-center gap-2">
                    <DoorOpen className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-800">Bodega</span>
                  </div>
                )}
                {property.roofGarden && (
                  <div className="flex items-center gap-2">
                    <MdRoofing className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-800">Roof Garden</span>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4">Equipamiento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {property.cocinaEquipada && (
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-800">Cocina equipada</span>
                  </div>
                )}
                {property.calentadorAgua && (
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-800">Calentador de agua {property.calentadorAgua}</span>
                  </div>
                )}
                {property.tipoGas && (
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-800">Gas {property.tipoGas}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Services included section - only for rental properties */}
            {isRental && (
              <section>
                <h3 className="text-lg font-semibold mb-4">Servicios incluidos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {property.servicesIncluded ? (
                    <>
                      {property.includesWater && (
                        <div className="flex items-center gap-2">
                          <Droplets className="w-5 h-5 text-gray-500" />
                          <span className="text-sm">Agua</span>
                        </div>
                      )}
                      {property.includesElectricity && (
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                            <path d="M14 11L14.9 7.5C15.2 6.5 14.5 5 13.5 5H10.5C9.5 5 8.8 6.5 9.1 7.5L10 11H7.9L6.5 16H9.5L9 21L15.5 11H14Z" />
                          </svg>
                          <span className="text-sm">Electricidad</span>
                        </div>
                      )}
                      {property.includesWifi && (
                        <div className="flex items-center gap-2">
                          <Wifi className="w-5 h-5 text-gray-500" />
                          <span className="text-sm">Internet</span>
                        </div>
                      )}
                      {property.includesGas && (
                        <div className="flex items-center gap-2">
                          <Flame className="w-5 h-5 text-gray-500" />
                          <span className="text-sm">Gas</span>
                        </div>
                      )}
                      {/* Check if at least one service is included */}
                      {!property.includesWater && 
                       !property.includesElectricity && 
                       !property.includesWifi && 
                       !property.includesGas && (
                        <div className="col-span-full">
                          <p className="text-sm text-gray-600">No hay servicios incluidos en la renta</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="col-span-full">
                      <p className="text-sm text-gray-600">No hay servicios incluidos en la renta</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {property.descripcion && (
              <section>
                <h3 className="text-lg font-semibold mb-4">Descripción</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-full">
                    <p className="text-sm text-gray-600">{property.descripcion}</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}