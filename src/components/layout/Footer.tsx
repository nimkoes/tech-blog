import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Tech Blog. All rights reserved.
          </p>
          <div className={styles.links}>
            <a 
              href="https://github.com/nimkoes"
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.link}
            >
              GitHub
            </a>
            <a 
              href="mailto:xxxelppa@gmail.com"
              className={styles.link}
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 