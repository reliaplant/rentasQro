'use client';

import { useMemo } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

interface PriceBarProps {
    minPrice?: number;
    avgPrice?: number;
    maxPrice?: number;
    type: 'rent' | 'sale';
}

export default function PriceBar({ minPrice, avgPrice, maxPrice, type }: PriceBarProps) {
    const RANGES = {
        rent: { min: 12000, max: 38000 },
        sale: { min: 2100000, max: 6000000 }
    };

    const formatPrice = (price: number) => {
        if (type === 'sale') {
            return `${(price / 1000000).toFixed(1)} MDP`;
        }
        return `$${(price / 1000).toFixed(1)}k`;
    };

    return (
        <div className="border border-gray-100 p-4 md:p-8 bg-gray-50">
            {/* Header */}
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${type === 'rent' ? 'bg-indigo-50' : 'bg-orange-50'
                    }`}>
                    <DollarSign className={`w-4 h-4 md:w-6 md:h-6 ${type === 'rent' ? 'text-indigo-500' : 'text-orange-500'
                        }`} />
                </div>
                <div>
                    <h3 className="font-medium text-gray-900 text-sm md:text-base">
                        Precios {type === 'rent' ? 'de renta' : 'de venta'}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500">
                        {type === 'rent' ? 'Mensualidad promedio' : 'Precio promedio de venta'}
                    </p>
                </div>
            </div>

            {/* Price Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
                <div className="text-center">
                    <div className="text-xs md:text-sm font-medium text-gray-500 mb-1">Desde</div>
                    <div className="text-base md:text-xl font-bold">{formatPrice(minPrice || RANGES[type].min)}</div>
                </div>
                <div className={`text-center px-2 py-1 md:px-4 md:py-2 rounded-lg ${type === 'rent' ? 'bg-indigo-50' : 'bg-orange-50'
                    }`}>
                    <div className={`text-xs md:text-sm font-medium mb-1 ${type === 'rent' ? 'text-indigo-600' : 'text-orange-600'
                        }`}>Promedio</div>
                    <div className={`text-lg md:text-2xl font-bold ${type === 'rent' ? 'text-indigo-700' : 'text-orange-700'
                        }`}>{formatPrice(avgPrice || (RANGES[type].min + RANGES[type].max) / 2)}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs md:text-sm font-medium text-gray-500 mb-1">Hasta</div>
                    <div className="text-base md:text-xl font-bold">{formatPrice(maxPrice || RANGES[type].max)}</div>
                </div>
            </div>

            {/* Price Range Visualization */}
            <div className="relative h-1.5 md:h-2 rounded-full overflow-hidden bg-gray-100">
                <div
                    className={`absolute h-full transition-all duration-500 ${type === 'rent' ? 'bg-indigo-500' : 'bg-orange-500'
                        }`}
                    style={{
                        left: '0%',
                        width: '100%',
                        opacity: '0.2'
                    }}
                />
                <div
                    className={`absolute h-full transition-all duration-500 ${type === 'rent' ? 'bg-indigo-500' : 'bg-orange-500'
                        }`}
                    style={{
                        left: `${((minPrice || RANGES[type].min) - RANGES[type].min) / (RANGES[type].max - RANGES[type].min) * 100}%`,
                        width: `${((maxPrice || RANGES[type].max) - (minPrice || RANGES[type].min)) / (RANGES[type].max - RANGES[type].min) * 100}%`
                    }}
                />
            </div>

            {/* Range Labels */}
            <div className="flex justify-between mt-1 md:mt-2 text-2xs md:text-xs text-gray-400">
                <span>{formatPrice(RANGES[type].min)}</span>
                <span>{formatPrice(RANGES[type].max)}</span>
            </div>
        </div>
    );
}
