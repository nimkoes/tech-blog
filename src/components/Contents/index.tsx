import activityList from "@resources/contents.json";
import styles from "./Contents.module.scss";

const Activities = () => (
  <div className={styles.activity}>
    <h2>CONTENTS</h2>

    <ul className={styles.activityList}>
      {activityList.map((activity) => (
        <li className={styles.activityItem} key={activity}>
          {activity}
        </li>
      ))}
    </ul>
  </div>
);

export default Activities;
