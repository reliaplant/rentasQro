import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getZoneByName, getCondosByZone, getPropertiesByCondo } from '@/app/shared/firebase';
import { Metadata } from 'next';

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

    const condos = await getCondosByZone(zone.id || '');
    const condo = condos.find(c =>
      c.name.toLowerCase().replace(/\s+/g, '-') === condoid.toLowerCase()
    );

    if (!condo) return defaultMetadata();

    return {
      title: `${condo.name} en ${zone.name} - Rentas Querétaro`,
      description: condo.description ||
        `Encuentra propiedades en ${condo.name}, ubicado en ${zone.name}, Querétaro.`
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
    return condos.map(condo => ({
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

    // Cargar condos y encontrar el que coincide
    const condos = await getCondosByZone(zone.id || '');
    const condo = condos.find(c =>
      c.name.toLowerCase().replace(/\s+/g, '-') === condoid.toLowerCase()
    );

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
      <div className="max-w-5xl mt-0 md:mt-24 mx-auto md:px-4 pb-48">
        <Header
          name={name}
          coverImage={portada || ''}
          description={description}
          shortDescription={shortDescription}
          logoUrl={logoUrl}
          desarrolladoraName={desarrolladoraName}
          desarrolladoraDescripcion={desarrolladoraDescripcion}
          desarrolladoraLogoURL={desarrolladoraLogoURL}
        />

        {/* Amenities Section */}
        <div className='px-4 md:px-0'>
        <AmenitiesSection amenities={condo.amenities || []} />
        </div>

        <div className="flex items-center gap-2 mb-8 mt-24 px-4 md:px-0">
          <h3 className="text-lg font-semibold">Precios de renta y venta</h3>
        </div>
        {/* Price Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 px-4 md:px-0">
          <PriceBar
            minPrice={condo.rentPriceMin}
            avgPrice={condo.rentPriceAvg}
            maxPrice={condo.rentPriceMax}
            type="rent"
          />
          <PriceBar
            minPrice={condo.salePriceMin}
            avgPrice={condo.salePriceAvg}
            maxPrice={condo.salePriceMax}
            type="sale"
          />
        </div>

        {/* Map showing the condo location */}
        <div className="mt-24  px-4 md:px-0">
          <h3 className="text-lg font-semibold mb-3">Ubicación en Zibatá</h3>
          <p className="text-sm text-gray-500 mt-2">
            Mapa indicativo de la ubicación del condominio
          </p>
            <div className="mt-10 w-full h-[300px] md:h-156 rounded-lg overflow-hidden">
            <ZibataMapWrapper
              highlightedPolygonId={polygonId}
              height="100%"
            />
            </div>
        </div>

        <div className='mt-24 '></div>
        {/* Gallery Section */}
        <Gallery
          name={condo.name}
          imageUrls={condo.imageUrls}
          amenities={condo.amenities}
          imageAmenityTags={condo.imageAmenityTags}
        />

        <div className='mt-24 px-4 md:px-0'></div>

        {/* Google Maps Section */}
        <GoogleMap
          googlePlaceId={condo.googlePlaceId ?? undefined}
          formattedAddress={condo.placeDetails?.formatted_address}
        />

        <div className='mt-24 px-4 md:px-0'></div>

        {/* Street View Section */}
        <StreetView
          streetViewImage={condo.streetViewImage}
          streetViewLink={condo.streetViewLink}
          name={condo.name}
        />

        <div className='mt-24'></div>

        {/* Reviews Section */}
        <Reviews
          condoName={condo.name}
          googleRating={condo.googleRating}
          totalRatings={condo.totalRatings}
          googlePlaceId={condo.googlePlaceId ?? undefined}
          cachedReviews={condo.cachedReviews}
          selectedGoogleReviews={condo.selectedGoogleReviews} // Add this prop
          manualReviews={condo.manualReviews} // Add manual reviews
        />

        <div className='mt-24'></div>

        {/* Properties Section */}
        <PropertiesSection 
          properties={properties} 
          condoName={condo.name}
        />
      </div>
    );

  } catch (error) {
    console.error("Error cargando datos:", error);
    notFound();
  }
}
