import { Metadata } from 'next';
import { Viewport } from 'next';
import { Poppins } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import Menu from "@/app/components/menu";
import Footer from "@/app/components/footer";
import "./globals.css";
import { FilterProvider } from './context/FilterContext';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Añade aquí otras configuraciones de viewport necesarias
};

export const metadata: Metadata = {
  metadataBase: new URL('https://rentasqro.com'),
  title: {
    default: "RentasQro - Propiedades en Querétaro",
    template: "%s | RentasQro"
  },
  description: "Encuentra casas y departamentos en renta y venta en los mejores condominios de Querétaro como Zibatá, Juriquilla y más",
  keywords: [
    "rentas querétaro",
    "departamentos querétaro",
    "casas querétaro",
    "zibatá",
    "juriquilla",
    "el refugio",
    "condominios querétaro"
  ],
  authors: [{ name: 'RentasQro' }],
  creator: 'RentasQro',
  publisher: 'RentasQro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "RentasQro - Propiedades en Querétaro",
    description: "Encuentra casas y departamentos en renta y venta en los mejores condominios de Querétaro",
    url: 'https://rentasqro.com',
    siteName: 'RentasQro',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RentasQro - Propiedades en Querétaro'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RentasQro - Propiedades en Querétaro',
    description: 'Encuentra casas y departamentos en renta y venta en los mejores condominios de Querétaro',
    images: ['/twitter-image.jpg'],
    creator: '@rentasqro'
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png' }
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: '/',
    languages: {
      'es-MX': '/',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* ...existing meta tags... */}
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${poppins.className} ${geistMono.variable} min-h-screen flex flex-col antialiased`}>
        <FilterProvider>
          <Menu />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </FilterProvider>
      </body>
    </html>
  );
}