import { Metadata } from 'next';
import { Viewport } from 'next';
import { Poppins } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import Menu from "@/app/components/menu";
import Footer from "@/app/components/footer";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import "./globals.css";
import { FilterProvider } from './context/FilterContext';
import { UTMParamsProvider } from './providers/UTMParamsProvider';
import Script from 'next/script';
import { Suspense } from 'react';

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
  metadataBase: new URL('https://pizo.mx'),
  title: {
    default: "Encuentra tu piso - Propiedades en Querétaro",
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
    title: "Encuentra tu piso - Propiedades en Querétaro",
    description: "Encuentra casas y departamentos en renta y venta en los mejores condominios de Querétaro",
    url: 'https://pizo.mx', // Actualizar para que coincida con metadataBase
    siteName: 'RentasQro',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Encuentra tu piso - Propiedades en Querétaro'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Encuentra tu piso - Propiedades en Querétaro',
    description: 'Encuentra casas y departamentos en renta y venta en los mejores condominios de Querétaro',
    images: ['/twitter-image.jpg'],
    creator: '@rentasqro'
  },
  icons: {
    icon: [
      { url: '/assets/logos/logoPizo.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/assets/logos/logoPizo.svg', type: 'image/svg+xml' }
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
        {/* Google tag (gtag.js)
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-8CENRP7LCJ" />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8CENRP7LCJ');
          `
        }} />
        <link rel="manifest" href="/site.webmanifest" /> */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id=GTM-MXT26WNQ'+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-MXT26WNQ');
  `}
        </Script>

      </head>
      <Suspense>
      <body className={`${poppins.className} ${geistMono.variable} min-h-screen flex flex-col antialiased`}>
        {/* Google Analytics */}
        {/* <GoogleAnalytics /> */}

          <Suspense>
            <Menu />
          </Suspense>
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
      </body>
      </Suspense>

    </html>);
}