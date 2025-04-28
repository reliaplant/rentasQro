import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Ziqua Land Art | Exclusivo desarrollo en Zibatá',
  description: 'Descubre Ziqua Land Art, un concepto único que integra arte, naturaleza y arquitectura en un desarrollo exclusivo en Zibatá, Querétaro.',
  keywords: 'Ziqua, Land Art, Zibatá, terrenos, lotes, desarrollo residencial, arte, naturaleza, Querétaro',
  openGraph: {
    title: 'Ziqua Land Art | Exclusivo desarrollo en Zibatá',
    description: 'Un concepto único que integra arte, naturaleza y arquitectura',
    images: [{ url: '/assets/zibata/ziqua-header.jpg' }],
    type: 'website',
  },
}

export default function ZiquaLayout({ children }: { children: ReactNode }) {
  return children;
}
