import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/src/components/react-query-provider/react-query-provider';
import { Toaster } from 'react-hot-toast';
import LogRocket from 'logrocket';
import { Analytics } from '@vercel/analytics/next';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Idris Cooks',
  description: 'recipes for you',
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
