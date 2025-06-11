import type {Metadata} from 'next'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import ClientLayout from './ClientLayout'

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
      {url: `${BASE_PATH}/favicon.ico`, sizes: 'any'},
    ],
    apple: [
      {url: `${BASE_PATH}/apple-touch-icon.png`, sizes: '180x180', type: 'image/png'},
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
    <html lang="ko">
    <body>
    <ClientLayout>{children}</ClientLayout>
    </body>
    </html>
  );
}