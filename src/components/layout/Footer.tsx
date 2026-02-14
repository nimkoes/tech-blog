import styles from './Footer.module.scss';

const externalLinks = [
  {
    label: 'Portfolio',
    href: 'https://nimkoes.github.io/portfolio/',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/wxpjegiysxlovzvhvjncev',
  },
  {
    label: 'Tistory',
    href: 'https://xxxelppa.tistory.com/',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/nimkoes',
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Tech Blog. All rights reserved.
          </p>
          <div className={styles.links} aria-label="외부 링크">
            {externalLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {link.label}
              </a>
            ))}
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
