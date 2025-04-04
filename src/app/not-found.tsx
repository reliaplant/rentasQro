import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          Página no encontrada
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
        <div className="mt-6">
          <Link 
            href="/"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
