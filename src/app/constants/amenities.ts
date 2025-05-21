export const condoAmenities = [
    { id: 'pool', label: 'Alberca', icon: '🏊‍♂️', description: 'Área de alberca', priority: 1 },
    { id: 'gym', label: 'Gimnasio', icon: '💪', description: 'Gimnasio equipado', priority: 2 },
    { id: 'security', label: 'Vigilancia', icon: '👮', description: 'Seguridad independiente', priority: 3 },
    { id: 'eventRoom', label: 'Salón de eventos', icon: '🎉', description: 'Salón de usos múltiples', priority: 4 },
    { id: 'grill', label: 'Área de asadores', icon: '🔥', description: 'Asadores y zona de parrilla', priority: 5 },
    { id: 'playground', label: 'Parque infantil', icon: '🎡', description: 'Área de juegos para niños', priority: 6 },
    { id: 'greenAreas', label: 'Areas verdes', icon: '🌳', description: 'Áreas comunes para disfrutar', priority: 7 },
    { id: 'general', label: 'General', icon: '🏠', description: 'Área general', priority: 8 },
    { id: 'padelCourt', label: 'Cancha de padel', icon: '🎾', description: 'Cancha de padel para residentes', priority: 9 },
    { id: 'basketballCourt', label: 'Cancha de basket', icon: '🏀', description: 'Cancha de baloncesto', priority: 10 },
    { id: 'businessCenter', label: 'Business Center', icon: '💼', description: 'Centro de negocios', priority: 11 },
    { id: 'playRoom', label: 'Ludoteca', icon: '🏓', description: 'Salón con juegos', priority: 12 },
    { id: 'sauna', label: 'Sauna', icon: '♨️', description: 'Sauna o vapor', priority: 13 },
    { id: 'firePit', label: 'Fogatero', icon: '🔥', description: 'Área de fogatero para reuniones', priority: 14 },
    { id: 'yogaArea', label: 'Zona de yoga', icon: '🧘', description: 'Área dedicada para yoga y meditación', priority: 15 },
    { id: 'wineCellar', label: 'Cavas', icon: '🍷', description: 'Cavas para almacenamiento de vinos', priority: 16 }
]

// Helper function to sort amenities by priority
export const sortAmenitiesByPriority = (amenities: string[]) => {
    return [...amenities].sort((a, b) => {
        const amenityA = condoAmenities.find(amenity => amenity.id === a);
        const amenityB = condoAmenities.find(amenity => amenity.id === b);
        return (amenityA?.priority || 999) - (amenityB?.priority || 999);
    });
};

// Helper function to get ordered amenities by IDs
export const getOrderedAmenities = (amenityIds: string[]) => {
    return sortAmenitiesByPriority(amenityIds)
        .map(id => condoAmenities.find(amenity => amenity.id === id))
        .filter(Boolean);
};
