import type { TocItem } from '~/types/content';

interface TOCProps {
  toc: TocItem[];
}

const TOC = ({toc}: TOCProps) => {
  return (
    <div className="tocCard">
      <details open style={{marginBottom: '1rem'}}>
        <summary>Table of Contents</summary>
        <ul style={{listStyle: 'disc', paddingLeft: '1.2rem'}}>
          {toc.map((item, idx) => (
            <li key={idx} style={{marginLeft: `${(item.level - 1) * 1.2}em`}}>
              <a
                href={`#${item.id}`}
                style={{fontSize: 'inherit', textDecoration: 'underline', cursor: 'pointer'}}
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
