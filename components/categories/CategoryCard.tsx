"use client";

import Link from "next/link";
import type { HomeModule } from "@/services/platformApi";
import { resolveWebModuleRoute } from "@/services/platformApi";
import {
  Utensils,
  ShoppingBasket,
  Home,
  Bed,
  Briefcase,
  Stethoscope,
  Car,
  Package,
  Wallet,
  Building2,
  Grid2X2,
  type LucideIcon,
} from "lucide-react";

const ICON_BY_KEY: Record<string, LucideIcon> = {
  utensils: Utensils,
  "shopping-basket": ShoppingBasket,
  home: Home,
  bed: Bed,
  briefcase: Briefcase,
  stethoscope: Stethoscope,
  "car-side": Car,
  car: Car,
  package: Package,
  wallet: Wallet,
  building: Building2,
};

type CategoryCardProps = {
  module: HomeModule;
  className?: string;
};

export default function CategoryCard({ module, className = "" }: CategoryCardProps) {
  const gradientStart = module.gradient[0] || module.color;
  const gradientEnd = module.gradient[1] || module.color;
  const Icon = ICON_BY_KEY[module.icon] || Grid2X2;
  const href = resolveWebModuleRoute(module.route, module.key);
  const comingSoon = !module.availableOnWeb;
  const isDisabled = !module.isActive || comingSoon;

  const cardBody = (
  <div
    className={`group relative overflow-hidden rounded-2xl p-4 min-h-[128px] flex flex-col justify-between text-white shadow-lg transition-all duration-300 ${
      isDisabled ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
    } ${className}`}
    style={{
      background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
    }}
  >
    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
    <div className="relative z-10 flex items-start justify-between gap-2">
      <span className="text-lg font-bold leading-tight pr-2">{module.name}</span>
      <span className="rounded-xl bg-white/20 p-2 backdrop-blur-sm shrink-0">
        <Icon className="w-5 h-5" aria-hidden />
      </span>
    </div>
    <p className="relative z-10 text-sm text-white/90 mt-3 leading-snug">{module.description}</p>
    {comingSoon && (
      <span className="relative z-10 mt-3 inline-flex w-fit rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
        Coming soon
      </span>
    )}
  </div>
  );

  if (isDisabled) {
    return cardBody;
  }

  return (
    <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl">
      {cardBody}
    </Link>
  );
}
