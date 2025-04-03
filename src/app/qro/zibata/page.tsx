import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCondosByZone } from '@/app/shared/firebase';
import { notFound } from 'next/navigation';
import { 
  Map, Building, Trees, School, LandPlot, Globe, Car, 
  ShoppingBag, GraduationCap, Dog, Clock, Store, 
  HeartPulse, Plane, MapPin, ArrowUpRight 
} from 'lucide-react';

// Import the client component wrapper instead
import ZibataMapWrapper from '@/app/components/ZibataMapWrapper';

// Función auxiliar para normalizar los slugs
const normalizeSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-'); // Eliminar múltiples guiones
};

// SEO Optimizada
export const metadata: Metadata = {
  title: 'Zibatá - Vivir en Zibatá Querétaro | Rentas Querétaro',
  description: 'Descubre la vida en Zibatá, un exclusivo desarrollo en Querétaro con campo de golf, áreas verdes, universidades y más. Conoce sus condominios y propiedades.',
  keywords: ['Zibatá', 'condominios Zibatá', 'vivir en Zibatá', 'propiedades Zibatá', 'Querétaro', 'residencial'],
  openGraph: {
    title: 'Vivir en Zibatá Querétaro',
    description: 'Descubre todo sobre Zibatá, uno de los desarrollos residenciales más completos de Querétaro',
    images: [{ url: '/assets/zibata/zibata.jpg' }],
    type: 'website',
  },
}

export default async function ZibataPage() {
  try {
    // Usamos el ID específico de Zibata proporcionado
    const zibataZoneId = 'X5oWujYupjRKx0tF8Hlj'; // ID exacto de la zona Zibata
    const condos = await getCondosByZone(zibataZoneId);
    
    console.log(`Se cargaron ${condos.length} condominios de Zibatá`);
    
    return (
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="relative w-full max-w-6xl mx-auto h-[40vh] md:h-[60vh] rounded-lg overflow-hidden mt-8 mb-8">
          <Image
            src="/assets/zibata/zibata.jpg"
            alt="Zibatá - Vista aérea"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white">Zibatá</h1>
              <p className="text-white/90 text-base md:text-lg mt-2">
                El desarrollo residencial más completo de Querétaro
              </p>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mb-8">
          {/* Descripción principal */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4">Acerca de Zibatá</h2>
            <p className="text-gray-700 mb-4">
              Zibatá se ha convertido en uno de los mejores lugares para vivir en Querétaro, destacando por su calidad de vida, 
              seguridad y comodidades. Este desarrollo cuenta con más de 30 condominios residenciales exclusivos, rodeados de 
              amplias áreas verdes y con un enfoque sustentable, incluyendo su propia planta de tratamiento de agua.
            </p>
            <p className="text-gray-700">
              Con más de 40 hectáreas de parques, un campo de golf profesional de 18 hoyos, plazas comerciales, 
              supermercados, universidad y servicios médicos, Zibatá ofrece un estilo de vida completo y de alta calidad.
            </p>
          </div>
          
          {/* Amenidades principales */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Amenidades principales</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                  <Trees className="w-5 h-5 text-violet-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Áreas verdes</h4>
                <p className="text-xs text-gray-500">40+ hectáreas de parques</p>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                  <Map className="w-5 h-5 text-violet-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Campo de golf</h4>
                <p className="text-xs text-gray-500">18 hoyos profesionales</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                  <Store className="w-5 h-5 text-violet-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Comercios</h4>
                <p className="text-xs text-gray-500">Plazas y tiendas</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                  <School className="w-5 h-5 text-violet-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Educación</h4>
                <p className="text-xs text-gray-500">Universidad Anáhuac</p>
              </div>
            </div>
          </div>
          
          {/* Mapa interactivo - Remove the function prop */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Mapa interactivo de Zibatá</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-[80vh]">
              <ZibataMapWrapper height="80vh" />
            </div>
          </div>
          
          {/* Condominios en Zibatá */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">Condominios en Zibatá</h2>
            
            {condos.length === 0 ? (
              <p className="text-gray-500">No hay condominios disponibles actualmente.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {condos.map((condo) => {
                  const coverImage = condo.portada || 
                                  (condo.imageUrls && condo.imageUrls.length > 0 ? condo.imageUrls[0] : null) || 
                                  condo.logoUrl || '/assets/placeholders/property-placeholder.jpg';
                  
                  // Usar la función de normalización para el slug
                  const condoSlug = normalizeSlug(condo.name);
                  
                  return (
                    <Link href={`/qro/zibata/${condoSlug}`} key={condo.id || condoSlug}>
                      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full cursor-pointer">
                        <div className="relative h-40 bg-gray-100 rounded-t-lg overflow-hidden">
                          <img 
                            src={coverImage} 
                            alt={condo.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-1">{condo.name}</h3>
                          {condo.shortDescription && (
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {condo.shortDescription}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">Slug: {condoSlug}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Información adicional */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Ubicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Car className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Centro histórico</h4>
                    <p className="text-xs text-gray-500">A 20 minutos</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Plane className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Aeropuerto</h4>
                    <p className="text-xs text-gray-500">A 25 minutos</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <a href="https://www.google.com/maps/place/76269+Zibat%C3%A1,+Qro." 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800">
                Ver en Google Maps <ArrowUpRight size={16} className="ml-1" />
              </a>
            </div>
          </div>
          
          {/* CTA */}
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-6 text-center mb-10">
            <h2 className="text-xl font-semibold text-violet-800 mb-2">¿Buscando propiedades en Zibatá?</h2>
            <p className="text-violet-600 mb-4">Contamos con las mejores opciones en renta y venta</p>
            <Link 
              href="/buscar?zona=Zibatá"
              className="bg-violet-600 text-white font-medium py-2 px-6 rounded-md hover:bg-violet-700 inline-block"
            >
              Ver propiedades disponibles
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error cargando datos de Zibata:", error);
    notFound();
  }
}
