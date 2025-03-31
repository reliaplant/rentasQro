"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, HomeIcon, CalendarIcon, PawPrint, Sofa, Banknote, MapPinIcon, BuildingIcon, Star, MapPin, Building, Home, Shield, CheckCircle, CheckCircle2, Map, Tv, WashingMachine, Flower, DoorOpen, AirVent, Car, Bed, BedDouble } from 'lucide-react';
import { getProperty, getAdvisorProfile, AdvisorData, getZoneById, getCondoById } from '@/app/shared/firebase';
import { ZoneData, CondoData, PropertyData } from '@/app/shared/interfaces';
import FotosPropiedad from './components/fotosPropiedad';
import Contacto from './components/contacto';
import { Utensils, Dumbbell, TreePine, Users, Building2, ShieldCheck, Bath, Gamepad2 } from 'lucide-react';
import { Fire, GasStation, ObjectStorage, RainDrop, Restaurant, Swim } from '@carbon/icons-react';
// import Reviews from './components/reviews';
import CondoSection from './components/CondoSection';
import { MdBalcony, MdRoofing } from 'react-icons/md';
import { TbGardenCart } from 'react-icons/tb';
import { GrStorage } from 'react-icons/gr';
import { GiWaterDrop } from 'react-icons/gi';
import ZibataInfo from './components/zibata';
import MenuPropiedad from './components/menuPropiedad';
import PropertyInfo from './components/PropertyInfo';
import WhatsAppButton from './components/WhatsAppButton';
import PropertyHeader from './components/PropertyHeader';

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

export default function PropertyPage() {
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
  const contactRef = useRef<HTMLDivElement>(null);

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

          if (property.condo) { // privateComplex is condoId
            const condoInfo = await getCondoById(property.condo);
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
    <div className="bg-white min-h-screen md:px-0">

      {/* Menu after photos */}
      <MenuPropiedad
        property={property}
        zoneData={zoneData}
        condoData={condoData}
      />

      {/* Rest of property detail content */}
      <div className="max-w-7xl mx-auto px-0 md:px-4 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Property Header */}


<div className=''>
            <PropertyHeader
              property={property}
              zoneData={zoneData}
              condoData={condoData}
            />


            <div >
              <FotosPropiedad
                images={property.imageUrls}
                propertyType={property.propertyType}
              />
            </div>
            </div>

            {/* Property Info */}
            <PropertyInfo
              property={property}
              zoneData={zoneData}
              condoData={condoData}
            />

            {/* Condo Section */}
            {condoData && (
              <section ref={condoRef}>
                <div className="space-y-12">
                  <CondoSection condoData={condoData} />
                </div>
              </section>
            )}

            <div ref={zibataRef} className="mt-24">
              <ZibataInfo />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 " ref={contactRef}>
            <div className="sticky top-66">
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

        <WhatsAppButton
          propertyType={property.propertyType}
          transactionType={property.transactionType}  // Changed from transactionTypes
          condoName={condoData?.name}
          zoneName={zoneData?.name}
          advisorPhone={advisor?.phone || ''}
          propertyId={property.id!}
          price={property.price}
          contactRef={contactRef as React.RefObject<HTMLDivElement>}
        />
      </div>
    </div>
  )
}

