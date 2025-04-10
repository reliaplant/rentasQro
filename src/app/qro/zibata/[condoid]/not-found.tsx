import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 text-center">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">Condominio no encontrado</h2>
      <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">
        No pudimos encontrar el condominio que estás buscando.
      </p>
      <Link 
        href="/zonas" 
        className="px-4 md:px-5 py-1.5 md:py-2 bg-blue-600 text-white text-sm md:text-base rounded-md hover:bg-blue-700"
      >
        Ver todas las zonas
      </Link>
    </div>
  );
}
