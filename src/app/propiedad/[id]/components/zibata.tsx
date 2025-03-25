import Image from 'next/image';
import { Map, Building, Trees, School, LandPlot, Globe, Car, ShoppingBag, GraduationCap, Dog, Clock, Store, HeartPulse, ShoppingCart, Plane } from 'lucide-react';
import { BiBall } from 'react-icons/bi';
import { IoGolf } from 'react-icons/io5';

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

  return (
    <div className="p-4 md:p-0 shadow-md">
      <div className="relative h-64 md:h-80">
        <Image
          src="/assets/zibata/zibata.jpg"
          alt="Zibatá - Vista aérea"
          fill
          className="object-cover rounded-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-6 text-white">
            <p className="text-gray-200 font-semibold text-xl">Estilo de vida incomparable en Querétaro</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Acerca de Zibatá</h3>
          <p className="text-gray-700 leading-relaxed">
            Zibatá se ha convertido en uno de los mejores lugares para vivir en Querétaro, destacando por su calidad de vida, seguridad y comodidades. Este desarrollo cuenta con más de 30 condominios residenciales exclusivos, rodeados de amplias áreas verdes y con un enfoque sustentable, incluyendo su propia planta de tratamiento de agua.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Amenidades</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trees className="w-4 md:w-5 h-4 md:h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm md:text-base">Áreas verdes</h4>
                <p className="text-xs md:text-sm text-gray-600">Más de 40 hectáreas de áreas verdes y parques</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div>
                <h4 className="font-medium">Instalaciones deportivas</h4>
                <p className="text-sm text-gray-600">Canchas de pádel, fútbol, básquetbol y campo de golf</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Dog className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Pet-friendly</h4>
                <p className="text-sm text-gray-600">Espacios amigables para mascotas, veterinarias y pet shops</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Sustentabilidad</h4>
                <p className="text-sm text-gray-600">Propia planta de tratamiento de agua y enfoque ecológico</p>
              </div>
            </div>

            {/* Park Images Grid */}
            <div className="col-span-full mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-xl overflow-hidden">
                {parkImages.map((src, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={src}
                      alt={`Parque Zibatá ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Servicios y Comercios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <ShoppingBag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Supermercados</h4>
                <p className="text-sm text-gray-600">HEB, Walmart Express y comercios locales</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <HeartPulse className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Servicios médicos</h4>
                <p className="text-sm text-gray-600">Centro Médico Zibatá (próximamente) y clínicas</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Store className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Plazas comerciales</h4>
                <p className="text-sm text-gray-600">Plaza Zielo, Xentric, Paseo Zibatá, Condesa y Centro Zibatá</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Building className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Servicios bancarios</h4>
                <p className="text-sm text-gray-600">Banregio, Santander y otros servicios financieros</p>
              </div>
            </div>
          </div>

          {/* Mall Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-xl overflow-hidden mt-4">
            {mallImages.map((src, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={src}
                  alt={`Plaza comercial Zibatá ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Educación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <School className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium">Colegios</h4>
                <p className="text-sm text-gray-600">Colegio NWL Newland Zibatá y otros centros educativos</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <GraduationCap className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium">Universidad</h4>
                <p className="text-sm text-gray-600">Universidad Anáhuac y acceso a instituciones educativas de prestigio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <School className="w-4 md:w-5 h-4 md:h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm md:text-base">Centros Educativos</h4>
                <p className="text-xs md:text-sm text-gray-600">Universidad Anáhuac, MomTots y más</p>
              </div>
            </div>

            {/* Education Images Grid */}
            <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
              {educationImages.map((src, index) => (
                <div key={index} className="relative aspect-video">
                  <Image
                    src={src}
                    alt={`Centro educativo ${index === 0 ? 'MomTots' : 'Universidad Anáhuac'}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Healthcare Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <HeartPulse className="w-4 md:w-5 h-4 md:h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm md:text-base">Centro Médico</h4>
                <p className="text-xs md:text-sm text-gray-600">Servicios médicos de primer nivel</p>
              </div>
            </div>

            {/* Healthcare Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src={healthImages[0]}
                alt="Centro Médico Zibatá"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        {/* Sports Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <IoGolf className="w-4 md:w-5 h-4 md:h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm md:text-base">Campo de Golf</h4>
                <p className="text-xs md:text-sm text-gray-600">Campo de golf profesional de 18 hoyos</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm mb-4">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <BiBall className="w-4 md:w-5 h-4 md:h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm md:text-base">Canchas de Padel</h4>
                <p className="text-xs md:text-sm text-gray-600">Modernas instalaciones deportivas</p>
              </div>
            </div>

            {/* Sports Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-xl overflow-hidden">
              {sportsImages.map((src, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={src}
                    alt={`Instalaciones deportivas Zibatá ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Retail Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-4 md:w-5 h-4 md:h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm md:text-base">Supermercados</h4>
                <p className="text-xs md:text-sm text-gray-600">HEB y Walmart a solo 5 minutos</p>
              </div>
            </div>

            {/* Retail Images Grid */}
            <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
              {retailImages.map((src, index) => (
                <div key={index} className="relative aspect-video">
                  <Image
                    src={src}
                    alt={`Supermercado ${index === 0 ? 'HEB' : 'Walmart'} Zibatá`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banking Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
              <div className="w-8 md:w-10 h-8 md:h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building className="w-4 md:w-5 h-4 md:h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm md:text-base">Servicios bancarios</h4>
                <p className="text-xs md:text-sm text-gray-600">Banregio, Santander y otros servicios financieros</p>
              </div>
            </div>

            {/* Bank Images Grid */}
            <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
              {bankImages.map((src, index) => (
                <div key={index} className="relative aspect-video">
                  <Image
                    src={src}
                    alt={`Banco ${index === 0 ? 'Santander' : 'Banregio'} Zibatá`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Mapa del desarrollo</h3>
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
            <Image
              src="/assets/condos/ZibataMapa.png"
              alt="Mapa de Zibatá"
              fill
              className="object-contain"
            />
            </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 italic">
            "Vivir en Zibatá significa elegir comodidad, seguridad y estilo de vida en un solo lugar, 
            disfrutando de la mejor mezcla entre naturaleza y desarrollo urbano planificado que Querétaro ofrece."
          </p>
        </div>

        {/* Location Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
                <div className="w-8 md:w-10 h-8 md:h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Car className="w-4 md:w-5 h-4 md:h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm md:text-base">Centro histórico</h4>
                  <p className="text-xs md:text-sm text-gray-600">A 20 minutos del centro de Querétaro</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-xl shadow-sm">
                <div className="w-8 md:w-10 h-8 md:h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plane className="w-4 md:w-5 h-4 md:h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm md:text-base">Aeropuerto</h4>
                  <p className="text-xs md:text-sm text-gray-600">A 25 minutos del Aeropuerto Internacional</p>
                </div>
              </div>
            </div>

            {/* Location Images Grid */}
            <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
              {locationImages.map((src, index) => (
                <div key={index} className="relative aspect-video">
                  <Image
                    src={src}
                    alt={`${index === 0 ? 'Centro histórico' : 'Aeropuerto'} de Querétaro`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}