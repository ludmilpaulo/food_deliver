'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import GroceryImage from './GroceryImage';
import type { GroceryBanner } from '../types';
import { parseGroceryCategoryHref } from '../types';

function PromoBanner({ banner, dark = false }: { banner: GroceryBanner; dark?: boolean }) {
  const categorySlug = parseGroceryCategoryHref(banner.cta_href);
  const href = categorySlug ? `/groceries/category/${categorySlug}` : banner.cta_href || '/groceries';
  return (
    <article className={`relative overflow-hidden rounded-3xl ${dark ? 'bg-[#056B34]' : 'bg-[#0B8F45]'}`}>
      <div className="grid min-h-[220px] items-center gap-4 p-6 md:grid-cols-2 md:p-8">
        <div className="relative z-10">
          <h3 className="whitespace-pre-line text-2xl font-extrabold leading-tight text-white md:text-3xl">
            {banner.title}
          </h3>
          {banner.subtitle ? <p className="mt-2 text-sm text-white/85">{banner.subtitle}</p> : null}
          <Link
            href={href}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#056B34] hover:bg-[#EAF7EE]"
          >
            {banner.cta_label}
            <FiArrowRight />
          </Link>
        </div>
        <div className="relative h-36 md:h-48">
          <GroceryImage src={banner.image} alt={banner.title} className="h-full w-full object-cover" />
        </div>
      </div>
    </article>
  );
}

export default function PromotionalBanners({ banners }: { banners: GroceryBanner[] }) {
  if (!banners.length) return null;
  return (
    <section className="grocery-promo-grid">
      {banners.slice(0, 2).map((banner, index) => (
        <PromoBanner key={banner.id} banner={banner} dark={index === 1} />
      ))}
    </section>
  );
}
