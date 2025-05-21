import { Metadata } from 'next';
import { getProperty, getAdvisorProfile, getAdvisorById, getZoneById, getCondoById } from '@/app/shared/firebase';
import { ZoneData, CondoData, PropertyData } from '@/app/shared/interfaces';
import PropertyClient from './PropertyClient';
import { getOrderedAmenities } from '@/app/constants/amenities';


// Define AdvisorData type here since it's not exported from the interfaces
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

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const propertyData = await getProperty(params.id);
    
    if (!propertyData) {
      return {
        title: 'Propiedad no encontrada | PIZO MX',
        description: 'Lo sentimos, esta propiedad ya no está disponible.',
      };
    }
    
    // Get zone and condo information if available
    let zoneData = null;
    let condoData = null;
    
    if (propertyData.zone) {
      zoneData = await getZoneById(propertyData.zone);
    }
    
    if (propertyData.condo) {
      condoData = await getCondoById(propertyData.condo);
    }
    
    // Create a descriptive title and description
    const propertyType = propertyData.propertyType || 'Propiedad';
    const transactionType = propertyData.transactionType === 'renta' ? 'en renta' : 'en venta';
    const location = zoneData?.name || 'Querétaro';
    const condoName = condoData?.name ? ` en ${condoData.name}` : '';
    
    return {
      title: `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} ${transactionType}${condoName} | ${location} | PIZO MX`,
      description: propertyData.descripcion || 
        `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} ${transactionType} con ${propertyData.bedrooms || 0} recámaras, 
        ${propertyData.bathrooms || 0} baños, ${propertyData.construccionM2 || 0}m² de construcción. 
        Ubicado en ${location}${condoName}.`,
      keywords: `${propertyType}, ${transactionType}, ${location}, bienes raíces, 
        inmobiliaria, ${propertyData.bedrooms || 0} recámaras, ${propertyData.bathrooms || 0} baños`,
      openGraph: {
        title: `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} ${transactionType}${condoName} | ${location}`,
        description: propertyData.descripcion || 
          `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} ${transactionType} con ${propertyData.bedrooms || 0} recámaras, 
          ${propertyData.bathrooms || 0} baños, ${propertyData.construccionM2 || 0}m² de construcción. 
          Ubicado en ${location}${condoName}.`,
        url: `https://www.pizo.mx/propiedad/${params.id}`,
        type: 'website',
        images: [
          {
            url: propertyData.imageUrls && propertyData.imageUrls.length > 0 
              ? propertyData.imageUrls[0] 
              : 'https://www.pizo.mx/og-image.jpg',
            width: 1200,
            height: 630,
            alt: `${propertyType} ${transactionType} en ${location}`,
          }
        ],
      },
      alternates: {
        canonical: `https://www.pizo.mx/propiedad/${params.id}`,
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Propiedad | PIZO MX',
      description: 'Encuentra tu propiedad ideal en Querétaro con PIZO MX.',
    };
  }
}

// Generate schema.org structured data for SEO
function generateStructuredData(property: PropertyData, advisor: AdvisorData | null, zoneData: ZoneData | null, condoData: CondoData | null) {
  const images = property.imageUrls?.map(url => url) || [];
  const locationName = [
    condoData?.name,
    zoneData?.name,
    'Querétaro, México'
  ].filter(Boolean).join(', ');
  
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": `${property.propertyType?.charAt(0).toUpperCase() + property.propertyType?.slice(1) || 'Propiedad'} en ${condoData?.name || zoneData?.name || 'Querétaro'}`,
    "description": property.descripcion || `${property.propertyType} ${property.transactionType === 'renta' ? 'en renta' : 'en venta'} en ${locationName}`,
    "url": `https://www.pizo.mx/propiedad/${property.id}`,
    "datePosted": property.publicationDate ? new Date(property.publicationDate.seconds * 1000).toISOString() : new Date().toISOString(),
    "image": images,
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "MXN",
      "availability": property.status === 'publicada' ? "https://schema.org/InStock" : "https://schema.org/SoldOut"
    },
    "amenityFeature": [
      property.bedrooms ? {
        "@type": "LocationFeatureSpecification",
        "name": "Recámaras",
        "value": property.bedrooms
      } : null,
      property.bathrooms ? {
        "@type": "LocationFeatureSpecification",
        "name": "Baños",
        "value": property.bathrooms
      } : null,
      property.construccionM2 ? {
        "@type": "LocationFeatureSpecification",
        "name": "Construcción",
        "value": `${property.construccionM2}m²`
      } : null
    ].filter(Boolean),
    "address": {
      "@type": "PostalAddress",
      "addressLocality": zoneData?.name || "Querétaro",
      "addressRegion": "Querétaro",
      "addressCountry": "MX"
    },
    "agent": advisor ? {
      "@type": "RealEstateAgent",
      "name": advisor.name,
      "telephone": advisor.phone,
      "email": advisor.email
    } : null
  };
}

