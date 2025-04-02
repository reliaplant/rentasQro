import { getZoneByName, getCondosByZone } from '@/app/shared/firebase';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { zoneid: string; condoid: string }
  children: React.ReactNode
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { zoneid, condoid } = params;
  
  try {
    const zone = await getZoneByName(zoneid);
    if (!zone) return defaultMetadata(zoneid, condoid);

    const condos = await getCondosByZone(zone.id || '');
    const condo = condos.find(c => 
      c.name.toLowerCase().replace(/\s+/g, '-') === condoid.toLowerCase()
    );

    if (!condo) return defaultMetadata(zoneid, condoid);

    const title = `${condo.name} en ${zone.name} - Rentas Querétaro`;
    const description = condo.description || 
      `Encuentra propiedades en ${condo.name}, ubicado en ${zone.name}, Querétaro. ${condo.shortDescription || ''}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'es_MX',
        images: condo.portada ? [{ url: condo.portada }] : undefined,
      },
      alternates: {
        canonical: `/qro/${zoneid}/${condoid}`,
      },
      keywords: [
        condo.name,
        zone.name,
        'Querétaro',
        'departamentos',
        'casas',
        'renta',
        'venta',
        'bienes raíces'
      ].join(', '),
    }
  } catch (error) {
    return defaultMetadata(zoneid, condoid);
  }
}

function defaultMetadata(zoneid: string, condoid: string): Metadata {
  return {
    title: 'Condominio - Rentas Querétaro',
    description: 'Encuentra las mejores opciones de vivienda en Querétaro',
    alternates: {
      canonical: `/qro/${zoneid}/${condoid}`,
    }
  }
}

export default function CondoLayout({ children }: Props) {
  return children;
}
