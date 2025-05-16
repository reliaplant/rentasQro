import { negocio } from '@/app/shared/interfaces';

interface KPIsProps {
  negocios: negocio[];
}

export default function KPIs({ negocios }: KPIsProps) {
  // Calculate total value of all negocios
  const totalValue = negocios.reduce((sum, neg) => sum + (neg.price || 0), 0);
  
  // Calculate active vs dormant
  const activeLead = negocios.filter(neg => !neg.dormido).length;
  const dormantLead = negocios.filter(neg => neg.dormido).length;
  
  // Count by transaction type
  const countRenta = negocios.filter(neg => neg.transactionType === 'renta').length;
  const countVenta = negocios.filter(neg => neg.transactionType === 'venta').length;
  const countVentaRenta = negocios.filter(neg => neg.transactionType === 'ventaRenta').length;
  
  // Count by status
  const statusCounts = negocios.reduce((acc, neg) => {
    acc[neg.estatus] = (acc[neg.estatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate potential commission
  const potentialCommission = negocios.reduce((sum, neg) => {
    if (neg.estatus !== 'cancelada') {
      // Calculate the commission - if porcentajePizo exists, use that for Pizo's portion
      const commissionRate = (neg.comision || 0) / 100;
      const pizoPercent = (neg.porcentajePizo || 50) / 100; // default to 50% if not specified
      return sum + (neg.price * commissionRate * pizoPercent);
    }
    return sum;
  }, 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Métricas</h2>
      
      {/* Total Leads KPI */}
      <div className="bg-indigo-50 rounded-lg p-4">
        <span className="text-indigo-600 text-sm font-medium">Total de Leads</span>
        <div className="text-2xl font-bold text-indigo-800">{negocios.length}</div>
        <div className="text-xs text-indigo-700 mt-1">
          <span>Activos: {activeLead}</span> | <span>Dormidos: {dormantLead}</span>
        </div>
      </div>
      
      {/* Transaction Type KPI */}
      <div className="bg-blue-50 rounded-lg p-4">
        <span className="text-blue-600 text-sm font-medium">Transacciones</span>
        <div className="grid grid-cols-3 gap-2 mt-2 text-center">
          <div className="bg-white rounded shadow-sm p-2">
            <div className="text-lg font-bold text-blue-800">{countRenta}</div>
            <div className="text-xs text-blue-600">Renta</div>
          </div>
          <div className="bg-white rounded shadow-sm p-2">
            <div className="text-lg font-bold text-blue-800">{countVenta}</div>
            <div className="text-xs text-blue-600">Venta</div>
          </div>
          <div className="bg-white rounded shadow-sm p-2">
            <div className="text-lg font-bold text-blue-800">{countVentaRenta}</div>
            <div className="text-xs text-blue-600">Ambos</div>
          </div>
        </div>
      </div>
      
      {/* Value KPI */}
      <div className="bg-green-50 rounded-lg p-4">
        <span className="text-green-600 text-sm font-medium">Valor Total</span>
        <div className="text-2xl font-bold text-green-800">{formatCurrency(totalValue)}</div>
        <span className="text-xs text-green-700 mt-1">
          Comisión potencial: {formatCurrency(potentialCommission)}
        </span>
      </div>
      
      {/* Status Distribution KPI */}
      <div className="bg-purple-50 rounded-lg p-4">
        <span className="text-purple-600 text-sm font-medium">Distribución</span>
        <div className="flex flex-col mt-2 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-1"></span>
              <span>Propuesta</span>
            </span>
            <span>{statusCounts['propuesta'] || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-1"></span>
              <span>Evaluación</span>
            </span>
            <span>{statusCounts['evaluación'] || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-indigo-400 mr-1"></span>
              <span>Comercial</span>
            </span>
            <span>{statusCounts['comercialización'] || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-1"></span>
              <span>Congelada</span>
            </span>
            <span>{statusCounts['congeladora'] || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-1"></span>
              <span>Cerrada</span>
            </span>
            <span>{statusCounts['cerrada'] || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-red-400 mr-1"></span>
              <span>Cancelada</span>
            </span>
            <span>{statusCounts['cancelada'] || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