// Helper function to serialize Firestore timestamps or Date objects to ISO strings
function serializeTimestamps(obj: any): any {
  if (!obj) return obj;
  
  // Handle array case
  if (Array.isArray(obj)) {
    return obj.map(item => serializeTimestamps(item));
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    // Check if it's a Firestore Timestamp or Date object
    if (obj.seconds !== undefined && obj.nanoseconds !== undefined) {
      return new Date(obj.seconds * 1000).toISOString();
    }
    
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    
    // Process regular objects recursively
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeTimestamps(value);
    }
    return result;
  }
  
  // Return primitives as is
  return obj;
}

// Server component - fetches data server-side
export default async function PropertyPage({ params }: { params: { id: string } }) {
  try {
    const propertyData = await getProperty(params.id);
    
    if (!propertyData) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Propiedad no encontrada</h2>
            <p className="mt-2 text-gray-600">La propiedad que buscas no existe o no está disponible.</p>
          </div>
        </div>
      );
    }
    
    // Get advisor data
    let advisorData = null;
    if (propertyData.advisor) {
      // Try getting advisor by direct document ID first
      advisorData = await getAdvisorById(propertyData.advisor);
      
      if (!advisorData) {
        // Fall back to profile lookup
        advisorData = await getAdvisorProfile(propertyData.advisor);
      }
    }
    
    // Use default advisor if none found
    if (!advisorData) {
      advisorData = {
        id: 'default',
        name: 'Asesor Pizo',
        phone: '4421234567',
        email: 'contacto@pizomx.com',
        bio: 'Asesor inmobiliario de Pizo MX',
        userId: 'default',
        verified: true
      };
    }
    
    // Get location data
    let zoneData = null;
    let condoData = null;
    
    if (propertyData.zone) {
      zoneData = await getZoneById(propertyData.zone);
    }
    
    if (propertyData.condo) {
      condoData = await getCondoById(propertyData.condo);
    }
    
    // Serialize all data to ensure it's safe to pass to client components
    const serializedPropertyData = serializeTimestamps(propertyData);
    const serializedAdvisorData = serializeTimestamps(advisorData);
    const serializedZoneData = serializeTimestamps(zoneData);
    const serializedCondoData = serializeTimestamps(condoData);
    
    // Generate structured data (using original data before serialization)
    const structuredData = generateStructuredData(propertyData, advisorData, zoneData, condoData);
    
    // Create property title
    const propertyTitle = `${propertyData.propertyType?.charAt(0).toUpperCase() + propertyData.propertyType?.slice(1) || 'Propiedad'} 
      ${propertyData.transactionType === 'renta' ? 'en renta' : 'en venta'} 
      ${condoData?.name ? `en ${condoData.name}` : ''} 
      ${zoneData?.name ? `| ${zoneData.name}` : ''}`;
    
    // When processing the condo data, use getOrderedAmenities
    if (condoData && condoData.amenities) {
      // Sort the amenities by priority for display in the UI
      const orderedAmenities = getOrderedAmenities(condoData.amenities);
      
      // We can't directly modify the condo object, so we can create a processed version
      const processedCondo = {
        ...condoData,
        orderedAmenities
      };
      
      // Pass the processed condo to CondoSection
      // Note: depending on your implementation, you might need to adjust how
      // this is passed to maintain compatibility with existing code
    }

    return (
      <>
        {/* Add structured data for SEO */}
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        <div className="bg-white min-h-screen">
          {/* Hidden title for SEO */}
          <h1 className="sr-only">{propertyTitle}</h1>
          
          {/* Client component with all the interactive functionality */}
          <PropertyClient
            property={serializedPropertyData}
            advisor={serializedAdvisorData}
            zoneData={serializedZoneData}
            condoData={serializedCondoData}
            propertyTitle={propertyTitle}
          />
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching property data:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Ocurrió un error</h2>
          <p className="mt-2 text-gray-600">No pudimos cargar la información de esta propiedad.</p>
        </div>
      </div>
    );
  }
}

