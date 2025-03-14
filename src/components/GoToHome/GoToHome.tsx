"use client";

import { useRouter } from "next/navigation";
import styles from "./GoToHome.module.scss";
import useNavigationStore from "../../store/navigationStore";

export default function GoToHome() {
  const router = useRouter();
  const { hideAll } = useNavigationStore();

  const handleClick = () => {
    hideAll();  // 카테고리와 로그 영역 숨김
    router.push("/");  // 홈으로 이동
  };

  return (
    <button className={styles.goToHome} onClick={handleClick}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 2L2 7V14H6V9H10V14H14V7L8 2Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}