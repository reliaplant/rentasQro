"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, signOut, onAuthStateChange } from '@/app/services/firebase';
import type { User } from 'firebase/auth';

export default function Menu() {
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Handle clicking outside dropdown to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    // Cleanup subscription
    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  if (loading) {
    return <nav className="bg-white shadow-sm h-16"></nav>;
  }

  return (
    <nav className="bg-white  z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex">
            <Link 
              href="/"
              className="flex items-center"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold p-2 rounded-lg mr-2">
                  RQ
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                  RentasQro
                </span>
              </div>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:items-center space-x-6">
              <Link 
                href="/?type=renta"
                className={`px-1 py-1 text-sm font-medium border-b-2 ${
                  pathname?.includes('type=renta') 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Rentar
              </Link>
              <Link 
                href="/?type=venta"
                className={`px-1 py-1 text-sm font-medium border-b-2 ${
                  pathname?.includes('type=venta') 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Comprar
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-6">
            <Link
              href={user ? "/crearPropiedad" : "/login"}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Propiedad
            </Link>

            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-white font-medium shadow-sm transition-transform hover:scale-105">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-3 w-64 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/mis-propiedades"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                          <path d="M4 13H10C10.55 13 11 12.55 11 12V4C11 3.45 10.55 3 10 3H4C3.45 3 3 3.45 3 4V12C3 12.55 3.45 13 4 13ZM4 21H10C10.55 21 11 20.55 11 20V16C11 15.45 10.55 15 10 15H4C3.45 15 3 15.45 3 16V20C3 20.55 3.45 21 4 21ZM14 21H20C20.55 21 21 20.55 21 20V12C21 11.45 20.55 11 20 11H14C13.45 11 13 11.45 13 12V20C13 20.55 13.45 21 14 21ZM13 4V8C13 8.55 13.45 9 14 9H20C20.55 9 21 8.55 21 8V4C21 3.45 20.55 3 20 3H14C13.45 3 13 3.45 13 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Mis Propiedades
                      </Link>
                      <Link
                        href="/perfil-asesor"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Mi Perfil
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="mr-3 h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none">
                          <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-4 space-y-1">
            <Link
              href="/?type=renta"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname?.includes('type=renta') 
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Rentar
            </Link>
            <Link
              href="/?type=venta"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname?.includes('type=venta') 
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Comprar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}