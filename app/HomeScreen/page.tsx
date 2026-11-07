"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { clearStores, fetchAllStores } from "@/redux/slices/allStoresSlice";
import { fetchAllProducts } from "@/redux/slices/allProductsSlice";
import StoreCard from "./StoreCard";
import TodaysDealsCarousel from "./TodaysDealsCarousel";
import Image from "next/image";
import { Category, Product } from "@/services/types";
import { fetchStoreCategories } from "@/services/storeCatalog";
import { analytics } from "@/utils/mixpanel";
import SuperAppModules from "@/components/SuperAppModules";
import LocationFilterBar from "@/components/location/LocationFilterBar";
import { useLocationFilter } from "@/contexts/LocationContext";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Grid2X2,
} from "lucide-react";

const PAGE_SIZE = 9;

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const storesRaw = useAppSelector((state) => state.allStores.data);
  const storesCount = useAppSelector((state) => state.allStores.count);
  const storesLoading = useAppSelector((state) => state.allStores.loading);
  const storesError = useAppSelector((state) => state.allStores.error);
  const stores = Array.isArray(storesRaw) ? storesRaw : [];

  const { data: allProductsRaw } = useAppSelector((state) => state.allProducts);
  const allProducts = useMemo(
    () => (Array.isArray(allProductsRaw) ? allProductsRaw : []),
    [allProductsRaw],
  );

  const {
    country,
    province,
    city,
    coords,
    discoveryMode,
    gpsStatus,
  } = useLocationFilter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    analytics.trackPageView("Home Screen");
    dispatch(fetchAllProducts());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);
    fetchStoreCategories()
      .then((apiCategories) => {
        if (cancelled) return;
        setCategories(
          apiCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            image: cat.image || null,
          })),
        );
        setCategoriesError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([]);
          setCategoriesError(t("categoriesLoadFailed", "Could not load categories."));
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  const locationReady =
    discoveryMode === "nearby"
      ? Boolean(coords)
      : Boolean(country || province || city);

  useEffect(() => {
    if (selectedCategory === null) {
      dispatch(clearStores());
      return;
    }
    if (!locationReady) {
      dispatch(clearStores());
      return;
    }
    void dispatch(
      fetchAllStores({
        category: selectedCategory,
        country: country?.id,
        province: province?.id ?? undefined,
        city: city?.id ?? undefined,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        page,
        pageSize: PAGE_SIZE,
      }),
    );
  }, [
    dispatch,
    selectedCategory,
    locationReady,
    country?.id,
    province?.id,
    city?.id,
    coords?.latitude,
    coords?.longitude,
    page,
  ]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, country?.id, province?.id, city?.id, coords?.latitude, coords?.longitude]);

  const todaysDeals: Product[] = useMemo(
    () => allProducts.filter((product) => product.on_sale),
    [allProducts],
  );

  const totalPages = Math.max(1, Math.ceil(storesCount / PAGE_SIZE));
  const selectedCategoryName = categories.find((cat) => cat.id === selectedCategory)?.name;

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
                {t("homeHeroSubtitle", "Your life, one app")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/StoreTypes" className="brand-button-primary">
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
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/15 p-3 border border-white/20">
                  <p className="text-xl md:text-2xl font-extrabold">{categories.length}</p>
                  <p className="text-[11px] md:text-xs text-blue-100">{t("categories", "Categories")}</p>
                </div>
                <div className="rounded-xl bg-white/15 p-3 border border-white/20">
                  <p className="text-xl md:text-2xl font-extrabold">{todaysDeals.length}</p>
                  <p className="text-[11px] md:text-xs text-blue-100">{t("todaysDeals", "Today's deals")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 space-y-6 md:space-y-8">
        <section className="brand-section brand-section-rhythm">
          <SuperAppModules />
        </section>

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
          {categoriesLoading ? (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-16 w-40 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : null}
          {categoriesError ? (
            <p className="text-sm text-amber-700">{categoriesError}</p>
          ) : null}
          {!categoriesLoading && !categoriesError && categories.length === 0 ? (
            <p className="text-sm text-slate-500">
              {t("noCategories", "No categories are available right now.")}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3 pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`inline-flex items-center gap-3 p-3 pr-4 rounded-2xl border brand-motion-lift ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                }`}
                onClick={() => setSelectedCategory(cat.id)}
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

        {selectedCategory !== null && (
          <section className="brand-section brand-section-rhythm">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-blue-600" />
              <h2 className="brand-h2">
                {t("chooseLocation", "Choose a location")}
              </h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              {t(
                "categoryThenLocationHint",
                "Use Near me or pick a country, province, and city to see matching businesses.",
              )}
            </p>
            <LocationFilterBar />
            {discoveryMode === "nearby" && gpsStatus === "prompting" ? (
              <p className="mt-3 text-sm text-slate-500">{t("locating", "Locating…")}</p>
            ) : null}
          </section>
        )}

        <section className="brand-section brand-section-rhythm">
          <TodaysDealsCarousel deals={todaysDeals} />
        </section>

        {selectedCategory !== null && (
          <section className="brand-section brand-section-rhythm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="brand-h2">
                {selectedCategoryName
                  ? t("resultsForCategory", "Results") + `: ${selectedCategoryName}`
                  : t("results", "Results")}
              </h2>
              {locationReady ? (
                <p className="text-xs md:text-sm text-slate-500">
                  {t("showingStores", "Showing")} {stores.length} / {storesCount}
                </p>
              ) : null}
            </div>
            {!locationReady ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-slate-500 text-sm">
                {t(
                  "selectLocationToSeeResults",
                  "Select Near me or a country / city to load businesses from Kudya.",
                )}
              </div>
            ) : storesLoading ? (
              <div className="text-center text-slate-500">{t("loading", "Loading...")}</div>
            ) : storesError ? (
              <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-700 text-sm">
                {storesError}
              </div>
            ) : stores.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-slate-500 text-sm">
                {t("noStores", "No stores available right now.")}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <StoreCard key={store.id} store={store} userLocation={coords} />
                ))}
              </div>
            )}
            {locationReady && totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-3">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-xl px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 brand-motion-lift disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t("previous", "Previous")}
                </button>
                <span className="text-sm font-semibold text-slate-600 px-4 py-2 rounded-xl bg-slate-100">
                  {t("page", "Page")} {page} {t("of", "of")} {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 rounded-xl px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 brand-motion-lift disabled:opacity-40"
                >
                  {t("next", "Next")}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
