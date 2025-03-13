import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <div className={styles.home}>
      {/* 블로그 소개 영역 */}
      <div className={styles.intro}>
        <h1>Nimkoes Tech Blog</h1>
        <p>기술과 관련된 다양한 것들을 기록으로 남기는 블로그입니다.</p>
      </div>

      {/* 주요 기능 소개 */}
      <div className={styles.section}>
        <h2>🚀 주요 기능</h2>
        <ul>
          <li>
            <span className={styles.icon}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#AEB2B8"
                      d="M2 4c0-1.1.9-2 2-2h5l2 2h9c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z"/>
                <path fill="#7D848D" d="M2 8h20v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V8z"/>
              </svg>
            </span>
            등록 된 문서를 보여줍니다.
          </li>

          <li>
            <span className={styles.icon}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="14" x="2" y="5" rx="2" ry="2" fill="#AEB2B8"/>
            <path fill="black" d="M5 9l5 3-5 3V9zM12 15h6v-2h-6v2z"/>
          </svg>
            </span>
            문서 열람 기록을 보여줍니다.
          </li>

          <li>
            <span className={styles.icon}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="17" y1="17" x2="22" y2="22"/>
              </svg>
            </span>
            등록된 문서를 검색할 수 있습니다.
          </li>

          <li>
            <span className={styles.icon}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
            <rect x="2" y="4" width="20" height="16" rx="3" stroke="#CCCCCC" strokeWidth="1.5"/>
            <circle cx="6" cy="8" r="1.5" fill="#CCCCCC"/>
            <circle cx="6" cy="12" r="1.5" fill="#CCCCCC"/>
            <circle cx="6" cy="16" r="1.5" fill="#CCCCCC"/>
            <line x1="9" y1="8" x2="18" y2="8" stroke="#CCCCCC" strokeWidth="1.5"/>
            <line x1="9" y1="12" x2="18" y2="12" stroke="#CCCCCC" strokeWidth="1.5"/>
            <line x1="9" y1="16" x2="18" y2="16" stroke="#CCCCCC" strokeWidth="1.5"/>
          </svg>
            </span>
            문서의 목차를 보여줍니다.
          </li>

          <li>
            <span className={styles.icon}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6-6 6 6"/>
                <path d="M6 15l6 6 6-6"/>
              </svg>
            </span>
            /
            <span className={styles.icon}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 21l6-6 6 6"/>
                <path d="M6 3l6 6 6-6"/>
              </svg>
            </span>
            등록된 문서를 펼쳐 보거나 접을 수 있습니다.
          </li>

          <li>
            <span className={styles.icon}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
              </svg>
            </span>
            영역을 숨겨서 문서를 넓게 볼 수 있습니다.
          </li>
        </ul>
      </div>

      {/* TODO LIST */}
      <div className={styles.section}>
        <h2>🛠 TODO TASK</h2>
        <ul>
          <li>seo 최적화</li>
          <li>tag 활용하기</li>
          <li>local storage 활용?</li>
          <li>릴리즈 노트?</li>
        </ul>
      </div>
    </div>
  );
}