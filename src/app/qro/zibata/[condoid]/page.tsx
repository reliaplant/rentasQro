import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getZoneByName, getPropertiesByCondo, getCondoBySlug, getCondosByZone } from '@/app/shared/firebase';
import { Metadata } from 'next';
import type { CondoData } from '@/app/shared/interfaces';

// Import the client wrapper component
import ZibataMapWrapper from '@/app/components/ZibataMapWrapper';
import AmenitiesSection from './components/AmenitiesSection';
import StreetView from './components/StreetView';
import Reviews from './components/Reviews';
import GoogleMap from './components/GoogleMap';
import PriceBar from './components/PriceBar';
import Gallery from './components/Gallery';
import Header from './components/Header';
import PropertiesSection from './components/PropertiesSection';

// Generate metadata with proper params handling
export async function generateMetadata(props: any): Promise<Metadata> {
  try {
    // Properly await params before accessing
    const params = await props.params;
    const condoid = params.condoid;

    // For Zibata, we use a fixed zoneid
    const zoneid = 'zibata';

    const zone = await getZoneByName(zoneid);
    if (!zone) return defaultMetadata();

    // Use the new getCondoBySlug function instead of fetching all condos
    const condo = await getCondoBySlug(condoid);
    if (!condo) return defaultMetadata();
    
    // Fetch properties to count them for the description
    const propertiesData = await getPropertiesByCondo(condo.id || '');
    
    // Count properties by type (only published properties)
    const publishedProperties = propertiesData.filter(p => p.status === 'publicada');
    const rentProperties = publishedProperties.filter(p => 
      (p.transactionType === 'renta' || p.transactionType === 'ventaRenta') && !p.preventa
    );
    const saleProperties = publishedProperties.filter(p => 
      (p.transactionType === 'venta' || p.transactionType === 'ventaRenta') && !p.preventa
    );
    const preventaProperties = publishedProperties.filter(p => p.preventa === true);
    
    // Build dynamic description based on property counts
    let dynamicDescription = ``;
    
    if (rentProperties.length > 0) {
      dynamicDescription += `${rentProperties.length} propiedad${rentProperties.length !== 1 ? 'es' : ''} disponible${rentProperties.length !== 1 ? 's' : ''} en renta`;
    }
    
    if (saleProperties.length > 0) {
      if (dynamicDescription) dynamicDescription += ` y `;
      dynamicDescription += `${saleProperties.length} propiedad${saleProperties.length !== 1 ? 'es' : ''} en venta`;
    }
    
    if (preventaProperties.length > 0) {
      if (dynamicDescription) dynamicDescription += `, además de `;
      dynamicDescription += `${preventaProperties.length} propiedad${preventaProperties.length !== 1 ? 'es' : ''} en preventa`;
    }
    
    if (dynamicDescription) {
      dynamicDescription = `${dynamicDescription} en ${condo.name}, Zibatá. `;
    }
    
    // Add condo description if available
    if (condo.description) {
      dynamicDescription += condo.description;
    } else {
      dynamicDescription += `Encuentra las mejores opciones de vivienda en ${condo.name}, ubicado en Zibatá, Querétaro.`;
    }

    return {
      title: `Propiedades en venta y renta en ${condo.name}, Zibatá`,
      description: dynamicDescription,
      openGraph: {
        title: `Propiedades en ${condo.name}, Zibatá - Querétaro`,
        description: dynamicDescription,
        images: condo.portada ? [{ url: condo.portada }] : undefined,
      },
    };
  } catch (error) {
    return defaultMetadata();
  }
}

function defaultMetadata(): Metadata {
  return {
    title: 'Condominio - Rentas Querétaro',
    description: 'Encuentra las mejores opciones de vivienda en Querétaro'
  };
}

// Add this function to generate static params for all condos in Zibata
export async function generateStaticParams() {
  try {
    // For Zibata, we use a fixed zoneid
    const zoneid = 'zibata';

    // Get the zone
    const zone = await getZoneByName(zoneid);
    if (!zone || !zone.id) return [];

    // Get all condos in the zone
    const condos = await getCondosByZone(zone.id);

    // Generate params for each condo
    return condos.map((condo: CondoData) => ({
      condoid: condo.name.toLowerCase().replace(/\s+/g, '-')
    }));
  } catch (error) {
    console.error("Error generating static params for condos:", error);
    return [];
  }
}

// Main page component with proper params handling
export default async function CondoDetailPage(props: any) {
  try {
    // Properly await params before accessing
    const params = await props.params;
    const condoid = params.condoid;

    if (!condoid) {
      notFound();
    }

    // For Zibata, we use a fixed zoneid
    const zoneid = 'zibata';

    // Cargar datos de zona
    const zone = await getZoneByName(zoneid);
    if (!zone) {
      notFound();
    }

    // Use the new getCondoBySlug function
    const condo = await getCondoBySlug(condoid);

    if (!condo) {
      notFound();
    }

    // Fetch properties for this condo
    const propertiesData = await getPropertiesByCondo(condo.id || '');

    // Serialize the properties to remove Firestore specific objects (like Timestamps)
    // that cannot be passed directly from server to client components
    const properties = JSON.parse(JSON.stringify(propertiesData));

    // Determinar la imagen de portada
    const coverImage = condo.portada ||
      (condo.imageUrls && condo.imageUrls.length > 0 ? condo.imageUrls[0] : null) ||
      condo.logoUrl || '/assets/placeholders/property-placeholder.jpg';

    // Get polygon ID that matches the condo
    const polygonId = condo.polygonId || undefined;

    // Extract developer data
    const {
      name,
      description,
      shortDescription,
      logoUrl,
      portada,
      imageUrls,
      desarrolladoraName,
      desarrolladoraDescripcion,
      desarrolladoraLogoURL
    } = condo;

    return (
      <div className="">
        <Header
          name={name}
          coverImage={portada || ''}
          description={description}
          shortDescription={shortDescription}
          logoUrl={logoUrl}
          desarrolladoraName={desarrolladoraName}
          desarrolladoraDescripcion={desarrolladoraDescripcion}
          desarrolladoraLogoURL={desarrolladoraLogoURL}
          googlePlaceId={condo.googlePlaceId ?? undefined}
          formattedAddress={condo.placeDetails?.formatted_address}
          googleRating={condo.googleRating}
          totalRatings={condo.totalRatings}
        />


        <div className='w-full px-4 sm:px-[5vw] py-8 lg:py-16'>


          <PropertiesSection
            properties={properties}
            condoName={condo.name}
          />





          <div className='mt-24 '></div>
          <Gallery
            name={condo.name}
            imageUrls={condo.imageUrls}
            amenities={condo.amenities}
            imageAmenityTags={condo.imageAmenityTags}
          />



        </div>


      </div>
    );

  } catch (error) {
    console.error("Error cargando datos:", error);
    notFound();
  }
}
