'use client';

import { serviceName } from '@/lib/brand';

const watermarkSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="260" height="180" viewBox="0 0 260 180">
    <g transform="translate(20 110) rotate(-24)">
      <text
        x="0"
        y="0"
        font-family="Arial, sans-serif"
        font-size="20"
        font-weight="700"
        fill="rgba(15,23,42,0.18)"
        letter-spacing="1.8"
      >
        ${serviceName} FREE PREVIEW
      </text>
    </g>
  </svg>
`);

interface PreviewWatermarkProps {
  testId?: string;
}

export function PreviewWatermark({ testId }: PreviewWatermarkProps) {
  return (
    <div
      data-testid={testId}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `url("data:image/svg+xml,${watermarkSvg}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '220px 150px',
      }}
    />
  );
}
