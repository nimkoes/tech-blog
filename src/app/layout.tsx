import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientLayout from './ClientLayout'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
})

const BASE_PATH = '/tech-blog'
const SITE_URL = process.env.NODE_ENV === 'production'
  ? 'https://nimkoes.github.io'
  : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | Nimkoes Tech Blog',
    default: 'Nimkoes Tech Blog - 개발자의 기술 이야기',
  },
  description: 'I work diligently to become lazy ☕',
  applicationName: 'Nimkoes Tech Blog',
  keywords: [
    'tech-blog',
    'backend',
    'software architect',
    'infrastructure',
    'development'
  ],
  authors: [{ 
    name: 'Nimkoes',
    url: `${SITE_URL}${BASE_PATH}`,
  }],
  creator: 'Nimkoes',
  publisher: 'Nimkoes',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Nimkoes Tech Blog',
    url: `${SITE_URL}${BASE_PATH}`,
    title: 'Nimkoes Tech Blog - 개발자의 기술 이야기',
    description: 'I work diligently to become lazy ☕',
    images: [
      {
        url: `${BASE_PATH}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Nimkoes Tech Blog',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nimkoes Tech Blog',
    description: 'I work diligently to become lazy ☕',
    images: [`${BASE_PATH}/og-image.png`],
    creator: '@nimkoes',
    site: '@nimkoes',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
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
      { url: `${BASE_PATH}/favicon.ico`, sizes: 'any' },
      { url: `${BASE_PATH}/icon.svg`, type: 'image/svg+xml' },
      { url: `${BASE_PATH}/favicon-32x32.png`, sizes: '32x32', type: 'image/png' },
      { url: `${BASE_PATH}/favicon-16x16.png`, sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: `${BASE_PATH}/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: `${BASE_PATH}/safari-pinned-tab.svg`,
        color: '#5bbad5'
      },
    ],
  },
  manifest: `${BASE_PATH}/site.webmanifest`,
  alternates: {
    canonical: `${SITE_URL}${BASE_PATH}`,
    languages: {
      'ko-KR': `${SITE_URL}${BASE_PATH}`,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '',
    other: {
      'naver-site-verification': [process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ?? ''],
      'google-adsense-account': ['ca-pub-6151583773425822'],
    },
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={inter.className}>
    <head>
      <meta 
        name="viewport" 
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
      />
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)"/>
      <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)"/>
      <meta name="naver-site-verification" content="1df124e1d8331da4467178ffddd6188e1d413576"/>
      <meta name="google-adsense-account" content="ca-pub-6151583773425822"/>

      <link rel="dns-prefetch" href="https://fonts.googleapis.com"/>
      <link rel="dns-prefetch" href="https://fonts.gstatic.com"/>
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous"/>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
      
      <script 
        async 
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6151583773425822"
        crossOrigin="anonymous"
      />
    </head>
    <ClientLayout>{children}</ClientLayout>
    </html>
  );
}