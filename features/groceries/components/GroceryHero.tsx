'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { useTranslation } from '@/hooks/useTranslation';
import GroceryImage from './GroceryImage';
import type { GroceryBanner } from '../types';
import { parseGroceryCategoryHref } from '../types';

export default function GroceryHero({ banners }: { banners: GroceryBanner[] }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  if (!banners.length) return null;
  const banner = banners[Math.min(index, banners.length - 1)];
  const categorySlug = parseGroceryCategoryHref(banner.cta_href);
  const href = categorySlug ? `/groceries/category/${categorySlug}` : banner.cta_href || '/groceries?section=popular';
  const badgeLines = banner.badge.split('\n').filter(Boolean);

  return (
    <section className="overflow-hidden rounded-3xl bg-[#EAF7EE]">
      <div className="grid items-center gap-6 p-5 md:grid-cols-2 md:p-10">
        <div className="order-2 md:order-1">
          {banner.subtitle ? (
            <p className="text-sm font-semibold text-[#0B8F45]">{banner.subtitle}</p>
          ) : null}
          <h1 className="mt-2 max-w-md text-3xl font-extrabold tracking-tight text-[#111827] md:text-5xl">
            {banner.title}
          </h1>
          {banner.body ? <p className="mt-3 max-w-lg text-sm leading-6 text-[#6B7280] md:text-base">{banner.body}</p> : null}
          <Link
            href={href}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#0B8F45] px-5 text-sm font-semibold text-white hover:bg-[#056B34]"
          >
            {banner.cta_label || t('shopNow', 'Shop Now')}
            <FiArrowRight />
          </Link>
        </div>
        <div className="relative order-1 md:order-2">
          <div className="relative mx-auto h-48 w-full overflow-hidden rounded-3xl bg-white md:h-80">
            <GroceryImage src={banner.image} alt={banner.title} className="h-full w-full object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          {badgeLines.length ? (
            <div className="absolute -bottom-2 right-3 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#0B8F45] text-center text-[11px] font-bold leading-4 text-white shadow-lg md:right-6 md:h-28 md:w-28 md:text-xs">
              {badgeLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {banners.length > 1 ? (
        <div className="flex justify-center gap-2 pb-4">
          {banners.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${t('heroSlide', 'Hero slide')} ${itemIndex + 1}`}
              onClick={() => setIndex(itemIndex)}
              className={`h-2.5 rounded-full ${itemIndex === index ? 'w-6 bg-[#0B8F45]' : 'w-2.5 bg-[#111827]/20'}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center pb-4">
          <span className="h-2.5 w-6 rounded-full bg-[#0B8F45]" />
        </div>
      )}
    </section>
  );
}
