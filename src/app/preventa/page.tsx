import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import React from 'react'
import { 
  FaBed, FaSwimmingPool, FaDumbbell, 
  FaTree, FaBuilding, FaLock,
  FaBriefcase, FaUmbrellaBeach,
  FaStar, // Añadir este import
  FaCrown // Reemplazar FaDiamond por FaCrown
} from 'react-icons/fa'
import AdvisorModal from '@/app/components/AdvisorModal'

export const metadata: Metadata = {
  title: 'Condominios en Preventa | Luxury Living Querétaro',
  description: 'Explora nuestra exclusiva colección de desarrollos en preventa en Querétaro. Descubre oportunidades únicas de inversión en las zonas más prestigiosas.',
  keywords: 'preventa querétaro, desarrollos nuevos, inversión inmobiliaria, condominios lujo querétaro, zibatá'
}

const preVentaProjects = [
  {
    id: 'ziqua',
    name: 'Ziqua',
    location: 'Zibatá, Querétaro',
    price: 'Desde $3.2M',
    delivery: 'Entrega 2026',
    image: '/assets/preventa/ziqua/Casa-Club-Ziqua-Land-Art (1).webp',
    logo: '/assets/preventa/ziqua/logoZiqua.png',
    description: 'Vive en el corazón de El Refugio. Un desarrollo que redefine el lujo contemporáneo con amenidades premium y ubicación privilegiada.',
    features: ['Rooftop', 'Gimnasio equipado', 'Alberca', 'Business Center', 'Área de Spa', 'Club House'],
    totalAmenities: 19, // Añadir número total de amenidades
    specifications: {
      size: '90-120m²',
      bedrooms: '2-3 recámaras'
    },
    models: [
      { name: 'Garden House', size: '90m²', price: '$3.2M', bedrooms: 2, bathrooms: 2 },
      { name: 'Sky View', size: '105m²', price: '$3.8M', bedrooms: 2, bathrooms: 2.5 },
      { name: 'Penthouse', size: '120m²', price: '$4.5M', bedrooms: 3, bathrooms: 3 }
    ]
  },
  {
    id: 'zen-house',
    name: 'Zen House',
    location: 'Juriquilla, Querétaro',
    price: 'Terrenos desde $2.8M',
    delivery: 'Entrega 2026',
    image: '/assets/zibata/zibata.jpg',
    description: 'Residencias exclusivas de autor donde podrás construir la casa de tus sueños. Terrenos premium en una ubicación privilegiada.',
    features: ['Terrenos desde 300m²', 'Club House', 'Área Zen', 'Casa Club'],
    customBuild: {
      lotSizes: ['300m²', '350m²', '400m²'],
      restrictions: 'Diseño arquitectónico sujeto a aprobación',
      buildingTimeframe: '24 meses para iniciar construcción'
    }
  }
]

const getFeatureIcon = (feature: string) => {
  const icons: { [key: string]: React.JSX.Element } = {
    'Área de Spa': <FaUmbrellaBeach className="w-3 h-3" />,
    'Gimnasio equipado': <FaDumbbell className="w-3 h-3" />,
    'Club House': <FaBuilding className="w-3 h-3" />,
    'Área Verde': <FaTree className="w-3 h-3" />,
    'Seguridad 24/7': <FaLock className="w-3 h-3" />,
    'Business Center': <FaBriefcase className="w-3 h-3" />,
    'Alberca': <FaSwimmingPool className="w-3 h-3" />,
    'Sky Lounge': <FaBuilding className="w-3 h-3" />,
  }
  return icons[feature] || null
}

