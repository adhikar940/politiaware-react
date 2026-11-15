import React, { useEffect, useRef } from 'react';
import { isAdSenseEligible, formatPublisherId } from '../../utils/loadAdSense';

export interface AdSenseBannerProps {
  slot: string;
  client?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: 'true' | 'false';
  style?: React.CSSProperties;
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slot,
  client,
  format = 'auto',
  responsive = 'true',
  style,
  className,
}) => {
  const rawClient = client || import.meta.env.VITE_ADSENSE_PUB_ID;
  const adClient = formatPublisherId(rawClient);
  const isPushed = useRef(false);

  useEffect(() => {
    if (!isAdSenseEligible() || !adClient || !slot) {
      return;
    }

    // Guard against double pushing in StrictMode
    if (isPushed.current) {
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
      }
    } catch (err) {
      console.warn('AdSense push error:', err);
    }
  }, [adClient, slot]);

  // If not eligible (e.g. Android app, localhost, or env var not set), render nothing
  if (!isAdSenseEligible() || !adClient || !slot) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        textAlign: 'center',
        margin: '12px auto',
        overflow: 'hidden',
        ...style,
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};
