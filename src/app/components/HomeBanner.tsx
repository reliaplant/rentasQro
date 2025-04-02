import Image from 'next/image';

export default function HomeBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left side - existing content with adjusted width */}
          <div className="lg:w-1/2 space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight text-gray-800">
                Encuentra tu piso en Querétaro
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                La ciudad con mayor crecimiento en México
              </p>
              <div className="flex gap-4 pt-2">
                <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Hablar con un asesor
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">+120</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Nuevos residentes cada día. Más de 8,000 personas eligen Querétaro mensualmente
                  </p>
                  <div>
                    <Image 
                      src="/assets/logos/queretaroUniversal.png" 
                      alt="El Universal Querétaro" 
                      width={120} 
                      height={20} 
                      className="object-contain"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">$1,200M</div>
                  <p className="text-sm text-gray-600 mb-2">
                    USD en inversión industrial. Más de 52 nuevos proyectos durante 2023
                  </p>
                  <div>
                    <Image 
                      src="/assets/logos/theLogisticsWorld.png" 
                      alt="The Logistics World" 
                      width={120} 
                      height={20}
                      className="object-contain"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">+7.22%</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Plusvalía anual en 2023. La más alta entre las principales ciudades de México
                  </p>
                  <div>
                    <Image 
                      src="/assets/logos/elEconomista.png" 
                      alt="El Economista" 
                      width={120} 
                      height={20}
                      className="object-contain"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">#1</div>
                  <p className="text-sm text-gray-600 mb-2">
                    En Estado de Derecho. Segundo año consecutivo liderando el índice nacional
                  </p>
                  <div>
                    <Image 
                      src="/assets/logos/wordJusticeProject.png" 
                      alt="World Justice Project" 
                      width={120} 
                      height={20}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Zibata showcase */}
          <div className="lg:w-1/2 relative">
            <div className="relative h-full rounded-2xl overflow-hidden group">
              {/* Main Image */}
              <div className="relative h-[600px] w-full">
                <Image
                  src="/assets/zibata/hero.jpg"
                  alt="Zibata Querétaro"
                  fill
                  className="object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              {/* Floating stats cards */}
              <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                <p className="text-sm font-semibold text-violet-700">Precio promedio</p>
                <p className="text-2xl font-bold">$4.2M MXN</p>
              </div>

              <div className="absolute bottom-8 left-8 max-w-sm">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Zibatá
                </h3>
                <p className="text-white/90 text-sm mb-4">
                  La zona residencial con mayor plusvalía en Querétaro. 
                  Arquitectura moderna y amenidades de primer nivel.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                    Club de Golf
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                    Business Park
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                    Town Center
                  </span>
                </div>
              </div>

              {/* Small floating images */}
              <div className="absolute -bottom-4 right-8 flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src="/assets/zibata/amenity1.jpg"
                    alt="Club House"
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
                <div className="w-20 h-20 rounded-lg overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src="/assets/zibata/amenity2.jpg"
                    alt="Golf Course"
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
