import "~/styles/index.scss";
import styles from "./layout.module.scss";
import Navigation from "~/components/NavigationView/NavigationView";
import CategoryView from "~/components/CategoryView/CategoryView";
import LogView from "~/components/LogView/LogView";

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
    <head>
      <title>Nimkoes Tech Blog</title>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        as="style"
      />
    </head>

    <body className={styles.home}>
    <Navigation/>

    <div className={styles.page}>
      <div className={styles.subPage}>
        <CategoryView/>
        <div className={styles.contentsView}> {children}</div>
      </div>
      <LogView/>
    </div>
    </body>
    </html>
  );
}
