import React, { useEffect, useRef, useState } from 'react';
import FilterExplorador from '../components/filterExplorador';
import { FilterProvider } from '../context/FilterContext';
import ListaExplorador from './components/ListaExplorador';
import MapaZibata2 from '../mapaZibata2/components/mapaZibata2';
import { Metadata } from 'next';
import ExplorarClient from './components/ExplorarClient';

export const metadata: Metadata = {
  title: 'Explorar propiedades en Querétaro - Pizo',
  description: 'Explora nuestro catálogo de propiedades en Querétaro. Casas, departamentos, terrenos y más disponibles para renta o venta.',
};

export default function ExplorarPage() {
  return <ExplorarClient />;
}
