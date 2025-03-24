"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, HomeIcon, CalendarIcon, PawPrint, Sofa, Banknote, MapPinIcon, BuildingIcon, Star, MapPin, Building, Home, Shield, CheckCircle, CheckCircle2, Map, Tv, WashingMachine, Flower, DoorOpen, AirVent, Car, Bed, BedDouble } from 'lucide-react';
import { getProperty, getAdvisorProfile, AdvisorData, getZoneById, getCondoById } from '@/app/services/firebase';
import { ZoneData, CondoData, PropertyData } from '@/app/interfaces';
import FotosPropiedad from './components/fotosPropiedad';
import Contacto from './components/contacto';
import { Utensils, Dumbbell, TreePine, Users, Building2, ShieldCheck, Bath, Gamepad2 } from 'lucide-react';
import { Fire, GasStation, ObjectStorage, RainDrop, Restaurant, Swim } from '@carbon/icons-react';
import Reviews from './components/reviews';
import CondoSection from './components/CondoSection';
import { MdBalcony, MdRoofing } from 'react-icons/md';
import { TbGardenCart } from 'react-icons/tb';
import { GrStorage } from 'react-icons/gr';
import { GiWaterDrop } from 'react-icons/gi';
import ZibataInfo from './components/zibata';
import MenuPropiedad from './components/menuPropiedad';


const amenityIcons = {
  'pool': { icon: Swim, label: 'Alberca' },
  'gym': { icon: Dumbbell, label: 'Gimnasio' },
  'eventRoom': { icon: Users, label: 'Salón de eventos' },
  'grill': { icon: Utensils, label: 'Área de asadores' },
  'sauna': { icon: Bath, label: 'Sauna' },
  'businessCenter': { icon: Building2, label: 'Business Center' },
  'playground': { icon: TreePine, label: 'Parque infantil' },
  'playRoom': { icon: Gamepad2, label: 'Ludoteca' },
  'securityDoor': { icon: ShieldCheck, label: 'Vigilancia' }
};

