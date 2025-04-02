// layout.tsx
import { getZoneByName } from '@/app/shared/firebase';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { zoneid: string }
  children: React.ReactNode
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const zoneName = params.zoneid;
  const zone = await getZoneByName(zoneName);
  
  const zoneDescription = zone?.description || 
                         zone?.shortDescription || 
                         zone?.longDescription || 
                         `Encuentra departamentos y casas en renta en ${zoneName}, Querétaro`;

  return {
    title: zone ? `${zone.name} - Rentas Querétaro` : 'Zona - Rentas Querétaro',
    description: zoneDescription,
    openGraph: {
      title: zone ? `${zone.name} - Rentas Querétaro` : 'Zona - Rentas Querétaro',
      description: zoneDescription,
      type: 'website',
      locale: 'es_MX',
    },
    alternates: {
      canonical: `/qro/${zoneName}`,
    },
  }
}

export default function ZoneLayout({ children }: Props) {
  return children;
}
