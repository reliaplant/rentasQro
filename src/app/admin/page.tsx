"use client";

import { useState } from 'react';
import AllProperties from './components/allProperties';
import Zones from './zones/zones';
import ListaAdmins from './admins/listaAdmins';
import ListaAdvisors from './advisors/listaAdvisors';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'properties' | 'zones' | 'admins' | 'advisors'>('properties');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className='flex flex-row gap-5 items-center border-b border-gray-200'>
        <div className='cursor-pointer'>
          <a href="/">
            <img
              src="/assets/logos/logoRQ.svg"
              alt="Rentas Queretaro Logo"
              className="h-12 w-auto hover:opacity-80"
            />
          </a>
        </div>
        <div className="">
          <h1 className="text-lg font-semibold text-gray-900">Panel de Administración</h1>
        </div>
         {/* Tabs */}
         <div className="ml-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('properties')}
              className={`${activeTab === 'properties'
                ? 'border-[#6981d3] text-[#6981d3]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Propiedades
            </button>
            <button
              onClick={() => setActiveTab('zones')}
              className={`${activeTab === 'zones'
                ? 'border-[#6981d3] text-[#6981d3]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Zonas y Condominios
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`${activeTab === 'admins'
                ? 'border-[#6981d3] text-[#6981d3]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Administradores
            </button>
            <button
              onClick={() => setActiveTab('advisors')}
              className={`${activeTab === 'advisors'
                ? 'border-[#6981d3] text-[#6981d3]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-3 font-medium text-sm cursor-pointer`}
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
        </div>
      </div>
    </div>
  );
}