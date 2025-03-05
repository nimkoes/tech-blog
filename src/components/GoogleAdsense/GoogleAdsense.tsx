"use client";

import { useEffect, useRef } from 'react';
import styles from './GoogleAdsense.module.scss';

interface GoogleAdsenseProps {
  className?: string;
  style?: React.CSSProperties;
  client: string;
  slot: string;
  format?: string;
  responsive?: string;
}

export default function GoogleAdsense({ 
  className,
  style,
  client,
  slot,
  format = "auto",
  responsive = "true"
}: GoogleAdsenseProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (adRef.current && typeof window !== "undefined") {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      }
    } catch (err) {
      console.error('Error loading Google AdSense:', err);
    }
  }, []);

  return (
    <div ref={adRef} className={`${styles.adContainer} ${className || ''}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
} 