"use client";

import { useState, useEffect } from 'react';
import AllProperties from './components/allProperties';
import Zones from './zones/zones';
import ListaAdmins from './admins/listaAdmins';
import ListaAdvisors from './advisors/listaAdvisors';
import DesarrolladorasPage from './desarrolladoras/page';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'properties' | 'zones' | 'admins' | 'advisors' | 'desarrolladoras'>('properties');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Simple check for admin status
  useEffect(() => {
    const checkIfAdmin = async () => {
      try {
        // Check if user role is 'admin' in localStorage
        const userIsAdmin = localStorage.getItem('userRole') === 'admin';
        setIsAdmin(userIsAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkIfAdmin();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  // FIX: Show access denied when NOT admin (notice the ! operator)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">Debes ser administrador para acceder a esta página.</p>
          <a href="/" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Volver al Inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className='flex flex-row gap-5 items-center border-b border-gray-200 h-16'>
        <div className='ml-[4vw] cursor-pointer'>
          <a href="/">
            <img
              src="/assets/logos/logoPizo.svg"
              alt="Rentas Queretaro Logo"
              className="h-16 w-auto hover:opacity-80 p-4 bg-indigo-50"
            />
          </a>
        </div>
        <div className="">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-600">Rol: {localStorage.getItem('userRole') || 'No definido'}</p>
            </div>
        </div>
         {/* Tabs */}
         <div className="ml-4">
          <nav className="-mb-px flex space-x-8 h-16">
            <button
              onClick={() => setActiveTab('properties')}
              className={`${activeTab === 'properties'
                ? 'border-[#6981d3] text-[#6981d3]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 pt-4 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Propiedades
            </button>
            <button
              onClick={() => setActiveTab('zones')}
              className={`${activeTab === 'zones'
                ? 'border-[#6981d3] text-[#6981d3]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 pt-4 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Zonas y Condominios
            </button>
            <button
              onClick={() => setActiveTab('desarrolladoras')}
              className={`${activeTab === 'desarrolladoras'
                ? 'border-[#6981d3] text-[#6981d3]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 pt-4 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Desarrolladoras
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`${activeTab === 'admins'
                ? 'border-[#6981d3] text-[#6981d3]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 pt-4 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Administradores
            </button>
            <button
              onClick={() => setActiveTab('advisors')}
              className={`${activeTab === 'advisors'
                ? 'border-[#6981d3] text-[#6981d3]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 pt-4 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Asesores
            </button>
          </nav>
        </div>
      </div>
      <div className="">
        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'properties' && <AllProperties />}
          {activeTab === 'zones' && <Zones />}
          {activeTab === 'admins' && <ListaAdmins />}
          {activeTab === 'advisors' && <ListaAdvisors />}
          {activeTab === 'desarrolladoras' && <DesarrolladorasPage />}
        </div>
      </div>
    </div>
  );
}