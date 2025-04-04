"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  signIn, 
  getCurrentUser, 
  checkIfUserIsAdmin, 
  checkIfUserIsAdvisor,
  createOrUpdateUser
} from '@/app/shared/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        await routeUserBasedOnRole(user);
      }
    };

    checkAuth();
  }, [router]);

  // Function to route a user based on their role
  const routeUserBasedOnRole = async (user: any) => {
    try {
      console.log('Routing user based on role:', user.uid);
      
      // Store or update the user in the users collection
      await createOrUpdateUser(user);
      
      // Check roles and route accordingly
      console.log('Checking if user is admin...');
      const isAdmin = await checkIfUserIsAdmin(user.uid);
      console.log('Is admin:', isAdmin);
      
      if (isAdmin) {
        console.log('Redirecting to admin dashboard');
        router.push('/admin');
        return;
      }
      
      console.log('Checking if user is advisor...');
      const isAdvisor = await checkIfUserIsAdvisor(user.uid);
      console.log('Is advisor:', isAdvisor);
      
      if (isAdvisor) {
        console.log('Redirecting to advisor dashboard');
        router.push('/asesor');
        return;
      }
      
      // Regular user
      console.log('Redirecting to regular user page');
      router.push('/lista-propiedades');
    } catch (error) {
      console.error('Error routing user:', error);
      router.push('/lista-propiedades');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await signIn(email, password);
      await routeUserBasedOnRole(user);
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión';
      
      // Provide more specific error messages
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo electrónico';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intente más tarde';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50/50">


      {/* Main content */}
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Iniciar Sesión</h1>
          <p className="mt-2 text-sm text-gray-600">
            Portal para agentes inmobiliarios
          </p>
        </div>
        
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-colors duration-200"
                placeholder="nombre@ejemplo.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-colors duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full px-4 py-3 text-sm font-medium rounded-lg
              transition-all duration-200 shadow-sm
              ${loading 
                ? 'bg-violet-100 text-violet-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-violet-800 to-violet-700 text-white hover:from-violet-900 hover:to-violet-800 hover:shadow'}
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-violet-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-sm text-violet-600 hover:text-violet-800 transition-colors duration-200"
          >
            Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}