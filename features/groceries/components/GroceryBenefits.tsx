'use client';

import { FiTruck, FiShield, FiTag, FiMapPin } from 'react-icons/fi';
import type { GroceryBanner } from '../types';

const ICONS = {
  truck: FiTruck,
  shield: FiShield,
  tag: FiTag,
  'map-pin': FiMapPin,
} as const;

export default function GroceryBenefits({ benefits }: { benefits: GroceryBanner[] }) {
  if (!benefits.length) return null;
  return (
    <section className="grocery-benefits-row grocery-hide-scrollbar">
      {benefits.map((benefit) => {
        const Icon = ICONS[benefit.icon as keyof typeof ICONS] ?? FiTruck;
        return (
          <article
            key={benefit.id}
            className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 md:min-w-0"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF7EE] text-[#0B8F45]">
              <Icon size={18} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#111827]">{benefit.title}</h3>
              <p className="text-xs text-[#6B7280]">{benefit.subtitle}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
