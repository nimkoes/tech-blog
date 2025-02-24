import type { Metadata } from "next";
import "~/styles/index.scss";

export const metadata: Metadata = {
  title: "About nimkoes",
  description: "github pages for nimkoes",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <meta name="google-site-verification" content="qjAYKAWDvi1a8R2WjIvp8VV8QmEiYymdpjXx5nBcyak" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css" rel="stylesheet" type="text/css" />

        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          as="style"
        />
      </head>

      <body>{children}</body>
    </html>
  );
}
