import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  ArrowUpRight, MapPin, Leaf, Trees, Droplet, Bird, 
  Circle, CircleDot, MountainSnow, Flower2, Key, Shield, 
  Clock, Paintbrush, Palette, Ship, Waves, Building, Eye, Heart, BadgeCheck
} from 'lucide-react';
import { IoGolf } from 'react-icons/io5';
import { FaTree, FaLeaf, FaMountain, FaWater } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Ziqua Land Art | Exclusivo desarrollo en Zibatá',
  description: 'Descubre Ziqua Land Art, un concepto único que integra arte, naturaleza y arquitectura en un desarrollo exclusivo en Zibatá, Querétaro.',
  keywords: 'Ziqua, Land Art, Zibatá, terrenos, lotes, desarrollo residencial, arte, naturaleza, Querétaro',
  openGraph: {
    title: 'Ziqua Land Art | Exclusivo desarrollo en Zibatá',
    description: 'Un concepto único que integra arte, naturaleza y arquitectura',
    images: [{ url: '/assets/zibata/ziqua-header.jpg' }],
    type: 'website',
  },
}

export default function ZiquaPage() {
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

  // Nuevas amenidades principales
  const mainAmenities = [
    { 
      icon: <IoGolf className="w-16 h-16" />, 
      name: "Campo de Golf", 
      description: "18 hoyos diseñados por expertos" 
    },
    { 
      icon: <Trees className="w-16 h-16" />, 
      name: "Áreas Verdes", 
      description: "Más de 40 hectáreas de espacios naturales" 
    },
    { 
      icon: <Paintbrush className="w-16 h-16" />, 
      name: "Land Art", 
      description: "Instalaciones artísticas integradas" 
    },
    { 
      icon: <Building className="w-16 h-16" />, 
      name: "Club House", 
      description: "Amenidades exclusivas para residentes" 
    },
    { 
      icon: <Shield className="w-16 h-16" />, 
      name: "Seguridad", 
      description: "Control de acceso y vigilancia 24/7" 
    }
  ];

  return (
    <main className="min-h-screen">
      {/* Header Sticky */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 h-[100px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 relative">
              <Image
                src="/assets/preventa/ziqua/logoZiqua.png"
                alt="Logo Ziqua"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-neutral-900 text-xl font-medium">ZIQUA</h1>
              <p className="text-neutral-500 text-xs">Land Art Living</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              <div className="flex items-center gap-4">
                <span className="text-neutral-600 text-sm">Desde $4.5M MXN</span>
                <span className="h-4 w-[1px] bg-neutral-200"></span>
                <span className="text-neutral-600 text-sm">Zibatá, Qro</span>
              </div>
            </div>
            
            <Link
              href="/contacto"
              className="bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors text-sm"
            >
              Agendar visita
            </Link>
          </div>
        </div>
      </header>

      {/* Banner inicial con tema blanco */}
      <section className="relative">
        {/* Background image */}
        <div className="absolute inset-0 bg-white">
          <Image
            src="/assets/zibata/zibata.jpg" // Imagen de alta calidad
            alt="Ziqua Land Art"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white/90" />
        </div>

        {/* Contenido del banner */}
        <div className="relative max-w-7xl mx-auto px-4 py-16 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            {/* Información principal */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 relative">
                  <Image
                    src="/assets/preventa/ziqua/logoZiqua.png"
                    alt="Logo Ziqua"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <p className="text-neutral-500 text-sm">Desarrollo exclusivo</p>
                  <h1 className="text-neutral-900 text-xl font-medium">ZIQUA LAND ART</h1>
                </div>
              </div>

              <div className="flex items-center gap-2 text-neutral-600">
                <MapPin size={18} />
                <span className="text-sm">Zibatá, Querétaro</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Premium", "Vista al campo", "Land Art", "Preventa"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-1">
                <p className="text-neutral-500 text-sm">Desde</p>
                <p className="text-neutral-900 text-3xl font-light">$4,500,000 MXN</p>
                <p className="text-neutral-500 text-sm">Terrenos de 500 - 700 m²</p>
              </div>
            </div>

            {/* Características y CTA */}
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Superficie", value: "500-700 m²" },
                  { label: "Entrega", value: "Inmediata" },
                  { label: "Amenidades", value: "Premium" },
                  { label: "Financiamiento", value: "Disponible" },
                ].map((item) => (
                  <div key={item.label} className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                    <p className="text-neutral-500 text-xs mb-1">{item.label}</p>
                    <p className="text-neutral-900 font-medium">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contacto"
                  className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-800 transition-colors flex-1 text-center"
                >
                  Agendar visita
                </Link>
                <button
                  className="bg-neutral-100 text-neutral-900 px-8 py-3 rounded-lg hover:bg-neutral-200 transition-colors flex-1"
                >
                  Descargar brochure
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nueva Galería */}
      <section className="relative w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[80vh]">
            {/* Imagen Cuadrada */}
            <div className="md:col-span-6 relative rounded-xl overflow-hidden">
              <Image
                src="/assets/zibata/zibata.jpg"
                alt="Ziqua Land Art Vista Principal"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Contenedor de imágenes verticales */}
            <div className="md:col-span-6 grid grid-rows-2 gap-4 h-full">
              {/* Imagen Vertical 1 */}
              <div className="relative rounded-xl overflow-hidden">
                <Image
                  src="/assets/zibata/zibata.jpg"
                  alt="Ziqua Land Art Detalle 1"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Imagen Vertical 2 */}
              <div className="relative rounded-xl overflow-hidden">
                <Image
                  src="/assets/zibata/zibata.jpg"
                  alt="Ziqua Land Art Detalle 2"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nueva sección de Amenidades */}
      <section className="relative w-full bg-white py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-neutral-100 text-neutral-600 px-4 py-1 rounded-full text-sm mb-4">
              Amenidades
            </span>
            <h2 className="text-4xl font-light mb-4">Vive la experiencia Ziqua</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Descubre los espacios exclusivos diseñados para brindarte una experiencia única
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {mainAmenities.map((amenity, index) => (
              <div 
                key={index} 
                className="group bg-neutral-50 p-8 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="text-neutral-300 group-hover:text-neutral-900 transition-colors duration-300">
                    {amenity.icon}
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900">
                    {amenity.name}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {amenity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rest of the sections... */}
    </main>
  );
}
