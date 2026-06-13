"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchAllStores } from "@/redux/slices/allStoresSlice";
import { fetchAllProducts } from "@/redux/slices/allProductsSlice";
import StoreCard from "./StoreCard";
import TodaysDealsCarousel from "./TodaysDealsCarousel";
import Image from "next/image";
import { Store, Category, Product } from "@/services/types";
import { fetchstoreCategory } from "@/services/apiService";
import { analytics } from "@/utils/mixpanel";
import SuperAppModules from "@/components/SuperAppModules";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Grid2X2,
  Sparkles,
  Store as StoreIcon,
} from "lucide-react";

const PAGE_SIZE = 9; // Stores per page

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const allStores = useAppSelector((state) => state.allStores.data);
  const storesLoading = useAppSelector((state) => state.allStores.loading);

  const { data: allProducts } = useAppSelector((state) => state.allProducts);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [page, setPage] = useState(1);

  // Fetch stores & products
  useEffect(() => {
    analytics.trackPageView('Home Screen');
    dispatch(fetchAllStores());
    dispatch(fetchAllProducts());
    const interval = setInterval(() => dispatch(fetchAllStores()), 120_000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const categoriesFromStores = useMemo(() => {
    if (!allStores.length) return [] as Category[];
    return Array.from(new Set(allStores.map((s) => s.category?.name)))
      .filter(Boolean)
      .map((name) => {
        const found = allStores.find((s) => s.category?.name === name);
        return found && found.category?.id !== undefined
          ? {
              name: name as string,
              id: found.category.id,
              image: found.category.image || null,
            }
          : null;
      })
      .filter((cat): cat is Category => !!cat);
  }, [allStores]);

  // Load all store categories from API (not only categories that already have stores)
  useEffect(() => {
    let cancelled = false;
    fetchstoreCategory()
      .then((apiCategories) => {
        if (cancelled) return;
        const mapped: Category[] = apiCategories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          image: cat.image || null,
        }));
        setCategories(mapped);
      })
      .catch(() => {
        if (!cancelled) setCategories(categoriesFromStores);
      });
    return () => {
      cancelled = true;
    };
  }, [categoriesFromStores]);

  // Geolocation for "nearby"
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () => null
      );
    }
  }, []);

  // Filtered stores (the API may return `category` as an object or a raw ID)
  const filteredStores = useMemo(() => {
    if (selectedCategory === null) return allStores;
    return allStores.filter((store) => {
      const categoryId =
        typeof store.category === "number" ? store.category : store.category?.id;
      return categoryId === selectedCategory;
    });
  }, [allStores, selectedCategory]);

  // Paginator
  const totalPages = Math.max(1, Math.ceil(filteredStores.length / PAGE_SIZE));
  const pagedStores = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredStores.slice(start, start + PAGE_SIZE);
  }, [filteredStores, page]);

  // Nearby logic
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const nearbyStores = useMemo(() => {
    if (!userLocation) return [];
    return allStores.filter((s) => {
      if (!s.location) return false;
      const [lat, lng] = s.location.split(",").map(Number);
      return getDistance(userLocation.latitude, userLocation.longitude, lat, lng) <= 3.5;
    });
  }, [allStores, userLocation]);

  // Today's Deals
  const todaysDeals: Product[] = useMemo(
    () => allProducts.filter((product) => product.on_sale),
    [allProducts]
  );

  const highlightedStats = useMemo(
    () => [
      {
        label: t("availableStores", "Available stores"),
        value: allStores.length.toString(),
      },
      {
        label: t("todaysDeals", "Today's deals"),
        value: todaysDeals.length.toString(),
      },
      {
        label: t("categories", "Categories"),
        value: categories.length.toString(),
      },
    ],
    [allStores.length, categories.length, t, todaysDeals.length],
  );

  // Reset page on filter/category change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, filteredStores.length]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-500">
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white border-b border-blue-400/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="space-y-4 md:space-y-5">
              <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-blue-100 mb-3">
                {t("premiumDeliveryExperience", "Premium delivery experience")}
              </p>
              <h1 className="brand-h1">
                {t("homeHeroTitle", "Everything you need, in one app")}
              </h1>
              <p className="max-w-2xl text-sm md:text-base leading-relaxed text-blue-50/95">
                {t(
                  "homeHeroSubtitle",
                  "Your life, one app",
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/stores" className="brand-button-primary">
                  {t("exploreStores", "Explore stores")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/services" className="brand-button-secondary">
                  {t("browseServices", "Browse services")}
                </Link>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 p-5 md:p-6">
              <p className="text-sm font-semibold text-blue-100 mb-4">
                {t("liveMarketplace", "Live marketplace")}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {highlightedStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/15 p-3 border border-white/20 brand-motion-lift">
                    <p className="text-xl md:text-2xl font-extrabold">{stat.value}</p>
                    <p className="text-[11px] md:text-xs text-blue-100">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 space-y-6 md:space-y-8">
        <section className="brand-section brand-section-rhythm">
          <SuperAppModules />
        </section>

        {/* CATEGORIES */}
        <section className="brand-section brand-section-rhythm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Grid2X2 className="w-5 h-5 text-blue-600" />
              <h2 className="brand-h2">
                {t("browseByCategory", "Browse by category")}
              </h2>
            </div>
            {selectedCategory !== null && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {t("clearFilter", "Clear filter")}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3 pb-2">
            <button
              key="all"
              className={`inline-flex items-center gap-3 p-3 pr-4 rounded-2xl border brand-motion-lift ${
                !selectedCategory
                  ? "bg-blue-600 text-white border-blue-600 shadow"
                  : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
              }`}
              onClick={() => setSelectedCategory(null)}
              tabIndex={0}
            >
              <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${!selectedCategory ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"}`}>
                <StoreIcon className="w-5 h-5" />
              </div>
              <span className="font-semibold">{t("allStores", "All stores")}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`inline-flex items-center gap-3 p-3 pr-4 rounded-2xl border brand-motion-lift ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                }`}
                onClick={() => setSelectedCategory(cat.id)}
                tabIndex={0}
              >
                <div className={`w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center ${selectedCategory === cat.id ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"}`}>
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} width={44} height={44} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-sm font-bold">{cat.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className="font-semibold">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* TODAY'S DEALS */}
        <section className="brand-section brand-section-rhythm">
          <TodaysDealsCarousel deals={todaysDeals} />
        </section>

        {/* NEARBY STORES */}
        <section className="brand-section brand-section-rhythm">
          <div className="flex items-center gap-2 mb-5">
            <Compass className="w-5 h-5 text-blue-600" />
            <h2 className="brand-h2">{t("nearbyStores", "Nearby stores")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userLocation && nearbyStores.length > 0 ? (
              nearbyStores.map((store) => (
                <StoreCard key={store.id} store={store} userLocation={userLocation} />
              ))
            ) : (
              <div className="col-span-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-slate-500 text-sm leading-relaxed">
                {t("noNearbyStores", "No nearby stores were found for your location yet.")}
              </div>
            )}
          </div>
        </section>

        {/* ALL STORES + PAGINATOR */}
        <section className="brand-section brand-section-rhythm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="brand-h2">{t("allStores", "All stores")}</h2>
            </div>
            <p className="text-xs md:text-sm text-slate-500">
              {t("showingStores", "Showing")} {pagedStores.length} / {filteredStores.length}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[18rem]">
            {storesLoading ? (
              <div className="col-span-full text-center text-slate-500">{t("loading", "Loading...")}</div>
            ) : pagedStores.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-slate-500 text-sm leading-relaxed">
                {t("noStores", "No stores available right now.")}
              </div>
            ) : (
              pagedStores.map((store) => (
                <StoreCard key={store.id} store={store} userLocation={userLocation} />
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-3">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-xl px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 brand-motion-lift disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                {t("previous", "Previous")}
              </button>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                {t("page", "Page")} {page} {t("of", "of")} {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 rounded-xl px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 brand-motion-lift disabled:opacity-40"
              >
                {t("next", "Next")}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomeScreen;
