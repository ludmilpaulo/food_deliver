"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  ChevronRight,
  MapPin,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Truck,
  ShieldCheck,
  Tag,
  User,
} from "lucide-react";
import logo from "@/assets/azul.png";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocationFilter } from "@/contexts/LocationContext";
import { useAppSelector } from "@/redux/store";
import { selectCartItems } from "@/redux/slices/basketSlice";
import { selectUser } from "@/redux/slices/authSlice";
import {
  useGetGroceryHomeQuery,
  useGetGroceryProductsQuery,
} from "@/redux/slices/groceryApi";
import type { GroceryBanner, GroceryProductQuery } from "@/types/grocery";
import GroceryProductCard from "./components/GroceryProductCard";
import { mapGroceryProduct, type GroceryProduct as CardProduct } from "./types";
import { CategorySkeleton, HeroSkeleton, ProductCardSkeleton } from "./components/GrocerySkeletons";
import PageSpinner from "@/components/ui/PageSpinner";

const BENEFIT_ICONS: Record<string, typeof Truck> = {
  truck: Truck,
  shield: ShieldCheck,
  tag: Tag,
  "map-pin": MapPin,
};

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useCountdown(iso: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!iso) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, [iso]);
  if (!iso) return null;
  const end = new Date(iso).getTime();
  const diff = Math.max(0, end - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { days, hours, minutes };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toCardProducts(rows: unknown[]): CardProduct[] {
  return rows.map(mapGroceryProduct).filter((product): product is CardProduct => product !== null);
}

export default function GroceryExperience() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useSearchParams();
  const { country, city } = useLocationFilter();
  const user = useAppSelector(selectUser);
  const cartQuantity = useAppSelector(selectCartItems).reduce((sum, item) => sum + item.quantity, 0);

  const categorySlug = params.get("category") || "";
  const view = params.get("view") || "home";
  const dealsOnly = categorySlug === "deals" || view === "deals";

  const [search, setSearch] = useState(params.get("q") || "");
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [popularFilter, setPopularFilter] = useState("");
  const [page, setPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const locationLabel = mounted
    ? city?.name || country?.name || t("location", "Your location")
    : t("location", "Your location");
  const visibleCartQuantity = mounted ? cartQuantity : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const homeQuery = useGetGroceryHomeQuery();
  const home = homeQuery.data;

  const productQuery = useMemo<GroceryProductQuery>(() => {
    const query: GroceryProductQuery = { page, page_size: 24 };
    if (debouncedSearch) query.q = debouncedSearch;
    if (dealsOnly) query.on_sale = true;
    else if (categorySlug) query.category_slug = categorySlug;
    else if (popularFilter) query.category_slug = popularFilter;
    return query;
  }, [page, debouncedSearch, dealsOnly, categorySlug, popularFilter, view]);

  const productsQuery = useGetGroceryProductsQuery(productQuery);
  const products = productsQuery.data?.results ?? [];
  const productCount = productsQuery.data?.count ?? 0;

  const dealsQuery = useGetGroceryProductsQuery({ on_sale: true, page_size: 16 });
  const countdown = useCountdown(home?.deals_end_at ?? null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categorySlug, popularFilter, view]);

  useEffect(() => {
    const slides = home?.hero.length ?? 0;
    if (slides < 2) return undefined;
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % slides);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [home?.hero.length]);

  function setCategory(slug: string, nextView = "home") {
    const next = new URLSearchParams();
    if (slug) next.set("category", slug);
    if (nextView !== "home") next.set("view", nextView);
    if (debouncedSearch) next.set("q", debouncedSearch);
    const qs = next.toString();
    router.push(qs ? `/groceries?${qs}` : "/groceries");
  }

  const navItems = home?.nav ?? [];
  const categories = home?.categories ?? [];
  const hero = home?.hero ?? [];
  const activeHero: GroceryBanner | undefined = hero[heroIndex] ?? hero[0];
  const popularFilters = home?.popular_filters ?? [];
  const showCategoryGrid = view === "categories";
  const loadingHome = homeQuery.isLoading;
  const loadingProducts = productsQuery.isLoading || productsQuery.isFetching;
  const homeError = homeQuery.isError && productsQuery.isError;

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#111827]">
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto hidden max-w-7xl items-center gap-6 px-6 py-3 lg:flex">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src={logo} alt="Kudya" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-extrabold text-[#0B8F45]">Kudya</span>
          </Link>
          <nav className="flex flex-1 items-center justify-center gap-1">
            {navItems.map((item) => {
              const active =
                (item.kind === "home" && !categorySlug && view === "home") ||
                (item.kind === "deals" && dealsOnly) ||
                item.slug === categorySlug;
              return (
                <button
                  key={`${item.kind}-${item.slug || "home"}`}
                  type="button"
                  onClick={() => setCategory(item.kind === "deals" ? "deals" : item.slug)}
                  className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                    active ? "bg-[#0B8F45] text-white" : "text-[#111827] hover:bg-[#EAF7EE]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            {headerSearchOpen ? (
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("grocerySearchPlaceholder")}
                className="h-10 w-56 rounded-full border border-[#E5E7EB] px-4 text-sm outline-none focus:border-[#0B8F45]"
              />
            ) : null}
            <button
              type="button"
              aria-label={t("search", "Search")}
              onClick={() => setHeaderSearchOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#EAF7EE]"
            >
              <Search size={20} />
            </button>
            <Link
              href="/CartPage"
              aria-label={t("Cart", "Cart")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#EAF7EE]"
            >
              <ShoppingCart size={20} />
              {visibleCartQuantity > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#0B8F45] px-1 text-[10px] font-bold text-white">
                  {visibleCartQuantity}
                </span>
              ) : null}
            </Link>
            <Link
              href={user ? "/UserDashboard" : "/LoginScreenUser"}
              aria-label={t("Profile", "Account")}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#EAF7EE]"
            >
              <User size={20} />
            </Link>
          </div>
        </div>

        <div className="px-4 pb-3 pt-3 lg:hidden">
          <div className="mb-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src={logo} alt="Kudya" width={36} height={36} className="rounded-lg" />
              <div>
                <p className="text-base font-extrabold leading-none text-[#0B8F45]">Kudya</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-[#6B7280]">
                  <MapPin size={11} />
                  {locationLabel}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/UserDashboard"
                aria-label={t("notifications", "Notifications")}
                className="flex h-11 w-11 items-center justify-center rounded-full"
              >
                <Bell size={20} />
              </Link>
              <Link href="/CartPage" aria-label={t("Cart", "Cart")} className="relative flex h-11 w-11 items-center justify-center">
                <ShoppingCart size={20} />
                {visibleCartQuantity > 0 ? (
                  <span className="absolute right-1 top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#0B8F45] px-1 text-[10px] font-bold text-white">
                    {visibleCartQuantity}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
          <label className="flex h-12 items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F8FAF9] px-4">
            <Search size={18} className="text-[#6B7280]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("grocerySearchPlaceholder")}
              className="h-full flex-1 bg-transparent text-sm outline-none"
            />
            <SlidersHorizontal size={18} className="text-[#6B7280]" aria-hidden />
          </label>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 lg:px-6">
        {homeError ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-xl font-bold">{t("groceryLoadError")}</h2>
            <p className="mt-2 text-[#6B7280]">{t("groceryLoadErrorHint")}</p>
            <button
              type="button"
              onClick={() => {
                void homeQuery.refetch();
                void productsQuery.refetch();
              }}
              className="mt-6 rounded-full bg-[#0B8F45] px-6 py-3 font-semibold text-white"
            >
              {t("groceryTryAgain")}
            </button>
          </div>
        ) : (
          <>
            {!showCategoryGrid && !debouncedSearch && view === "home" && !categorySlug ? (
              <>
                {loadingHome || !activeHero ? (
                  <HeroSkeleton />
                ) : (
                  <section className="relative overflow-hidden rounded-3xl bg-[#EAF7EE]">
                    <div className="grid items-center gap-6 p-6 md:grid-cols-2 md:p-10">
                      <div>
                        {activeHero.eyebrow ? (
                          <p className="mb-2 text-sm font-semibold text-[#056B34]">{activeHero.eyebrow}</p>
                        ) : null}
                        <h1 className="text-3xl font-black leading-tight text-[#111827] md:text-5xl">
                          {activeHero.title}
                        </h1>
                        {activeHero.subtitle ? (
                          <p className="mt-3 max-w-md text-sm text-[#6B7280] md:text-base">{activeHero.subtitle}</p>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setCategory(activeHero.cta_slug || "fresh-produce")}
                          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0B8F45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#056B34]"
                        >
                          {activeHero.cta_label || t("groceryShopNow")}
                          <ChevronRight size={16} />
                        </button>
                      </div>
                      <div className="relative">
                        <div className="aspect-[5/4] overflow-hidden rounded-3xl bg-white md:aspect-[4/3]">
                          {activeHero.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={activeHero.image}
                              alt={activeHero.title}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        {activeHero.badge_lines.length > 0 ? (
                          <div className="absolute -left-2 bottom-4 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[#0B8F45] text-center text-[11px] font-bold leading-tight text-white shadow-lg md:h-28 md:w-28 md:text-xs">
                            {activeHero.badge_lines.map((line) => (
                              <span key={line}>{line}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    {hero.length > 1 ? (
                      <div className="flex justify-center gap-2 pb-4">
                        {hero.map((slide, index) => (
                          <button
                            key={slide.id}
                            type="button"
                            aria-label={slide.title}
                            onClick={() => setHeroIndex(index)}
                            className={`h-2 rounded-full ${index === heroIndex ? "w-6 bg-[#0B8F45]" : "w-2 bg-[#0B8F45]/30"}`}
                          />
                        ))}
                      </div>
                    ) : null}
                  </section>
                )}

                <section className="mt-6 hidden gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 md:grid md:grid-cols-4">
                  {(home?.benefits ?? []).map((benefit) => {
                    const Icon = BENEFIT_ICONS[benefit.icon] ?? Truck;
                    return (
                      <div key={benefit.id} className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF7EE] text-[#0B8F45]">
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{benefit.title}</p>
                          <p className="text-xs text-[#6B7280]">{benefit.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </section>
                <section className="mt-4 flex gap-3 overflow-x-auto pb-1 md:hidden">
                  {(home?.benefits ?? []).map((benefit) => (
                    <div
                      key={benefit.id}
                      className="min-w-[160px] rounded-2xl border border-[#E5E7EB] bg-white px-3 py-3"
                    >
                      <p className="text-sm font-bold">{benefit.title}</p>
                      <p className="text-xs text-[#6B7280]">{benefit.subtitle}</p>
                    </div>
                  ))}
                </section>
              </>
            ) : null}

            <section className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold md:text-2xl">{t("groceryShopByCategory")}</h2>
                <button
                  type="button"
                  onClick={() => setCategory("", "categories")}
                  className="text-sm font-semibold text-[#0B8F45]"
                >
                  {t("groceryViewAll")}
                </button>
              </div>
              {loadingHome ? (
                <CategorySkeleton />
              ) : (
                <div className={showCategoryGrid ? "grid grid-cols-2 gap-3 sm:grid-cols-4" : "flex gap-4 overflow-x-auto pb-2"}>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setCategory(category.slug)}
                      className={`shrink-0 rounded-2xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 ${
                        showCategoryGrid ? "" : "w-32"
                      } ${categorySlug === category.slug ? "ring-2 ring-[#0B8F45]" : "border border-[#E5E7EB]"}`}
                    >
                      <div className="mb-2 aspect-square overflow-hidden rounded-xl bg-[#EAF7EE]">
                        {category.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={category.image} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <p className="text-center text-xs font-semibold">{category.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-10">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold md:text-2xl">
                  {dealsOnly ? t("groceryDealsOfTheWeek") : t("groceryPopularProducts")}
                </h2>
                {!dealsOnly ? (
                  <div className="hidden items-center gap-2 md:flex">
                    {popularFilters.map((filter) => {
                      const active = popularFilter === filter.slug && !categorySlug;
                      return (
                        <button
                          key={filter.slug || "all"}
                          type="button"
                          onClick={() => {
                            setPopularFilter(filter.slug);
                            setCategory("");
                          }}
                          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                            active ? "bg-[#0B8F45] text-white" : "bg-white text-[#6B7280] ring-1 ring-[#E5E7EB]"
                          }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              {loadingProducts ? (
                <PageSpinner color="green" />
              ) : products.length === 0 ? (
                <div className="rounded-2xl bg-white px-6 py-14 text-center">
                  <p className="font-semibold">{t("groceryNoProducts")}</p>
                  <p className="mt-1 text-sm text-[#6B7280]">{t("groceryNoProductsHint")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {toCardProducts(products).map((product) => (
                    <GroceryProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
              {productCount > products.length ? (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-full border border-[#0B8F45] px-5 py-2 text-sm font-semibold text-[#0B8F45]"
                  >
                    {t("groceryViewAll")}
                  </button>
                </div>
              ) : null}
            </section>

            {!debouncedSearch && view === "home" && !categorySlug ? (
              <>
                <section className="mt-12 grid gap-4 md:grid-cols-2">
                  {(home?.promotions ?? []).map((promo) => (
                    <button
                      key={promo.id}
                      type="button"
                      onClick={() => setCategory(promo.cta_slug)}
                      className="relative overflow-hidden rounded-3xl bg-[#111827] text-left text-white"
                    >
                      {promo.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={promo.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
                      ) : null}
                      <div className="relative min-h-[180px] p-6 md:min-h-[220px] md:p-8">
                        <h3 className="max-w-xs text-2xl font-black leading-tight whitespace-pre-line">
                          {promo.title.replace(/ (Better|Essentials)/, "\n$1")}
                        </h3>
                        {promo.subtitle ? <p className="mt-2 text-sm text-white/80">{promo.subtitle}</p> : null}
                        <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold">
                          {promo.cta_label} <ChevronRight size={16} />
                        </span>
                      </div>
                    </button>
                  ))}
                </section>

                <section className="mt-12">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold md:text-2xl">{t("groceryDealsOfTheWeek")}</h2>
                    <div className="flex items-center gap-3">
                      {mounted && countdown ? (
                        <p className="text-xs font-semibold text-[#056B34] md:text-sm">
                          {t("groceryEndsIn")} {countdown.days}d : {pad(countdown.hours)}h : {pad(countdown.minutes)}m
                        </p>
                      ) : null}
                      <button type="button" onClick={() => setCategory("deals")} className="text-sm font-semibold text-[#0B8F45]">
                        {t("groceryViewAll")}
                      </button>
                    </div>
                  </div>
                  {dealsQuery.isLoading ? (
                    <div className="flex gap-3 overflow-x-auto">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="w-44 shrink-0">
                          <ProductCardSkeleton />
                        </div>
                      ))}
                    </div>
                  ) : (dealsQuery.data?.results.length ?? 0) === 0 ? (
                    <p className="rounded-2xl bg-white px-6 py-10 text-center text-[#6B7280]">{t("groceryNoDeals")}</p>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {toCardProducts(dealsQuery.data?.results ?? []).map((product) => (
                        <div key={product.id} className="w-44 shrink-0 sm:w-52">
                          <GroceryProductCard product={product} compact />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
