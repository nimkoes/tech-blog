"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import styles from "./NavigationView.module.scss";
import Button from "../common/Button/Button";
import FolderIcon from "../common/icons/FolderIcon";
import LogIcon from "../common/icons/LogIcon";
import TagIcon from "../common/icons/TagIcon";
import HomeIcon from "../common/icons/HomeIcon";
import useNavigationStore from "../../store/navigationStore";
import { useRouter } from "next/navigation";

const NavigationView = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [iconSize, setIconSize] = useState<number | null>(null); // 초기 값 null 설정
  const router = useRouter();

  useEffect(() => {
    setIconSize(isMobile ? 18 : 30); // 클라이언트에서만 크기 변경
  }, [isMobile]);

  const { isCategoryOpen, isLogOpen, isTagModalOpen, toggleCategory, toggleLog, toggleTagModal, hideAll } = useNavigationStore();

  const handleHomeClick = () => {
    hideAll();
    router.push("/");
  };

  return (
    <aside className={styles.navigationView}>
      <div className={styles.navigation}>
        <Button
          variant="icon"
          className={styles.navButton}
          onClick={handleHomeClick}
          aria-label="홈으로 이동"
        >
          {iconSize !== null && <HomeIcon width={iconSize} height={iconSize} />}
        </Button>

        <Button
          variant="icon"
          className={`${styles.navButton} ${isCategoryOpen ? styles.active : ""}`}
          onClick={toggleCategory}
          aria-label="카테고리 보기"
        >
          {iconSize !== null && <FolderIcon width={iconSize} height={iconSize} />}
        </Button>

        <Button
          variant="icon"
          className={`${styles.navButton} ${isLogOpen ? styles.active : ""}`}
          onClick={toggleLog}
          aria-label="로그 보기"
        >
          {iconSize !== null && <LogIcon width={iconSize} height={iconSize} />}
        </Button>

        <Button
          variant="icon"
          className={`${styles.navButton} ${isTagModalOpen ? styles.active : ""}`}
          onClick={toggleTagModal}
          aria-label="태그 보기"
        >
          {iconSize !== null && <TagIcon width={iconSize} height={iconSize} />}
        </Button>
      </div>
    </aside>
  );
};

export default NavigationView;