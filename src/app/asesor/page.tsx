"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, getAdvisorProfile, signOut } from "@/app/shared/firebase";
import MisPropiedades from "./misPropiedades";
import dynamic from 'next/dynamic';

// Simplified dynamic import
const CrearPropiedad = dynamic(
  () => import('./crearPropiedad/page'),
  {
    loading: () => <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>,
    ssr: false
  }
);

// Dynamic import for the profile component
const PerfilAsesor = dynamic(
  () => import('./perfilAsesor/page'),
  {
    loading: () => <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>,
    ssr: false
  }
);

export default function Asesor() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('properties');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simple data fetch - using the SAME function as perfilAsesor
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        // Use the SAME function as perfilAsesor - IT WORKS THERE
        const profile = await getAdvisorProfile(user.uid);
        
        if (profile) {
          // Just use the profile data directly - no complicated transformations
          setUserData({
            ...profile,
            uid: user.uid,
            email: user.email
          });
        } else {
          // Fallback if no profile exists
          setUserData({
            uid: user.uid,
            name: user.displayName || "Asesor",
            email: user.email,
            photo: user.photoURL || "/assets/default-avatar.png"
          });
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Debug render
  useEffect(() => {
    console.log("Current userData state:", userData);
    console.log("Loading state:", loading);
  }, [userData, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200">
        <div className="px-6 flex flex-row items-center justify-between">
          {/* Left side with logo and navigation */}
          <div className="flex flex-row gap-5 items-center">
            <div className="cursor-pointer">
              <a href="/">
                <img
                  src="/assets/logos/logoRQ.svg"
                  alt="Rentas Queretaro Logo"
                  className="h-12 w-auto hover:opacity-80"
                />
              </a>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Panel de Asesor</h1>
            </div>
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('properties')}
                className={`${
                  activeTab === 'properties'
                    ? 'border-[#6981d3] text-[#6981d3]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-3 font-medium text-sm cursor-pointer`}
              >
                Mis Propiedades
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`${
                  activeTab === 'create'
                    ? 'border-[#6981d3] text-[#6981d3]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-3 font-medium text-sm cursor-pointer`}
              >
                Crear Propiedad
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-[#6981d3] text-[#6981d3]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-3 font-medium text-sm cursor-pointer`}
              >
                Mi Perfil
              </button>
            </nav>
          </div>

          {/* User profile section with actual advisor data */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{userData?.name}</p>
                  <p className="text-xs text-gray-500">
                    {userData?.verified ? "Asesor verificado" : "Asesor"}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img
                    src={userData?.photo || "/assets/default-avatar.png"}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/assets/default-avatar.png";
                    }}
                  />
                </div>
              </div>
            </button>

            {isDropdownOpen && (
              <div className="border border-gray-200 origin-top-right absolute right-0 mt-3 w-64 rounded-xl shadow-lg py-1 bg-white ">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {userData?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {userData?.email}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsDropdownOpen(false);
                    }}
                    className="cursor-pointer flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Mi Perfil
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="cursro-pointer flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {activeTab === 'properties' && <MisPropiedades />}
        {activeTab === 'create' && <div className="h-full"><CrearPropiedad /></div>}
        {activeTab === 'profile' && <div className="h-full"><PerfilAsesor /></div>}
      </main>
    </div>
  );
}