import React from 'react';

export interface TOCItem {
  level: number;
  text: string;
  id: string;
}

interface TOCProps {
  toc: TOCItem[];
}

const TOC: React.FC<TOCProps> = ({ toc }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);

    if (el) {
      const headerOffset = 80; // 헤더 높이 + 여유 공간
      const elementPosition = el.offsetTop; // 요소의 절대 위치
      const scrollPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="tocCard">
      <details open style={{ marginBottom: '1rem' }}>
        <summary>Table of Contents</summary>
        <ul style={{ listStyle: 'disc', paddingLeft: '1.2rem' }}>
          {toc.map((item, idx) => (
            <li key={idx} style={{ marginLeft: `${(item.level - 1) * 1.2}em` }}>
              <a
                href={`#${item.id}`}
                onClick={e => handleClick(e, item.id)}
                style={{ fontSize: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
};

export default TOC; 