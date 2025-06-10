'use client';

import { useState, useRef, useEffect } from 'react';
import { ZoneData, CondoData, PropertyData } from '@/app/shared/interfaces';
import FotosPropiedad from './components/fotosPropiedad';
import Contacto from './components/contacto';
import CondoSection from './components/CondoSection';
import ZibataInfo from './components/zibata';
import MenuPropiedad from './components/menuPropiedad';
import PropertyInfo from './components/PropertyInfo';
import WhatsAppButton from './components/WhatsAppButton';
import PropertyHeader from './components/PropertyHeader';
import SimilarProperties from './components/SimilarProperties';
import { Timestamp } from 'firebase/firestore';

// Define AdvisorData type
interface AdvisorData {
  id?: string;
  name: string;
  phone: string;
  email: string;
  bio: string;
  userId: string;
  verified: boolean;
  photo?: string;
}

// Define a serialized version of PropertyData with string dates
interface SerializedPropertyData extends Omit<PropertyData, 'publicationDate' | 'createdAt'> {
  publicationDate?: string | null;
  createdAt?: string | null;
}

export default function PropertyClient({
  property,
  advisor,
  zoneData,
  condoData,
  propertyTitle
}: {
  property: SerializedPropertyData;
  advisor: AdvisorData;
  zoneData: ZoneData | null;
  condoData: CondoData | null;
  propertyTitle: string;
}) {
  const [activeSection, setActiveSection] = useState('info');
  const [showSimilar, setShowSimilar] = useState(true);

  // Create refs for scroll targets
  const infoRef = useRef<HTMLDivElement>(null);
  const characteristicsRef = useRef<HTMLDivElement>(null);
  const amenitiesRef = useRef<HTMLDivElement>(null);
  const equipmentRef = useRef<HTMLDivElement>(null);
  const condoRef = useRef<HTMLDivElement>(null);
  const zibataRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Create compatible version of property with converted date fields
  const createCompatibleProperty = (): PropertyData => {
    const convertStringToTimestamp = (dateString?: string | null): Timestamp => {
      const date = dateString ? new Date(dateString) : new Date();
      return {
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: 0,
        toDate: () => date,
        toString: () => date.toString(),
        valueOf: () => date.valueOf(),
        toJSON: () => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 }),
        isEqual: () => false
      } as unknown as Timestamp;
    };

    return {
      ...property,
      publicationDate: property.publicationDate ? convertStringToTimestamp(property.publicationDate) : undefined,
      createdAt: property.createdAt ? convertStringToTimestamp(property.createdAt) : undefined
    } as PropertyData;
  };

  const compatibleProperty = createCompatibleProperty();
  const publicationDate = property.publicationDate ? new Date(property.publicationDate) : new Date();

  return (
    <div className="bg-white min-h-screen md:px-0 pb-36">

      <MenuPropiedad
        property={compatibleProperty}
        zoneData={zoneData}
        condoData={condoData}
      />


      {property.preventa && (
        <div className="md:hidden sticky top-0 translate-y-0 z-40 bg-violet-600 text-white text-center font-medium py-2 shadow-md">
          OFERTA DE PREVENTA
        </div>
      )}

      {/* Main content */}
      <div className={`max-w-7xl mx-auto px-0 md:px-4 mt-0 md:mt-24 ${property.preventa ? 'pt-0' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          {/* Left column - Property information */}
          <div className="lg:col-span-2 md:space-y-12 space-y-0">
            {/* Mobile photos */}
            <div className="block md:hidden">
              <FotosPropiedad
                images={property.imageUrls}
                propertyType={property.propertyType}
              />
            </div>

            {/* Property header and desktop photos */}
            <div className='px-4 md:px-0'>
              <PropertyHeader
                property={compatibleProperty}
                zoneData={zoneData}
                condoData={condoData}
              />
              <div className="hidden md:block">
                <FotosPropiedad
                  images={property.imageUrls}
                  propertyType={property.propertyType}
                />
              </div>
            </div>

            {/* Property details */}
            <div className='px-4 md:px-0'>
              <PropertyInfo
                property={compatibleProperty}
                zoneData={zoneData}
                condoData={condoData}
              />
            </div>

            {/* Condominium section (if applicable) */}
            {condoData && (
              <section ref={condoRef}>
                <div className="px-4 md:px-0 mt-8 md:mt-0">
                  <CondoSection condoData={condoData} />
                </div>
              </section>
            )}

            {/* Mobile similar properties */}
            {property.id && (
              <div className="mt-6 w-full px-4 md:px-0 block md:hidden">
                <SimilarProperties
                  currentPropertyId={property.id}
                  propertyType={property.propertyType || "casa"}
                  transactionType={property.transactionType || "venta"}
                  zone={property.zone}
                  condo={property.condo}
                  price={property.price}
                />
              </div>
            )}

            {/* Additional area info */}
            <div ref={zibataRef} className="mt-24">
              <ZibataInfo />
            </div>
          </div>

          {/* Right column - Contact and similar properties */}
          <div className="lg:col-span-1" ref={contactRef}>
            <div className="sticky top-24 mt-25 space-y-6">
              {/* Contact section */}
              <div className='hidden md:block'>
                <Contacto
                  preventa={property.preventa || false}
                  price={property.price}
                  advisor={{
                    name: advisor?.name || '',
                    photo: advisor?.photo || '',
                    phone: advisor?.phone || '',
                    bio: advisor?.bio || '',
                    verified: advisor?.verified || false
                  }}
                  propertyId={property.id!}
                  publicationDate={publicationDate}
                  views={property.views}
                  whatsappClicks={property.whatsappClicks}
                />
              </div>

              {/* Desktop similar properties */}
              {property.id && (
                <div className="mt-6 w-full px-4 md:px-0 hidden md:block">
                  <SimilarProperties
                    currentPropertyId={property.id}
                    propertyType={property.propertyType || "casa"}
                    transactionType={property.transactionType || "venta"}
                    zone={property.zone}
                    condo={property.condo}
                    price={property.price}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp button with fixed mobile variant */}
        <WhatsAppButton
          propertyType={property.propertyType}
          transactionType={property.transactionType}
          condoName={condoData?.name}
          zoneName={zoneData?.name}
          advisorPhone={'+525537362098'}
          propertyId={property.id!}
          price={property.price}
          contactRef={contactRef as React.RefObject<HTMLDivElement>}
          variant="fixed"
          showPrice={true}
        />
      </div>
    </div>
  );
}
