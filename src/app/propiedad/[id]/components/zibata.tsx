import Image from 'next/image';
import { Map, Building, Trees, School, LandPlot, Globe, Car, ShoppingBag, GraduationCap, Dog, Clock, Store, HeartPulse } from 'lucide-react';

export default function ZibataInfo() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <div className="relative h-64 md:h-80">
        <Image
          src="/assets/condos/Antalia-Residencial-Zibata-Queretaro-Fraccionamiento-min-1200x900.png"
          alt="Zibatá - Vista aérea"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-6 text-white">
            <h2 className="text-2xl font-bold">Zibatá</h2>
            <p className="text-gray-200">Estilo de vida incomparable en Querétaro</p>
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
          <h3 className="text-xl font-semibold mb-4">Amenidades</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Trees className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Parques y áreas verdes</h4>
                <p className="text-sm text-gray-600">Extensos parques como Jamadi, Saki y Nandú con senderos naturales</p>
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

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Ubicación estratégica</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                <Car className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-gray-700">Centro histórico de Querétaro (20 min)</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                <Car className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-gray-700">Paseo Querétaro (12 min), Juriquilla (20 min)</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                <Car className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-gray-700">El Refugio (7 min), Zakia (5 min)</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                <Map className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-gray-700">Tres entradas independientes que agilizan la movilidad</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 italic">
            "Vivir en Zibatá significa elegir comodidad, seguridad y estilo de vida en un solo lugar, 
            disfrutando de la mejor mezcla entre naturaleza y desarrollo urbano planificado que Querétaro ofrece."
          </p>
        </div>
      </div>
    </div>
  );
}