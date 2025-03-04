"use client";

import { useRouter } from "next/navigation";
import styles from "./GoToHome.module.scss";

export default function GoToHome() {
  const router = useRouter();

  return (
    <button className={styles.goToHome} onClick={() => router.push("/")}>
      🏠
    </button>
  );
}