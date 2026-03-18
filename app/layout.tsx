import { ClientProviders } from '../src/components/ClientProviders';
import { Layout } from '../src/components/layout/Layout';
import { TabNavigationClient } from '../src/components/navigation/TabNavigationClient';
import { JsonLd } from '../src/components/seo/JsonLd';
import { getCategories } from '../src/lib/data';
import '../src/index.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'PixelPerfect - Portfolio Management',
    template: '%s | PixelPerfect',
  },
  description: 'Manage your investment portfolio with detailed asset tracking and analytics',
  keywords: ['portfolio management', 'investment tracking', 'asset allocation', 'financial analytics'],
  authors: [{ name: 'PixelPerfect' }],
  creator: 'PixelPerfect',
  publisher: 'PixelPerfect',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'PixelPerfect',
    title: 'PixelPerfect - Portfolio Management',
    description: 'Manage your investment portfolio with detailed asset tracking and analytics',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PixelPerfect Portfolio Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PixelPerfect - Portfolio Management',
    description: 'Manage your investment portfolio with detailed asset tracking and analytics',
    images: ['/og-image.png'],
    creator: '@pixelperfect',
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
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = getCategories();

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PixelPerfect',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    description: 'Manage your investment portfolio with detailed asset tracking and analytics',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PixelPerfect',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/og-image.png`,
    description: 'Portfolio management platform for detailed asset tracking and analytics',
  };

  return (
    <html lang="en">
      <head>
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={organizationJsonLd} />
      </head>
      <body>
        <ClientProviders>
          <Layout>
            <TabNavigationClient categories={categories} />
            {children}
          </Layout>
        </ClientProviders>
      </body>
    </html>
  );
}
