import activityList from "@resources/activities.json";
import styles from "./Activities.module.scss";

const Activities = () => (
  <div className={styles.activity}>
    <h2>ACTIVITIES & AWARD</h2>

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
