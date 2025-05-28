export const formatPrice = (
  price: number, 
  options: { 
    currencyDisplay?: 'symbol' | 'code', 
    maximumFractionDigits?: number
  } = {}
): string => {
  const { 
    currencyDisplay = 'symbol',
    maximumFractionDigits = 0
  } = options;
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    currencyDisplay,
    maximumFractionDigits,
  }).format(price);
};
