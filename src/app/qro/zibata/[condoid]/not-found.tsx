import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Condominio no encontrado</h2>
      <p className="text-gray-600 mb-8">
        No pudimos encontrar el condominio que estás buscando.
      </p>
      <Link 
        href="/zonas" 
        className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Ver todas las zonas
      </Link>
    </div>
  );
}
