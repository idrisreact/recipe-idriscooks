import type { Metadata } from 'next';
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/src/components/react-query-provider/react-query-provider';
import { Toaster } from 'react-hot-toast';
import LogRocket from 'logrocket';
import { Analytics } from '@vercel/analytics/next';

import IntroLoader from '@/src/components/intro-loader';

const dmSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
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
    description: 'Discover a collection of delicious, easy-to-follow recipes from Idris Cooks.',
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
    icon: '/images/idriscooks-logo.png',
    shortcut: '/images/idriscooks-logo.png',
    apple: '/images/idriscooks-logo.png',
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
    <html
      lang="en"
      className={`${dmSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <IntroLoader />
        <ReactQueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1C1A17',
                color: '#F5EFE6',
                border: '1px solid rgba(245, 239, 230, 0.12)',
                borderRadius: '0px',
                fontFamily: 'var(--font-sans), system-ui, sans-serif',
                fontSize: '14px',
                padding: '16px 20px',
              },
              success: {
                iconTheme: {
                  primary: '#C8472D',
                  secondary: '#F5EFE6',
                },
              },
              error: {
                iconTheme: {
                  primary: '#C8472D',
                  secondary: '#F5EFE6',
                },
              },
            }}
          />
          <Analytics />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
