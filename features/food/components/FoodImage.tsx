'use client';

import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

export default function FoodImage({
  src,
  alt,
  className = '',
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-food-soft to-violet-100 text-food ${className}`}
        role="img"
        aria-label={alt}
      >
        <UtensilsCrossed className="h-8 w-8 opacity-70" aria-hidden />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} onError={() => setFailed(true)} />
  );
}
