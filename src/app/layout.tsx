import type {Metadata, Viewport} from 'next'
import ClientLayout from './ClientLayout'
import Script from 'next/script'
import { ThemeProvider } from '~/context/ThemeContext';
import { getBasePath, getSiteOrigin } from '~/utils/contentRepository';
import {
  AUTHOR_NAME,
  DEFAULT_KEYWORDS,
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
  getDefaultOgImageUrl,
  getSiteUrl,
  serializeJsonLd,
} from '~/utils/seo';

const SITE_ORIGIN = getSiteOrigin();
const BASE_PATH = getBasePath();
const SITE_URL = getSiteUrl();
const OG_IMAGE_URL = getDefaultOgImageUrl();

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
  keywords: DEFAULT_KEYWORDS,
  authors: [{
    name: AUTHOR_NAME,
    url: SITE_URL,
  }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_URL],
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
  alternates: {
    canonical: SITE_URL,
    languages: {
      [SITE_LANGUAGE]: SITE_URL,
    },
  },
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
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
  };

  return (
    <html lang="ko" suppressHydrationWarning>
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
