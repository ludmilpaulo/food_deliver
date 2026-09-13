'use client';

export function HeroSkeleton() {
  return <div className="h-56 animate-pulse rounded-3xl bg-white md:h-80" />;
}

export function CategorySkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-28 w-28 shrink-0 animate-pulse rounded-2xl bg-white" />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <div className="mb-3 aspect-square animate-pulse rounded-xl bg-[#EAF7EE]" />
      <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
      <div className="mt-4 h-10 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
