import {useState, useEffect} from 'react';
import styles from './NoticePopup.module.scss';

const NOTICE_STORAGE_KEY = 'notice_popup_dismissed';

export default function NoticePopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(NOTICE_STORAGE_KEY);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(NOTICE_STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h2>블로그 개편 안내: 이 개발자의 다양한 경험담은 Tistory 블로그에서 만나보세요</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            ✕
          </button>
        </div>
        <div className={styles.content}>
          <p>안녕하세요.</p>
          <p>블로그 운영 방식을 아래와 같이 조정하게 되었습니다.</p>
          <br/>
          <p><strong>Github 블로그</strong></p>
          <ul>
            <li>기술 개념 정리</li>
            <li>코드 중심의 이론 기반 글</li>
          </ul>
          <br/>
          <p><strong>Tistory 블로그</strong></p>
          <ul>
            <li>장애/오류 대응 사례</li>
            <li>기술서적 독후감</li>
            <li>개발 회고 및 경험 공유</li>
          </ul>
          <br/>
          <p>각 블로그의 성격에 맞게 콘텐츠를 나누어</p>
          <p>더 깊이 있는 내용을 전달드리겠습니다.</p>
          <br/>
          <p>블로그 및 포트폴리오 주소는</p>
          <p>하단 링크를 참고 부탁 드립니다.</p>
          <br/>
          <p>감사합니다.</p>
          <div className={styles.links}>
            <a href="https://nimkoes.github.io/portfolio/" target="_blank" rel="noopener noreferrer">
              포트폴리오
            </a>
            <a href="https://nimkoes.github.io/tech-blog/" target="_blank" rel="noopener noreferrer">
              Github 블로그
            </a>
            <a href="https://xxxelppa.tistory.com/" target="_blank" rel="noopener noreferrer">
              Tistory 블로그
            </a>
          </div>
        </div>
        <div className={styles.footer}>
          <button onClick={handleDismiss} className={styles.dismissButton}>
            다시 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
