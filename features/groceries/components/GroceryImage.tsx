'use client';

import { useState } from 'react';

export default function GroceryImage({
  src,
  alt,
  className = '',
  sizes = '(max-width: 768px) 50vw, 240px',
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[#EAF7EE] text-sm font-medium text-[#0B8F45] ${className}`}
        aria-hidden={!alt}
      >
        {alt || 'Kudya'}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading="lazy"
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
