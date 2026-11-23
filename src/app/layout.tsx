import type {Metadata, Viewport} from 'next'
import ClientLayout from './ClientLayout'
import Script from 'next/script'
import { ThemeProvider } from '~/context/ThemeContext';
import { getBasePath, getSiteOrigin } from '~/utils/contentRepository';
import {
  AUTHOR_NAME,
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_TITLE,
  getAuthorUrl,
  getDefaultOpenGraph,
  getHomeUrl,
  serializeJsonLd,
} from '~/utils/seo';

const SITE_ORIGIN = getSiteOrigin();
const BASE_PATH = getBasePath();

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const naverVerification = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION;

const verification: Metadata['verification'] = {
  other: {
    'google-adsense-account': ['ca-pub-6151583773425822'],
  },
};

if (googleVerification) {
  verification.google = googleVerification;
}

if (naverVerification) {
  verification.other = {
    ...verification.other,
    'naver-site-verification': [naverVerification],
  };
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{
    name: AUTHOR_NAME,
    url: getAuthorUrl(),
  }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // 사이트 기본값만 둔다. canonical 과 og:url 은 각 페이지(홈은 page.tsx)가 정한다.
  openGraph: getDefaultOpenGraph(),
  twitter: {
    card: 'summary_large_image',
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
      {url: `${BASE_PATH}/favicon.ico`, sizes: 'any'},
    ],
    apple: [
      {url: `${BASE_PATH}/apple-touch-icon.png`, sizes: '180x180', type: 'image/png'},
    ],
  },
  manifest: `${BASE_PATH}/site.webmanifest`,
  verification,
  category: 'technology',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: getHomeUrl(),
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: getAuthorUrl(),
    },
  };

  return (
    <html lang="ko" data-scroll-behavior="smooth" suppressHydrationWarning>
    <head>
      <script
        // 첫 페인트 전에 저장된 테마를 적용해 다크모드 깜빡임(FOUC)을 방지
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
      />
      {gaId && (
        <>
          {/* Google Analytics */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
    </head>
    <body>
      <ThemeProvider>
        <ClientLayout>{children}</ClientLayout>
      </ThemeProvider>
    </body>
    </html>
  );
}
