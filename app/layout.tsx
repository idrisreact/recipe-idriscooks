import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/src/components/react-query-provider/react-query-provider';
import { Toaster } from 'react-hot-toast';
import LogRocket from 'logrocket';
import { Analytics } from '@vercel/analytics/next';

import IntroLoader from '@/src/components/intro-loader';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://idriscooks.vercel.app'),
  title: {
    default: 'Idris Cooks - Delicious Recipes & Cooking Guides',
    template: '%s | Idris Cooks',
  },
  description:
    'Discover a collection of delicious, easy-to-follow recipes from Idris Cooks. From quick weeknight dinners to impressive dishes, find your next culinary adventure.',
  keywords: [
    'recipes',
    'cooking',
    'food',
    'dinner ideas',
    'meal prep',
    'easy recipes',
    'cooking guides',
    'idris cooks',
  ],
  authors: [{ name: 'Idris Cooks' }],
  creator: 'Idris Cooks',
  publisher: 'Idris Cooks',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: '/',
    title: 'Idris Cooks - Delicious Recipes & Cooking Guides',
    description:
      'Discover a collection of delicious, easy-to-follow recipes from Idris Cooks. From quick weeknight dinners to impressive dishes, find your next culinary adventure.',
    siteName: 'Idris Cooks',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Idris Cooks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Idris Cooks - Delicious Recipes & Cooking Guides',
    description:
      'Discover a collection of delicious, easy-to-follow recipes from Idris Cooks.',
    creator: '@idriscooks',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  LogRocket.init('mml61w/idriscooks');
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${montserrat.variable} font-montserrat antialiased`}>
        <IntroLoader />
        <ReactQueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#171717',
                color: '#ffffff',
                border: '1px solid #2a2a2a',
                borderRadius: '4px',
                fontFamily: 'Montserrat, sans-serif',
              },
            }}
          />
          <Analytics />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
