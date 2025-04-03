import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getZoneByName, getCondosByZone } from '@/app/shared/firebase';
import { Metadata } from 'next';

// Import the client wrapper component
import ZibataMapWrapper from '@/app/components/ZibataMapWrapper';

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
     
    // Determinar la imagen de portada
    const coverImage = condo.portada || 
                     (condo.imageUrls && condo.imageUrls.length > 0 ? condo.imageUrls[0] : null) || 
                     condo.logoUrl || '/assets/placeholders/property-placeholder.jpg';

    // Get polygon ID that matches the condo
    const polygonId = condo.polygonId || undefined;
    
    return (
      <>
        {/* Hero banner con imagen de portada */}
        <div className="container mx-auto px-4">
          {coverImage && (
            <div className="relative max-w-6xl mx-auto h-[40vh] md:h-[50vh] mb-8 overflow-hidden rounded-lg mt-8">
              <img 
                src={coverImage} 
                alt={`${condo.name} - Portada`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h1 className="text-3xl md:text-4xl font-bold drop-shadow-md">{condo.name}</h1>
              </div>
            </div>
          )}
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6 max-w-6xl mx-auto">
            <Link href="/zonas" className="text-blue-600 hover:underline">Zonas</Link>
            <span className="mx-2 text-gray-400">&gt;</span>
            <Link href="/qro/zibata" className="text-blue-600 hover:underline">Zibatá</Link>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {/* Detalles del condominio */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4">{condo.name}</h2>
              
              {condo.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                  <p className="text-gray-700">{condo.description}</p>
                </div>
              )}
              
              {condo.shortDescription && (
                <div className="mb-6">
                  <p className="text-gray-600 italic">{condo.shortDescription}</p>
                </div>
              )}
              
              {condo.amenities && condo.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Amenidades</h3>
                  <ul className="list-disc pl-5">
                    {condo.amenities.map((amenity, index) => (
                      <li key={index} className="text-gray-700">{amenity}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {condo.imageUrls && condo.imageUrls.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Imágenes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {condo.imageUrls.map((url, index) => (
                      <div key={index} className="h-48 rounded-lg overflow-hidden">
                        <img src={url} alt={`${condo.name} - Imagen ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Enlaces a propiedades */}
              <div className="mt-8">
                <Link 
                  href={`/buscar?zona=Zibatá&condominio=${condo.name}`} 
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ver propiedades en {condo.name}
                </Link>
              </div>
            </div>

            {/* Map showing the condo location */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-lg font-semibold mb-3">Ubicación en Zibatá</h3>
              <div className="h-80 rounded-lg overflow-hidden">
                <ZibataMapWrapper 
                  highlightedPolygonId={polygonId} 
                  height="100%" 
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Mapa indicativo de la ubicación del condominio
              </p>
            </div>
          </div>
        </div>
      </>
    );
    
  } catch (error) {
    console.error("Error cargando datos:", error);
    notFound();
  }
}
