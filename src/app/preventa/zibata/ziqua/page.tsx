"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { 
  ArrowUpRight, MapPin, Leaf, Trees, Droplet, Bird, 
  Circle, CircleDot, MountainSnow, Flower2, Key, Shield, 
  Clock, Paintbrush, Palette, Ship, Waves, Building, Eye, Heart, BadgeCheck,
  Home, Bath, BedDouble, SquareArrowOutUpRight, Users, Landmark, Ruler
} from 'lucide-react';
import { IoGolf } from 'react-icons/io5';
import { FaTree, FaLeaf, FaMountain, FaWater, FaParking } from 'react-icons/fa';
import ZibataInfo from '@/app/propiedad/[id]/components/zibata';
import ZibataMapWrapper from '@/app/components/ZibataMapWrapper';
import ModelGalleryModal, { HousingModel } from './components/ModelGalleryModal';

// Metadata is now handled in layout.tsx

export default function ZiquaPage() {
  const [selectedModel, setSelectedModel] = useState<HousingModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Amenidades y características
  const amenities = [
    { icon: <MountainSnow size={18} />, name: "Vistas panorámicas" },
    { icon: <IoGolf size={18} />, name: "Campo de golf" },
    { icon: <Trees size={18} />, name: "Áreas verdes" },
    { icon: <Waves size={18} />, name: "Lago artificial" },
    { icon: <Paintbrush size={18} />, name: "Intervenciones artísticas" },
    { icon: <Building size={18} />, name: "Arquitectura de autor" },
    { icon: <Shield size={18} />, name: "Seguridad 24/7" },
    { icon: <FaTree size={18} />, name: "Senderos naturales" },
  ];

  // Beneficios del concepto
  const benefits = [
    {
      icon: <Palette className="h-10 w-10 text-violet-600" />,
      title: "Land Art",
      description: "Concepto donde el arte y la naturaleza se fusionan para crear espacios únicos"
    },
    {
      icon: <FaMountain className="h-10 w-10 text-violet-600" />,
      title: "Topografía privilegiada",
      description: "Terrenos con distintas elevaciones que ofrecen vistas espectaculares"
    },
    {
      icon: <FaLeaf className="h-10 w-10 text-violet-600" />,
      title: "Sustentabilidad",
      description: "Desarrollo con conciencia ecológica y respeto por el entorno natural"
    },
    {
      icon: <FaWater className="h-10 w-10 text-violet-600" />,
      title: "Elementos acuáticos",
      description: "Incorporación de cuerpos de agua que enriquecen el paisaje natural"
    }
  ];

  // Especificaciones de terrenos
  const lotSpecs = [
    { value: "500-700", unit: "m²", label: "Superficie de terrenos" },
    { value: "3", unit: "años", label: "Plazo para construir" },
    { value: "70%", unit: "", label: "Máx. área construible" },
    { value: "3", unit: "niveles", label: "Altura máxima" }
  ];



  // Nuevos modelos de vivienda
  const housingModels: HousingModel[] = [
    {
      name: "Garden Residence",
      image: "/assets/preventa/ziqua/modelocasa2.png",
      price: "MXN 5,890,000",
      area: 165,
      bedrooms: 2,
      bathrooms: 2.5,
      features: ["Jardín privado", "Roof Garden", "Cocina equipada"],
      available: true
    },
    {
      name: "Sky Residence",
      image: "/assets/preventa/ziqua/modelocasa2.png",
      price: "MXN 6,450,000",
      area: 185,
      bedrooms: 3,
      bathrooms: 3,
      features: ["Vista al campo", "Terraza", "Walk-in closet"],
      available: true
    },
    {
      name: "Luxury Penthouse",
      image: "/assets/preventa/ziqua/modelocasa2.png",
      price: "$8,750,000",
      area: 235,
      bedrooms: 3,
      bathrooms: 3.5,
      features: ["Doble altura", "Jacuzzi", "Acceso privado"],
      available: false
    }
  ];

  // Información general del desarrollo
  const developmentInfo = [
    { icon: <Users size={20} />, value: "232", label: "Unidades" },
    { icon: <Landmark size={20} />, value: "60,000", label: "m² totales" },
    { icon: <Home size={20} />, value: "60-111", label: "m² construcción" },
    { icon: <BedDouble size={20} />, value: "1-3", label: "Recámaras" },
    { icon: <FaParking size={20} />, value: "1-2", label: "Estacionamientos" },
    { icon: <Bath size={20} />, value: "1-2", label: "Baños" },
  ];

  const openModal = (model: HousingModel) => {
    setSelectedModel(model);
    setIsModalOpen(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedModel(null);
    // Restore scrolling
    document.body.style.overflow = 'auto';
  };

  return (
    <main className="min-h-screen">
      {/* Hero Cover Image */}
      <section className="relative w-full h-[70vh]">
        <Image
          src="/assets/preventa/ziqua/entradaziqua.png"
          alt="Ziqua Land Art"
          fill
          className="object-cover"
          priority
        />
        {/* Darker overlay for better contrast with white logos */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        
        {/* Container to ensure alignment of all elements */}
        <div className="absolute inset-0 flex flex-col justify-between">
          <div className="max-w-7xl w-full mx-auto !px-8 md:px-12 pt-12">
            {/* Ziqua Logo in header */}
            <div className="min-h-40 min-w-40 max-h-40 max-w-40 relative rounded-lg ">

            <Image
                src="/assets/preventa/ziqua/logoZiqua.png"
                alt="Logo Ziqua"
                fill
                className="object-contain"
                priority
              />
            </div>

          </div>
          
          {/* Info section at the bottom - Using the same container width */}
          <div className="w-full pb-8 md:pb-12">
            <div className="max-w-7xl mx-auto px-8 md:px-12">
              <div>
                <h1 className="!text-white text-3xl md:text-4xl font-medium">ZIQUA LAND ART</h1>
                <div className="flex items-center gap-3 text-white/90 mt-2">
                  <MapPin size={18} />
                  <span className="text-base md:text-lg">Zibatá, El Marqués, Querétaro</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-4">
                {["Premium", "Vista al campo", "Land Art", "Preventa"].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Información General */}
      <section className="relative w-full bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light mb-4">Información General</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Un exclusivo desarrollo que integra el arte y la naturaleza para crear una experiencia única de vida.
            </p>
          </div>

          <div className="mt-12 bg-neutral-50 p-6 rounded-xl">
            <div className="flex items-start gap-4">
              <MapPin className="text-neutral-700 mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-1">Ubicación Privilegiada</h3>
                <p className="text-neutral-600">
                  Ziqua se encuentra estratégicamente ubicado en Zibatá, una de las zonas con mayor plusvalía de El Marqués, Querétaro. 
                  A solo 15 minutos del centro comercial Antea y con fácil acceso a las principales vías de comunicación.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-12">
            {developmentInfo.map((info, index) => (
              <div key={index} className="flex flex-col items-center p-6 bg-neutral-50 rounded-xl">
                <div className="text-neutral-700 mb-2">
                  {info.icon}
                </div>
                <p className="text-xl font-medium text-neutral-900">{info.value}</p>
                <p className="text-sm text-neutral-600">{info.label}</p>
              </div>
            ))}
          </div>


        </div>
      </section>

      {/* Modelos de Vivienda */}
      <section className="relative w-full bg-white py-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4">Elige tu espacio ideal</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Diseños arquitectónicos que se adaptan a diferentes estilos de vida y necesidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {housingModels.map((model, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 ${!model.available ? 'opacity-75' : ''}`}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={model.image as string}
                    alt={model.name}
                    fill
                    className="object-cover"
                  />
                  {!model.available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-md font-medium text-sm">
                        Agotado
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-neutral-900/80 text-white px-3 py-1 rounded-md text-sm backdrop-blur-sm">
                    {model.price}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    {model.name}
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-neutral-600">
                      <Home size={16} />
                      <span className="text-sm">{model.area} m²</span>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-600">
                      <BedDouble size={16} />
                      <span className="text-sm">{model.bedrooms} Rec</span>
                    </div>
                    <div className="flex items-center gap-1 text-neutral-600">
                      <Bath size={16} />
                      <span className="text-sm">{model.bathrooms} Baños</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    {model.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CircleDot size={14} className="text-violet-500" />
                        <span className="text-sm text-neutral-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className={`w-full flex items-center justify-center gap-2 rounded-lg py-3 px-4 text-sm transition-colors
                      ${model.available 
                        ? 'bg-neutral-900 text-white hover:bg-neutral-800' 
                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}
                    disabled={!model.available}
                    onClick={() => model.available && openModal(model)}
                  >
                    {model.available ? (
                      <>
                        Ver detalles
                        <SquareArrowOutUpRight size={16} />
                      </>
                    ) : 'No disponible'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <span className="text-sm text-neutral-500 block mb-3">
              Precios sujetos a cambios sin previo aviso
            </span>
          </div>
        </div>
      </section>

      {/* Amenidades con imágenes */}
      <section className="relative w-full bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-neutral-100 text-neutral-600 px-4 py-1 rounded-full text-sm mb-4">
              Amenidades
            </span>
            <h2 className="text-3xl font-light mb-4">Vive la experiencia Ziqua</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Descubre los espacios exclusivos diseñados para brindarte una experiencia única
            </p>
          </div>

          {/* Vista general de las amenidades */}
          <div className="mb-16">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
              <Image
                src="/assets/preventa/ziqua/Casa-Club-Ziqua-Land-Art (1).webp"
                alt="Vista general de amenidades"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end">
                <div className="p-8">
                  <h3 className="!text-white text-2xl font-medium mb-2">Club House Ziqua</h3>
                  <p className="!text-white/90 max-w-2xl">
                    Nuestro Club House cuenta con todas las comodidades que necesitas para disfrutar de un estilo de vida premium.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Listado de amenidades con imágenes */}
          <div className="space-y-24">
            {[
              {
                name: "Área de Meditación",
                description: "Un espacio tranquilo diseñado para el bienestar y la relajación.",
                image: "/assets/preventa/ziqua/meditacion.png"
              },
              {
                name: "Juegos Infantiles",
                description: "Zona recreativa especialmente diseñada para el disfrute de los más pequeños.",
                image: "/assets/preventa/ziqua/juegosinfantiles.png"
              },
              {
                name: "Alberca con Jacuzzi y Pool Bar",
                description: "Disfruta de momentos refrescantes en nuestra alberca de diseño con jacuzzi y servicio de bar.",
                image: "/assets/preventa/ziqua/alberca.png"
              },
              {
                name: "Fogateros",
                description: "Áreas sociales con fogateros para disfrutar de momentos especiales al aire libre.",
                image: "/assets/preventa/ziqua/fogatero.png"
              },
              {
                name: "Área Techada para Ping-Pong",
                description: "Espacio recreativo techado ideal para disfrutar en cualquier temporada.",
                image: "/assets/preventa/ziqua/pingpong.png"
              },
              {
                name: "Gimnasio",
                description: "Instalaciones con equipo de última generación para mantener un estilo de vida activo.",
                image: "/assets/preventa/ziqua/gym.png"
              },
              {
                name: "Salón de Usos Múltiples con Terraza y Cocineta",
                description: "Espacio versátil para eventos sociales, reuniones y celebraciones con vistas panorámicas.",
                image: "/assets/preventa/ziqua/salon.png"
              }
            ].map((amenity, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}>
                <div className="w-full md:w-1/2 space-y-4">
                  <h3 className="text-2xl font-light text-neutral-900">{amenity.name}</h3>
                  <p className="text-neutral-600">{amenity.description}</p>
                </div>
                <div className="w-full md:w-1/2 h-[300px] relative rounded-xl overflow-hidden">
                  <Image
                    src={amenity.image}
                    alt={amenity.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Sección de Lotes - Renamed to Mapa del Desarrollo and removed shadow/Master Plan text */}
      <section className="relative w-full bg-neutral-50 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4">Mapa del Desarrollo</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Visualiza la distribución de los terrenos en nuestro exclusivo desarrollo
            </p>
          </div>

          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
            <Image
              src="/assets/preventa/ziqua/lotesZiqua.png"
              alt="Mapa Ziqua Land Art"
              fill
              className="object-contain bg-white"
            />
          </div>
          
          <div className="mt-8 text-center">
            <Link 
              href="/contacto"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Consultar disponibilidad
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Mapa de Zibatá */}
      <section className="relative w-full bg-white py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-neutral-100 text-neutral-600 px-4 py-1 rounded-full text-sm mb-4">
              Ubicación
            </span>
            <h2 className="text-3xl font-light mb-4">Ziqua en Zibatá</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Ubicación estratégica dentro de la ciudad planeada Zibatá
            </p>
          </div>

          <div className="w-full h-[500px] rounded-xl overflow-hidden">
            <ZibataMapWrapper 
              highlightedPolygonId="ziqua" 
              height="100%"
            />
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              href="/qro/zibata"
              className="inline-flex items-center gap-2 text-neutral-700 hover:text-neutral-900"
            >
              <span>Ver más sobre Zibatá</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de ZibataInfo */}
      <section className="relative w-full bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <ZibataInfo />
        </div>
      </section>

      {/* Modal for displaying model details */}
      <ModelGalleryModal 
        model={selectedModel} 
        isOpen={isModalOpen} 
        onClose={closeModal}
      />
    </main>
  );
}