export default function PreVenta() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full bg-[#FAF4E5]">
        <div className="max-w-[1920px] mx-auto">
          <div className="grid lg:grid-cols-2 items-stretch min-h-[500px]">
            {/* Texto principal */}
            <div className="flex items-center order-2 lg:order-1">
              <div className="w-full max-w-2xl mx-auto px-4 sm:px-[vw] py-8 lg:py-16">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-violet-50 text-violet-800 border border-violet-500 rounded-full">
                  Pre-venta 2025
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-light mb-4 text-gray-900 leading-tight">
                  Desarrollos exclusivos en
                  <span className="block text-amber-700 mt-1">zonas premium</span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light mb-6 leading-relaxed">
                  Descubre oportunidades únicas de inversión en las mejores ubicaciones de Querétaro
                </p>
                
                <div className="flex gap-4 pt-2">
                <AdvisorModal
                  page="Banner Preventa"
                  rounded="full"
                  backgroundColor="bg-black"
                  textColor="text-white"
                  showIcon={true}
                  iconName="FaChevronRight"
                  iconPosition="right"
                  buttonText="Habla con un asesor" 
                />
              </div>
              </div>
            </div>

            {/* Imagen única */}
            <div className="relative order-1 lg:order-2 lg:absolute lg:right-0 lg:top-0 lg:w-1/2 lg:h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
              <Image
              src="/assets/preventa/landingPreventa/preventaQro.png"
              alt="Preventa Casas Querétaro"
              fill
              className="object-cover"
              priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Projects Sections */}
      <div className="max-w-8xl mx-auto px-4 sm:px-[5vw] py-8 sm:py-12 grid gap-6 sm:gap-10 bg-gray-50">
        {preVentaProjects.map((project, index) => (
          <section key={project.id} className="group">
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white">
              <div className={`grid grid-cols-1 lg:grid-cols-2 ${index % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}>
                {/* Image Side con precio y badge de lujo */}
                <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-full">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover w-full h-full"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Logo */}
                  {project.logo && (
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white w-20 h-20 sm:w-26 sm:h-26 p-1.5 sm:p-2 rounded-lg shadow-xl border border-gray-200/40">
                      <Image
                        src={project.logo}
                        alt={`Logo ${project.name}`}
                        width={100}
                        height={100}
                        className="object-contain w-full h-full [filter:invert(1)]"
                      />
                    </div>
                  )}
                  {/* Precio destacado */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-lg">
                    <p className="text-sm sm:text-base text-gray-900 font-semibold">{project.price}</p>
                  </div>
                  {/* Badge de lujo - versión elegante y minimalista */}
                  {project.id === 'ziqua' && (
                    <div className="absolute top-12 sm:top-16 right-3 sm:right-4">
                      <div className="flex items-center bg-white/95 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg border border-gray-100">
                        <FaCrown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 mr-1 sm:mr-2" />
                        <div className="flex flex-col">
                          <span className="text-[8px] sm:text-[10px] text-gray-500 font-medium leading-none">RESIDENCIA</span>
                          <span className="text-[10px] sm:text-xs text-gray-900 font-semibold leading-none">LUXURY</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Gradient y fecha de entrega - nuevo diseño */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-lg px-3 sm:px-4 py-1.5 sm:py-2 rounded border border-white/10">
                      <div className="flex gap-2 sm:gap-3 items-center">
                        <span className="text-[8px] sm:text-[10px] text-gray-400 font-medium uppercase tracking-wider">Entrega</span>
                        <span className="text-xs sm:text-sm text-white tracking-wide">{project.delivery.replace('Entrega ', '')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Side - removido el precio de aquí */}
                <div className="p-4 sm:p-6 lg:p-8">
                  <h2 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3">{project.name}</h2>
                  <p className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">{project.location}</p>
                  <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm">{project.description}</p>
                  
                  {/* Modelos disponibles - grid 2x2 - fix for window reference error */}
                  {project.models ? (
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-light mb-2 sm:mb-3">Modelos Disponibles</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {project.models.map((model, idx) => (
                          <div 
                            key={idx} 
                            className={`p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors
                              ${project.models.length % 2 !== 0 && idx === project.models.length - 1 ? "sm:col-span-2" : ""}`}
                          >
                            <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                              <h4 className="font-medium text-sm sm:text-base">{model.name}</h4>
                              <span className="font-semibold text-blue-900 text-sm sm:text-base">{model.price}</span>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-600">
                              {model.bedrooms} Rec · {model.bathrooms} Baños · {model.size}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : project.customBuild ? (
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-light mb-2 sm:mb-3">Construcción Personalizada</h3>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm">
                        <p className="text-gray-600 mb-1 sm:mb-2">Terrenos disponibles: {project.customBuild.lotSizes.join(', ')}</p>
                        <p className="text-gray-600 mb-1">{project.customBuild.restrictions}</p>
                        <p className="text-gray-600">{project.customBuild.buildingTimeframe}</p>
                      </div>
                    </div>
                  ) : null}
                  
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-light mb-1.5 sm:mb-2">Amenidades</h3>
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                      {project.features.map((feature, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-50 text-gray-700 text-[10px] sm:text-xs rounded-full hover:bg-gray-100 transition-colors"
                        >
                          {getFeatureIcon(feature)}
                          {feature}
                        </span>
                      ))}
                      {project.totalAmenities && (
                        <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-50 text-gray-500 text-[10px] sm:text-xs rounded-full hover:bg-gray-100 transition-colors">
                          +{project.totalAmenities - project.features.length} amenidades
                        </span>
                      )}
                    </div>
                  </div>

                  <Link href={`/preventa/zibata/${project.id}`}
                        className="inline-block bg-gray-900 text-white px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm rounded-lg hover:bg-gray-800 transition-colors">
                    Ver Desarrollo
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}

