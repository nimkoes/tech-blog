import styles from "./Menu.module.scss";
import careerList from "@resources/menu-category.json";

const Careers = () => (
  <div className={styles.career}>
    <h2>CATEGORY</h2>

    <ol className={styles.careerList}>
      {careerList.sort((a, b) => b.id - a.id).map(({ id, from, to, contents }) => (
        <li className={styles.careerItem} key={id}>
          <div className={styles.careerPeriod}>
            {from && <span className={styles.careerPeriodFrom}>{from}</span>}
            {" ~ "}
            {to && <span className={styles.careerPeriodTo}>{to}</span>}
          </div>

          <div className={styles.careerContents}>
            {contents && contents.length > 0 && contents.map((content) => <p key={content}>{content}</p>)}
          </div>
        </li>
      ))}
    </ol>
  </div>
);

export default Careers;
