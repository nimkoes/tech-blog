import type {Metadata} from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Nimkoes Tech Blog',
    default: 'Nimkoes Tech Blog - 개발자의 기술 블로그',
  },
  description: '개발과 소프트웨어 아키텍처, 개발 문화에 대한 이야기를 공유합니다.',
  keywords: [
    '개발 블로그',
    '백엔드',
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    '소프트웨어 아키텍처',
    '개발 문화',
  ],
  authors: [{name: 'Nimkoes'}],
  creator: 'Nimkoes',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Nimkoes Tech Blog',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nimkoes Tech Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nimkoes Tech Blog',
    description: '개발과 소프트웨어 아키텍처, 개발 문화에 대한 이야기를 공유합니다.',
    images: ['/og-image.png'],
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
      {url: '/favicon.ico', sizes: 'any'},
      // { url: '/icon.svg', type: 'image/svg+xml' },
      // { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      // { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      {url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png'},
    ],
  },
} 