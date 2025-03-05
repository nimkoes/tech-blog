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
  description: '프론트엔드, 백엔드 개발과 소프트웨어 아키텍처, 개발 문화에 대한 이야기를 공유합니다.',
  keywords: [
    '개발 블로그',
    '프론트엔드',
    '백엔드',
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    '소프트웨어 아키텍처',
    '개발 문화',
  ],
  authors: [{ name: 'Nimkoes', url: `${SITE_URL}${BASE_PATH}` }],
  creator: 'Nimkoes',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Nimkoes Tech Blog',
    url: `${SITE_URL}${BASE_PATH}`,
    images: [
      {
        url: `${BASE_PATH}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Nimkoes Tech Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nimkoes Tech Blog',
    description: '프론트엔드, 백엔드 개발과 소프트웨어 아키텍처, 개발 문화에 대한 이야기를 공유합니다.',
    images: [`${BASE_PATH}/og-image.png`],
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
      { url: `${BASE_PATH}/favicon.ico`, sizes: 'any' },
      { url: `${BASE_PATH}/icon.svg`, type: 'image/svg+xml' },
      { url: `${BASE_PATH}/favicon-32x32.png`, sizes: '32x32', type: 'image/png' },
      { url: `${BASE_PATH}/favicon-16x16.png`, sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: `${BASE_PATH}/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' },
    ],
  },
  alternates: {
    canonical: `${SITE_URL}${BASE_PATH}`,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={inter.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}