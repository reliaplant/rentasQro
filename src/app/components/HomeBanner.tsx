import Image from 'next/image';
import AdvisorModal from './AdvisorModal';

export default function HomeBanner() {
  return (
    <div className="relative w-full min-h-[500px] flex">
      {/* Left side - Gradient background */}
      <div className="w-full lg:w-1/2 relative bg-gradient-to-tr from-[#7f5af0] via-[#9b4dff] to-[#ffd700]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[400px] h-[200px] bg-purple-600/60 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite] -top-20 -left-20"></div>
          <div className="absolute w-[300px] h-[200px] bg-cyan-400/70 rounded-full blur-3xl animate-[wave_10s_ease-in-out_infinite] top-40 left-1/2"></div>
          <div className="absolute w-[200px] h-[300px] bg-yellow-400/60 rounded-full blur-3xl animate-[float_12s_ease-in-out_infinite] bottom-0 -right-20"></div>
        </div>

        {/* Content container */}
        <div className="relative z-10 p-8 lg:p-[5vw] h-full flex flex-col justify-center">
          <div className="space-y-6 max-w-xl">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight !text-white">
                Encuentra tu
                <span className="!bg-gradient-to-r !from-amber-300 font-normal !to-amber-500 !text-transparent !bg-clip-text shadow-2l p-2">piso</span>
                en Querétaro
              </h1>
              <p className="text-lg md:text-xl !text-white/90">
                La ciudad con mayor crecimiento en México
              </p>
              <div className="flex gap-4 pt-2">
                <AdvisorModal
                  page="Home Page Banner"
                  rounded="full"
                  backgroundColor="bg-white"
                  textColor="text-black"
                  showIcon={true}
                  iconName="FaChevronRight"
                  iconPosition="right"
                  buttonText="Habla con un asesor" 
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-2xl font-bold mb-1 text-white">+120</div>
                  <p className="text-sm !text-white/80 mb-1">
                    Nuevos residentes cada día. Más de 8,000 personas eligen Querétaro mensualmente
                  </p>
                  <p className="text-xs italic !text-white/60">
                    Fuente: El Universal Querétaro, 2023
                  </p>
                </div>

                <div>
                  <div className="text-2xl font-bold mb-1 text-white">$1,200M</div>
                  <p className="text-sm !text-white/80 mb-1">
                    USD en inversión industrial. Más de 52 nuevos proyectos durante 2023
                  </p>
                  <p className="text-xs italic !text-white/60">
                    Fuente: The Logistics World, 2023
                  </p>
                </div>

                <div>
                  <div className="text-2xl font-bold mb-1 text-white">+7.22%</div>
                  <p className="text-sm !text-white/80 mb-1">
                    Plusvalía anual en 2023. La más alta entre las principales ciudades de México
                  </p>
                  <p className="text-xs italic !text-white/60">
                    Fuente: El Economista, 2023
                  </p>
                </div>

                <div>
                  <div className="text-2xl font-bold mb-1 text-white">#1</div>
                  <p className="text-sm !text-white/80 mb-1">
                    En Estado de Derecho. Segundo año consecutivo liderando el índice nacional
                  </p>
                  <p className="text-xs italic !text-white/60">
                    Fuente: World Justice Project, 2023
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block w-1/2 relative">
        <Image
          src="/assets/preventa/landingPreventa/preventaCasasQro.png"
          alt="Preventa Casas Querétaro"
          fill
          className="object-cover"
          priority
          quality={75}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM0M/d5DwAChQGFAyGkvgAAAABJRU5ErkJggg=="
          sizes="(max-width: 1024px) 0px, 50vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.jpg';
          }}
        />
      </div>
    </div>
  );
}
