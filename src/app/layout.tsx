import "~/styles/index.scss";
import styles from "./layout.module.scss";

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

    <aside className={styles.navigationView}>
      <div className={styles.navigation}>
        <button className={styles.navButton}>📂</button>
        <button className={styles.navButton}>🖥</button>
      </div>
    </aside>

    <div className={styles.page}>
      <div className={styles.subPage}>
        <div className={`${styles.categoryView}`}></div>
        <div className={styles.contentsView}> {children}</div>
      </div>
      <div className={`${styles.logView}`}></div>
    </div>
    </body>
    </html>
  );
}
