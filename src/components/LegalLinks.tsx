'use client';

import Link from 'next/link';

type LegalLinksProps = {
  className?: string;
  linkClassName?: string;
};

export function LegalLinks({ className, linkClassName }: LegalLinksProps) {
  return (
    <div className={className}>
      <Link href="/terms" className={linkClassName}>
        利用規約
      </Link>
      <Link href="/privacy" className={linkClassName}>
        プライバシーポリシー
      </Link>
    </div>
  );
}
