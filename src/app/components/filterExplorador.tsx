'use client';

import { useState, useEffect } from 'react';
import { FaBed, FaBath } from 'react-icons/fa';
import { getZones } from '../shared/firebase';
import type { ZoneData } from '../shared/interfaces';

const FilterExplorador = () => {
  const [transactionType, setTransactionType] = useState<'renta' | 'compra'>('renta');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [isFurnished, setIsFurnished] = useState(false);
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [bathrooms, setBathrooms] = useState<number | null>(null);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');

  useEffect(() => {
    const loadZones = async () => {
      const zonesData = await getZones();
      setZones(zonesData);
    };
    loadZones();
  }, []);

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 shadow-none hover:shadow-md">
      <div className=" px-[5vw] py-2.5">
        <div className="flex justify-between items-center">
          {/* Texto a la izquierda */}
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <span className="font-medium">Filtros</span>
            <div className="h-4 w-px bg-gray-200"></div>
            <span>Encuentra la propiedad perfecta</span>
          </div>

          {/* Filtros a la derecha */}
          <div className="flex items-center gap-6">
            {/* Toggle Renta/Compra */}
            <div className="flex bg-gray-50/80 rounded-xl p-1 shadow-inner">
              {['renta', 'compra'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTransactionType(type as 'renta' | 'compra')}
                  className={`
                    px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${transactionType === type 
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5' 
                      : 'text-gray-500 hover:text-gray-800'}
                  `}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Zona */}
            <div className="relative flex-1 min-w-[200px]">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full appearance-none bg-gray-50/50 border border-gray-200/75 rounded-xl 
                           px-4 py-2.5 text-sm text-gray-600 font-medium
                           focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300
                           transition-all cursor-pointer hover:bg-gray-50"
              >
                <option value="">Todas las zonas</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Precio */}
            <div className="flex items-center gap-2 bg-gray-50/50 rounded-xl px-4 py-2 border border-gray-200/75">
              <input
                type="number"
                placeholder="Min $"
                className="w-24 bg-transparent text-sm text-gray-600 placeholder-gray-400 focus:outline-none"
                value={priceRange[0] || ''}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              />
              <div className="h-4 w-px bg-gray-200"></div>
              <input
                type="number"
                placeholder="Max $"
                className="w-24 bg-transparent text-sm text-gray-600 placeholder-gray-400 focus:outline-none"
                value={priceRange[1] || ''}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              />
            </div>

            {/* Recámaras y Baños */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <FaBed className="text-gray-400" />
                <div className="flex gap-1.5">
                  {[1, 2, '3+'].map((num) => (
                    <button
                      key={num}
                      onClick={() => setBedrooms(num === '3+' ? 3 : Number(num))}
                      className={`
                        w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium
                        transition-all duration-200 
                        ${bedrooms === (num === '3+' ? 3 : Number(num))
                          ? 'bg-gray-900 text-white shadow-lg ring-1 ring-gray-900/5 scale-105'
                          : 'bg-gray-50/50 text-gray-600 hover:bg-gray-100 border border-gray-200/75'}
                      `}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaBath className="text-gray-400" />
                <div className="flex gap-1.5">
                  {[1, '2+'].map((num) => (
                    <button
                      key={num}
                      onClick={() => setBathrooms(num === '2+' ? 2 : Number(num))}
                      className={`
                        w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium
                        transition-all duration-200
                        ${bathrooms === (num === '2+' ? 2 : Number(num))
                          ? 'bg-gray-900 text-white shadow-lg ring-1 ring-gray-900/5 scale-105'
                          : 'bg-gray-50/50 text-gray-600 hover:bg-gray-100 border border-gray-200/75'}
                      `}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Amueblado */}
            {transactionType === 'renta' && (
              <button
                onClick={() => setIsFurnished(!isFurnished)}
                className={`
                  px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isFurnished
                    ? 'bg-gray-900 text-white shadow-lg ring-1 ring-gray-900/5'
                    : 'bg-gray-50/50 text-gray-600 hover:bg-gray-100 border border-gray-200/75'}
                `}
              >
                Amueblado
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterExplorador;
