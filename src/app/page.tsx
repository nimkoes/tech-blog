"use client";

import styles from "./page.module.scss";

const HomePage = () => {

  return (
    <main className={styles.home}>

      <aside className={styles.navigationView}>내비</aside>
      <div className={styles.page}>
        <div className={styles.subPage}>
          <div className={styles.categoryView}>카테고리</div>
          <div className={styles.contentsView}>콘텐츠</div>
        </div>
        <div className={styles.logView}>로그</div>
      </div>


      {/*
       📌 네비게이션 패널 (항상 표시)
      <div className={styles.navigation}>
         📂 카테고리 토글 버튼
        <button className={styles.navButton} onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
          📂
        </button>
         🖥 로그 패널 토글 버튼
        <button className={styles.navButton} onClick={() => setIsLogOpen(!isLogOpen)}>
          🖥
        </button>
      </div>

      <div className={styles.mainContainer}>
         📂 카테고리 (파일 탐색기)
        <div className={`
          ${styles.categoryContainer}
          ${isCategoryOpen ? styles.show : styles.hide}
          ${isMobile ? styles.overlay : ""}
          ${isTablet ? styles.tablet : ""}
        `}>
          <Category onSelect={handleSelect}/>
        </div>

         📝 컨텐츠 영역 (에디터)
        <div className={styles.contentContainer}>
          <Contents mdPath={selectedMd}/>
        </div>
      </div>

       🖥 로그 영역 (터미널)
      <div className={`
        ${styles.logContainer}
        ${isLogOpen ? styles.show : styles.hide}
        ${isTablet ? styles.tablet : ""}
      `}>
        <LogTerminal logs={logs}/>
      </div>
      */}

    </main>
  );
};

export default HomePage;