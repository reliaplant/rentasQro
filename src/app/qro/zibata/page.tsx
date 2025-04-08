import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCondosByZone } from '@/app/shared/firebase';
import { notFound } from 'next/navigation';
import {
  Map, Building, Trees, School, LandPlot, Globe, Car,
  ShoppingBag, GraduationCap, Dog, Clock, Store,
  HeartPulse, ShoppingCart, Plane, ArrowUpRight, MapPin
} from 'lucide-react';
import ZibataMapWrapper from '@/app/components/ZibataMapWrapper';
import { IoGolf } from 'react-icons/io5';
import { BiBall } from 'react-icons/bi';

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
    const zibataZoneId = 'X5oWujYupjRKx0tF8Hlj';
    const condos = await getCondosByZone(zibataZoneId);

    const parkImages = [
      '/assets/zibata/parqueJamadi2.jpg',
      '/assets/zibata/parqueNanduZibata.jpg',
      '/assets/zibata/parqueSaaki.jpg',
      '/assets/zibata/parqueJamadi2.jpg'
    ];

    const mallImages = [
      '/assets/zibata/plazaCentroZibata.jpeg',
      '/assets/zibata/PlazaPaseoZibata.jpg',
      '/assets/zibata/plazaXentricMirador.jpeg',
      '/assets/zibata/plazaXentricZibata.jpg'
    ];

    const sportsImages = [
      '/assets/zibata/zibataGolf.jpeg',
      '/assets/zibata/canchaPadelZibata.jpg',
      '/assets/zibata/CampoGolfZibata.jpg',
      '/assets/zibata/zibataGolf.jpeg',
    ];

    const retailImages = [
      '/assets/zibata/hebZibata.webp',
      '/assets/zibata/walmartZibata.png',
    ];

    const bankImages = [
      '/assets/zibata/bancoSantander.avif',
      '/assets/zibata/bancoBanregioZibata.avif',
    ];

    const educationImages = [
      '/assets/zibata/momTotsZibata.jpg',
      '/assets/zibata/anahuacZibata.png'
    ];

    const healthImages = [
      '/assets/zibata/centroMedicoZibata.webp'
    ];

    const locationImages = [
      '/assets/zibata/centroQueretaro.jpg',
      '/assets/zibata/aeropuertoQueretaro.jpg'
    ];

    return (
      <div className="min-h-screen bg-white pb-24">
        
        {/* Mapa interactivo - keeping this from the original */}
        <div className="pt-4 mb-8 bg-gradient-to-b from-[#f5e6d3]/80 to-white">
          <div className="flex items-center gap-2">
            <div className="h-20">
              <Image
              src="/assets/logos/zibataLogo.png"
              alt="Logo Zibatá"
              width={200}
              height={96}
              className="object-contain h-full brightness-[0.1]"
              />
            </div>
            <div className="mr-6 text-gray-700 text-xl">|</div>
            <h2 className="text-xl !text-violet-800">MAPA INTERACTIVO</h2>
          </div>
          <div className="overflow-hidden h-[90vh]">
            <ZibataMapWrapper height="90vh" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* About Section */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-8xl bg-gradient-to-r !from-black !to-violet-500 !text-transparent !bg-clip-text inline-block">Zibatá</h1>
            <p className="mt-8  mb-4 text-2xl text-black ">
              Zibatá se ha convertido en uno de los mejores lugares para vivir en Querétaro, destacando por su calidad de vida, seguridad y comodidades. Este desarrollo cuenta con más de 30 condominios residenciales exclusivos, rodeados de amplias áreas verdes y con un enfoque sustentable, incluyendo su propia planta de tratamiento de agua.
            </p>
          </div>

          <div className="relative h-[280px] md:h-[400px] w-full overflow-hidden">
          <Image
            src="/assets/zibata/zibata.jpg"
            alt="Zibatá - Vista aérea"
            fill
            className="object-cover rounded-2xl"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end rounded-2xl">
            <div className="p-6 max-w-7xl mx-auto w-full">
              <p className="text-white/90 text-base md:text-lg">Estilo de vida incomparable en Querétaro</p>
            </div>
          </div>
        </div>


          {/* Amenities Section */}
          <div className="mt-12 mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Amenidades</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                  <Trees className="w-5 h-5 text-violet-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Áreas verdes</h4>
                <p className="text-xs text-gray-500">40+ hectáreas de parques</p>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                  <IoGolf className="w-5 h-5 text-violet-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Campo de golf</h4>
                <p className="text-xs text-gray-500">18 hoyos profesionales</p>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                  <Dog className="w-5 h-5 text-violet-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Pet-friendly</h4>
                <p className="text-xs text-gray-500">Espacios para mascotas</p>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                  <Globe className="w-5 h-5 text-violet-600" />
                </div>
                <h4 className="font-medium text-sm mb-1">Sustentable</h4>
                <p className="text-xs text-gray-500">Planta de tratamiento</p>
              </div>
            </div>

            {/* Park Images Grid */}
            <div>
              <h3 className="font-medium text-lg text-gray-700 mb-3">Parques de Zibatá</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {parkImages.map((src, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                    <Image
                      src={src}
                      alt={`Parque Zibatá ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 20vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Servicios y Comercios</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Supermercados</h4>
                    <p className="text-xs text-gray-500">HEB, Walmart Express</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <HeartPulse className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Servicios médicos</h4>
                    <p className="text-xs text-gray-500">Centro Médico Zibatá</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Store className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Plazas comerciales</h4>
                    <p className="text-xs text-gray-500">5+ centros comerciales</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Bancos</h4>
                    <p className="text-xs text-gray-500">Banregio, Santander</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mall Images */}
            <h3 className="font-medium text-lg text-gray-700 mb-3">Plazas Comerciales</h3>
            <div className="grid grid-cols-2 gap-4">
              {mallImages.slice(0, 2).map((src, index) => (
                <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                  <Image
                    src={src}
                    alt={`Plaza comercial Zibatá ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 40vw"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                    <p className="text-white text-xs">
                      {index === 0 ? "Plaza Centro Zibatá" : "Paseo Zibatá"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sports Facilities */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Instalaciones Deportivas</h2>
            <div className="grid grid-cols-2 gap-4">
              {sportsImages.slice(0, 2).map((src, index) => (
                <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                  <Image
                    src={src}
                    alt={`Instalación deportiva ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 40vw"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                    <p className="text-white text-xs">
                      {index === 0 ? "Campo de Golf" : "Canchas de Padel"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Educación</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <School className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Colegios</h4>
                    <p className="text-xs text-gray-500">NWL Newland Zibatá</p>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Universidad</h4>
                    <p className="text-xs text-gray-500">Universidad Anáhuac</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Education Images */}
            <div className="grid grid-cols-2 gap-4">
              {educationImages.map((src, index) => (
                <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                  <Image
                    src={src}
                    alt={`Centro educativo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 40vw"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                    <p className="text-white text-xs">{index === 0 ? 'MomTots' : 'Universidad Anáhuac'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Mapa del desarrollo</h2>
            <a href="https://www.google.com/maps/place/76269+Zibat%C3%A1,+Qro./data=!4m2!3m1!1s0x85d35c1cebe1b891:0x93c0abf54cd38ef2?sa=X&ved=1t:242&ictx=111"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-gray-200 block cursor-pointer group">
              <Image
                src="/assets/condos/ZibataMapa.png"
                alt="Mapa de Zibatá"
                fill
                className="object-cover transition-all duration-100 group-hover:brightness-75"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
                  Ver en Google Maps
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </a>
          </div>

          {/* Location Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Ubicación</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
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

            {/* Location Images */}
            <div className="grid grid-cols-2 gap-4">
              {locationImages.map((src, index) => (
                <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                  <Image
                    src={src}
                    alt={`${index === 0 ? 'Centro histórico' : 'Aeropuerto'}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 40vw"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                    <p className="text-white text-xs">{index === 0 ? 'Centro histórico' : 'Aeropuerto Internacional'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quote Section */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-gray-600 text-sm italic">
              "Vivir en Zibatá significa elegir comodidad, seguridad y estilo de vida en un solo lugar,
              disfrutando de la mejor mezcla entre naturaleza y desarrollo urbano planificado que Querétaro ofrece."
            </p>
          </div>



          {/* Condominios en Zibatá - modified to show text over image with simplified rating */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Condominios en Zibatá</h2>
            <p className="text-gray-600 mb-6">
              Descubre los exclusivos desarrollos residenciales disponibles en Zibatá:
            </p>

            {condos.length === 0 ? (
              <p className="text-gray-500 text-center">No hay condominios disponibles actualmente.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {condos.map((condo) => {
                  const coverImage = condo.portada ||
                    (condo.imageUrls && condo.imageUrls.length > 0 ? condo.imageUrls[0] : null) ||
                    condo.logoUrl || '/assets/placeholders/property-placeholder.jpg';

                  const condoSlug = normalizeSlug(condo.name);

                    return (
                    <Link href={`/qro/zibata/${condoSlug}`} key={condo.id || condoSlug} className="group">
                      <div className="flex flex-col">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                        <Image
                        src={coverImage}
                        alt={condo.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-gray-800 text-lg font-medium">{condo.name}</h3>
                        {condo.googleRating && (
                        <div className="flex items-center mt-1">
                          <svg
                          className="w-4 h-4 text-violet-600"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                          </svg>
                          <p className="ml-1 text-sm text-gray-600">{condo.googleRating.toFixed(1)}</p>
                        </div>
                        )}
                      </div>
                      </div>
                    </Link>
                    );
                })}
              </div>
            )}
          </div>

          {/* Contact CTA */}
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-6 text-center">
            <h3 className="text-xl font-medium mb-2 text-violet-800">¿Te gustaría vivir aquí?</h3>
            <p className="text-sm text-violet-600 mb-4">Contacta a nuestros agentes para conocer las propiedades disponibles</p>
            <button className="bg-violet-600 text-white font-medium py-2 px-6 rounded-md hover:bg-violet-700 transition-colors duration-300">
              Contactar ahora
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error cargando datos de Zibata:", error);
    notFound();
  }
}