export default function PropertyDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [property, setProperty] = useState<PropertyData | null>(null);
  const [advisor, setAdvisor] = useState<AdvisorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('info');
  const [zoneData, setZoneData] = useState<ZoneData | null>(null);
  const [condoData, setCondoData] = useState<CondoData | null>(null);

  const infoRef = useRef<HTMLDivElement>(null);
  const characteristicsRef = useRef<HTMLDivElement>(null);
  const amenitiesRef = useRef<HTMLDivElement>(null);
  const equipmentRef = useRef<HTMLDivElement>(null);
  const condoRef = useRef<HTMLDivElement>(null);
  const zibataRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const propertyData = await getProperty(id);
        setProperty(propertyData);

        if (propertyData?.advisor) {
          const advisorData = await getAdvisorProfile(propertyData.advisor);
          setAdvisor(advisorData);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [id]);

  useEffect(() => {
    const fetchLocationData = async () => {
      if (property?.zone) { // zone is zoneId in current data
        try {
          const zoneInfo = await getZoneById(property.zone);
          setZoneData(zoneInfo);

          if (property.privateComplex) { // privateComplex is condoId
            const condoInfo = await getCondoById(property.privateComplex);
            setCondoData(condoInfo);
          }
        } catch (error) {
          console.error("Error fetching location data:", error);
        }
      }
    };

    if (property) {
      fetchLocationData();
    }
  }, [property]);

  // Update loading skeleton to be more visually appealing
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-white">
      <div className="animate-pulse">
        {/* Image placeholder */}
        <div className="w-full aspect-[16/9] bg-gray-200" />

        {/* Content placeholder */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {/* Title placeholder */}
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
              </div>

              {/* Features placeholder */}
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded" />
                ))}
              </div>
            </div>

            {/* Sidebar placeholder */}
            <div className="lg:col-span-1">
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Update loading condition check
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Propiedad no encontrada</h2>
          <p className="mt-2 text-gray-600">La propiedad que buscas no existe o no está disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen mt-24">
      <div className="max-w-6xl mx-auto">
        <FotosPropiedad
          images={property.imageUrls}
          propertyType={property.propertyType}
        />
      </div>

      {/* Menu after photos */}
      <MenuPropiedad 
        property={property}
        zoneData={zoneData}
        condoData={condoData}
      />

      {/* Rest of property detail content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Property Info */}
            <section ref={infoRef}>
              <h1 className="text-2xl text-black font-bold mb-4">
                {property.propertyType === 'casa' ? 'Casa' : property.propertyType === 'depa' ? 'Depa' : property.propertyType} {property.transactionTypes.includes('renta') ? 'en renta' : 'en venta'} {condoData?.name ? `en ${condoData.name}` : ''} {zoneData?.name ? `- ${zoneData.name}` : ''}
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

            {/* Basic Details */}
            <section ref={characteristicsRef}>
              <h3 className="text-lg font-semibold mb-4 property-photos">Características básicas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">


                {property.furnished !== undefined && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Sofa className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amueblado</p>
                      <p className="font-medium">{property.furnished ? "Si" : "No"}</p>
                    </div>
                  </div>
                )}


                {property.petsAllowed !== undefined && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <PawPrint className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Acepta mascotas</p>
                      <p className="font-medium">{property.petsAllowed ? "Si" : "No"}</p>
                    </div>
                  </div>
                )}


                <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Construcción</p>
                    <p className="font-medium">{property.construccionM2}m²</p>
                  </div>
                </div>

                {property.estadoConservacion && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <p className="font-medium capitalize">{property.estadoConservacion.replace('_', ' ')}</p>
                    </div>
                  </div>
                )}

                {property.constructionYear && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Año construcción</p>
                      <p className="font-medium">{property.constructionYear}</p>
                    </div>
                  </div>
                )}


                {property.nivelesCasa && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Niveles</p>
                      <p className="font-medium">{property.nivelesCasa}</p>
                    </div>
                  </div>
                )}

                {property.pisoDepto && (
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Piso</p>
                      <p className="font-medium">{property.pisoDepto}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Additional Features */}
            <section ref={amenitiesRef}>
              <h3 className="text-lg font-semibold mb-4">Comodidades</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.cuartoEstudio && (
                  <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-gray-500" />
                    <span>Cuarto de estudio/TV</span>
                  </div>
                )}
                {property.cuartoLavado && (
                  <div className="flex items-center gap-2">
                    <WashingMachine className="w-5 h-5 text-gray-500" />
                    <span>Cuarto de lavado</span>
                  </div>
                )}
                {property.balcon && (
                  <div className="flex items-center gap-2">
                    <MdBalcony className="w-5 h-5 text-gray-500" />
                    <span>Balcón/Terraza</span>
                  </div>
                )}
                {property.jardin && (
                  <div className="flex items-center gap-2">
                    <Flower className="w-5 h-5 text-gray-500" />
                    <span>Jardín</span>
                  </div>
                )}
                {property.bodega && (
                  <div className="flex items-center gap-2">
                    <DoorOpen className="w-5 h-5 text-gray-500" />
                    <span>Bodega</span>
                  </div>
                )}
                {property.roofGarden && (
                  <div className="flex items-center gap-2">
                    <MdRoofing className="w-5 h-5 text-gray-500" />
                    <span>Roof Garden</span>
                  </div>
                )}
              </div>
            </section>

            {/* Services and Equipment */}
            <section ref={equipmentRef}>
              <h3 className="text-lg font-semibold mb-4">Equipmaneto</h3>
              {property.cocinaEquipada && (
                <div className="flex items-center gap-2">
                  <Restaurant className="w-5 h-5 text-gray-500" />
                  <span>Cocina equipada</span>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.calentadorAgua && (
                  <div className="flex items-center gap-2">
                    <Fire className="w-5 h-5 text-gray-500" />
                    <span>Calentador de agua{property.calentadorAgua}</span>
                  </div>
                )}
                {property.tipoGas && (
                  <div className="flex items-center gap-2">
                    <RainDrop className="w-5 h-5 text-gray-500" />
                    <span>Gas {property.tipoGas}</span>
                  </div>
                )}
              </div>
            </section>
            {/* Condo Section */}
            {condoData && (
              <section ref={condoRef}>
                <div className="space-y-12">
                  <CondoSection condoData={condoData} />
                </div>
              </section>
            )}

            
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <Contacto
                price={property.price}
                advisor={{
                  name: advisor?.name || '',
                  photo: advisor?.photo || '',
                  phone: advisor?.phone || '',
                  bio: advisor?.bio || '',
                  verified: advisor?.verified || false
                }}
                propertyId={property.id!}
                publicationDate={property.publicationDate}
                views={property.views}
                whatsappClicks={property.whatsappClicks}
              />
            </div>
          </div>
        </div>
       
          <div ref={zibataRef} className="mt-24">
            <ZibataInfo />
          </div>

        
  
      </div>


    </div>
  );
}

