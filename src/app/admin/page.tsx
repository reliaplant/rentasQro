"use client";

import { useState } from 'react';
import AllProperties from './components/allProperties';
import Zones from './components/zones';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'properties' | 'zones'>('properties');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Panel de Administración</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('properties')}
              className={`${
                activeTab === 'properties'
                  ? 'border-[#D2B48C] text-[#D2B48C]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Propiedades
            </button>
            <button
              onClick={() => setActiveTab('zones')}
              className={`${
                activeTab === 'zones'
                  ? 'border-[#D2B48C] text-[#D2B48C]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Zonas y Condominios
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'properties' && <AllProperties />}
          {activeTab === 'zones' && <Zones />}
        </div>
      </div>
    </div>
  );
}