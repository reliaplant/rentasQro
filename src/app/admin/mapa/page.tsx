'use client';

import { useState, useEffect } from 'react';
import { MapEditor } from './MapEditor';

export default function AdminMapPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">Administración del Mapa</h1>
      </header>
      
      <main className="flex-1 p-4">
        <MapEditor />
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p className="text-sm">Panel de administración de RentasQro</p>
      </footer>
    </div>
  );
}
