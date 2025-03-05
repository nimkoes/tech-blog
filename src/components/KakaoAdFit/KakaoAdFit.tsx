"use client";

import { useEffect, useRef } from 'react';
import styles from './KakaoAdFit.module.scss';

interface KakaoAdFitProps {
  className?: string;
}

export default function KakaoAdFit({ className }: KakaoAdFitProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current) {
      const ins = document.createElement('ins');
      const script = document.createElement('script');

      ins.className = 'kakao_ad_area';
      ins.style.display = 'none';
      ins.setAttribute('data-ad-unit', 'DAN-eUnPVmJWxiC2gth3');
      ins.setAttribute('data-ad-width', '250');
      ins.setAttribute('data-ad-height', '250');

      script.async = true;
      script.type = 'text/javascript';
      script.src = '//t1.daumcdn.net/kas/static/ba.min.js';

      adRef.current.appendChild(ins);
      adRef.current.appendChild(script);
    }

    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={adRef} 
      className={`${styles.adContainer} ${className || ''}`}
    />
  );
} 