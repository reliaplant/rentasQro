import Image from 'next/image';
import { Map, Building, Trees, School, LandPlot, Globe, Car, ShoppingBag, GraduationCap, Dog, Clock, Store, HeartPulse, ShoppingCart, Plane, MapPin, ArrowUpRight } from 'lucide-react';
import { BiBall } from 'react-icons/bi';
import { IoGolf } from 'react-icons/io5';
import AdvisorModal from '@/app/components/AdvisorModal';
import Link from 'next/link';
import React from 'react';
import Head from 'next/head'; // Add this for SEO metadata

export default function ZibataInfo() {
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

  // SEO structured data for Zibata
  const zibataStructuredData = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": "Zibatá",
    "description": "Zibatá se ha convertido en uno de los mejores lugares para vivir en Querétaro, destacando por su calidad de vida, seguridad y comodidades. Este desarrollo cuenta con más de 30 condominios residenciales exclusivos, rodeados de amplias áreas verdes y con un enfoque sustentable.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Querétaro",
      "addressRegion": "Querétaro",
      "addressCountry": "MX",
      "postalCode": "76269"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "20.7018",
      "longitude": "-100.3236"
    },
    "image": [
      "https://www.pizo.mx/assets/zibata/zibata.jpg",
      "https://www.pizo.mx/assets/zibata/parqueJamadi2.jpg",
      "https://www.pizo.mx/assets/zibata/zibataGolf.jpeg"
    ],
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Áreas verdes",
        "value": "40+ hectáreas de parques"
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Campo de golf",
        "value": "18 hoyos profesionales"
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Pet-friendly",
        "value": "Espacios para mascotas"
      }
    ]
  };

  return (
    <>
      {/* Add SEO metadata */}
      <Head>
        <title>Zibatá | El mejor fraccionamiento para vivir en Querétaro | PIZO MX</title>
        <meta name="description" content="Descubre por qué Zibatá se ha convertido en el mejor lugar para vivir en Querétaro. Amplia oferta de casas y departamentos en exclusivos condominios residenciales." />
        <meta name="keywords" content="Zibatá, fraccionamiento Querétaro, casas en Zibatá, departamentos en Zibatá, bienes raíces Querétaro, vivir en Zibatá" />
        
        {/* OpenGraph tags */}
        <meta property="og:title" content="Zibatá | El mejor fraccionamiento para vivir en Querétaro" />
        <meta property="og:description" content="Descubre por qué Zibatá se ha convertido en el mejor lugar para vivir en Querétaro. Amplia oferta de casas y departamentos en exclusivos condominios residenciales." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.pizo.mx/zibata" />
        <meta property="og:image" content="https://www.pizo.mx/assets/zibata/zibata.jpg" />
        
        {/* Twitter tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Zibatá | El mejor fraccionamiento para vivir en Querétaro" />
        <meta name="twitter:description" content="Descubre por qué Zibatá se ha convertido en el mejor lugar para vivir en Querétaro. Amplia oferta de casas y departamentos en exclusivos condominios residenciales." />
        <meta name="twitter:image" content="https://www.pizo.mx/assets/zibata/zibata.jpg" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://www.pizo.mx/zibata" />
        
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(zibataStructuredData) }}
        />
      </Head>

      <div className="bg-white ">
        {/* Hero Section */}
        <div className="relative h-[280px] md:h-[400px] w-full overflow-hidden rounded-t-4xl">
          <Image
            src="/assets/zibata/zibata.jpg"
            alt="Zibatá - Vista aérea"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6">
              <p className="text-white/90 text-base md:text-lg">Estilo de vida incomparable en Querétaro</p>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6">
          {/* About Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Acerca de Zibatá</h3>
            <p className="text-gray-600">
              Zibatá se ha convertido en uno de los mejores lugares para vivir en Querétaro, destacando por su calidad de vida, seguridad y comodidades. Este desarrollo cuenta con más de 30 condominios residenciales exclusivos, rodeados de amplias áreas verdes y con un enfoque sustentable, incluyendo su propia planta de tratamiento de agua.
            </p>
          </div>

          {/* Amenities Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Amenidades</h3>
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
            <div className="mt-5">
              <h4 className="font-medium text-sm text-gray-600 mb-2">Parques de Zibatá</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Servicios y Comercios</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
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
            <h4 className="font-medium text-sm text-gray-600 mb-2">Plazas Comerciales</h4>
            <div className="grid grid-cols-2 gap-2">
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
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Instalaciones Deportivas</h3>
            <div className="grid grid-cols-2 gap-2">
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
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Educación</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
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
            <div className="grid grid-cols-2 gap-2">
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
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Mapa del desarrollo</h3>
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
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Ubicación</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
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
            <div className="grid grid-cols-2 gap-2">
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
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-gray-600 text-sm italic">
              "Vivir en Zibatá significa elegir comodidad, seguridad y estilo de vida en un solo lugar, 
              disfrutando de la mejor mezcla entre naturaleza y desarrollo urbano planificado que Querétaro ofrece."
            </p>
          </div>

            {/* Contact CTA */}
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-6 text-center">
              <h3 className="text-xl font-medium mb-2 text-violet-800">¿Te gustaría vivir aquí?</h3>
              <p className="text-sm text-violet-600 mb-4">Contacta a nuestros agentes para conocer las propiedades disponibles</p>
              <div className="flex justify-center pt-1">
                <AdvisorModal
                  page="CTA propiedad page footer"
                  rounded="full"
                  backgroundColor="bg-violet-600"
                  textColor="text-white"
                  showIcon={true}
                  iconName="FaChevronRight"
                  iconPosition="right"
                  buttonText="Habla con un asesor" 
                />
              </div>
              </div>

        </div>
      </div>
    </>
  );
}