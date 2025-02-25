"use client";

import { useState } from "react";
import styles from "./page.module.scss";
import Category from "../components/Category";
import Contents from "../components/Contents";

const HomePage = () => {
  const [selectedMd, setSelectedMd] = useState("");

  return (
    <main className={styles.home}>
      <Category onSelect={setSelectedMd} />
      <div className={styles.homeContainer}>
        <Contents mdPath={selectedMd} />
      </div>
    </main>
  );
};

export default HomePage;