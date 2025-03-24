import { PropertyData, ZoneData, CondoData } from '@/app/interfaces';
import { 
  BedDouble, Bath, Car, Sofa, PawPrint, Home, Building2, 
  CalendarIcon, Building, Tv, WashingMachine, Flower, DoorOpen,
  Flame, Droplets, ChefHat // Change carbon icons to Lucide
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
  return (
    <div className="space-y-12 px-6 py-3">
      <section>
        <h1 className="text-2xl md:text-3xl font-medium mb-4">
            {property.propertyType === 'casa' ? 'Casa' : property.propertyType === 'depa' ? 'Depa' : property.propertyType} {property.transactionTypes.includes('renta') ? 'en renta' : 'en venta'} {condoData?.name ? `en ${condoData.name}`: ''}{zoneData?.name ? `, ${zoneData.name}` : ''}
        </h1>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center bg-blue-50 p-3 rounded-lg">
        <BedDouble className="w-8 h-8 text-gray-500 mb-2" />
        <span className="text-sm">{property.bedrooms} {property.bedrooms === 1 ? 'hab' : 'habs'}</span>
          </div>
          <div className="flex flex-col items-center bg-blue-50 p-3 rounded-lg">
        <Bath className="w-8 h-8 text-gray-500 mb-2" />
        <span className="text-sm">{property.bathrooms} {property.bathrooms === 1 ? 'baño' : 'baños'}</span>
          </div>
          <div className="flex flex-col items-center bg-blue-50 p-3 rounded-lg">
        <Car className="w-8 h-8 text-gray-500 mb-2" />
        <span className="text-sm">{property.parkingSpots} {property.parkingSpots === 1 ? 'puesto' : 'puestos'}</span>
          </div>
        </div>
      </section>

      <section >
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

          {property.construccionM2 && (
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
              <span className="text-sm">Cuarto de estudio/TV</span>
            </div>
          )}
          {property.cuartoLavado && (
            <div className="flex items-center gap-2">
              <WashingMachine className="w-5 h-5 text-gray-500" />
              <span className="text-sm">Cuarto de lavado</span>
            </div>
          )}
          {property.balcon && (
            <div className="flex items-center gap-2">
              <MdBalcony className="w-5 h-5 text-gray-500" />
              <span className="text-sm">Balcón/Terraza</span>
            </div>
          )}
          {property.jardin && (
            <div className="flex items-center gap-2">
              <Flower className="w-5 h-5 text-gray-500" />
              <span className="text-sm">Jardín</span>
            </div>
          )}
          {property.bodega && (
            <div className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-gray-500" />
              <span className="text-sm">Bodega</span>
            </div>
          )}
          {property.roofGarden && (
            <div className="flex items-center gap-2">
              <MdRoofing className="w-5 h-5 text-gray-500" />
              <span className="text-sm">Roof Garden</span>
            </div>
          )}
        </div>
      </section>

      <section >
        <h3 className="text-lg font-semibold mb-4">Equipamiento</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {property.cocinaEquipada && (
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-gray-500" />
              <span className="text-sm">Cocina equipada</span>
            </div>
          )}
          {property.calentadorAgua && (
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-gray-500" />
              <span className="text-sm">Calentador de agua {property.calentadorAgua}</span>
            </div>
          )}
          {property.tipoGas && (
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-gray-500" />
              <span className="text-sm">Gas {property.tipoGas}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}