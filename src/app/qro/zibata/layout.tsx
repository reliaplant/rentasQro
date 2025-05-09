import { Metadata } from 'next';

// SEO Optimizada
export const metadata: Metadata = {
  title: 'Zibatá - Vivir en Zibatá Querétaro | Rentas Querétaro',
  description: 'Descubre la vida en Zibatá, un exclusivo desarrollo en Querétaro con campo de golf, áreas verdes, universidades y más. Conoce sus condominios y propiedades.',
  keywords: ['Zibatá', 'condominios Zibatá', 'vivir en Zibatá', 'propiedades Zibatá', 'Querétaro', 'residencial'],
  openGraph: {
    title: 'Vivir en Zibatá Querétaro',
    description: 'Descubre todo sobre Zibatá, uno de los desarrollos residenciales más completos de Querétaro',
    images: [{ url: '/assets/zibata/zibata.jpg' }],
    type: 'website',
  },
}

export default function ZibataLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>{children}</>
  )
}