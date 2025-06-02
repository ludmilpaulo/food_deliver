"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchAllStores } from "@/redux/slices/allStoresSlice";
import { fetchAllProducts } from "@/redux/slices/allProductsSlice";
import StoreCard from "./StoreCard";
import ProductCard from "@/components/ProductCard";
import TodaysDealsCarousel from "./TodaysDealsCarousel";
import Image from "next/image";
import { t } from "@/configs/i18n";
import { Store, Category, Product } from "@/services/types";

const PAGE_SIZE = 9; // Stores per page

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const allStores = useAppSelector((state) => state.allStores.data);
  const storesLoading = useAppSelector((state) => state.allStores.loading);

  const { data: allProducts, loading: productsLoading } = useAppSelector(
    (state) => state.allProducts
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [page, setPage] = useState(1);

  // Fetch stores & products
  useEffect(() => {
    dispatch(fetchAllStores());
    dispatch(fetchAllProducts());
    const interval = setInterval(() => dispatch(fetchAllStores()), 120_000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Category extraction
  useEffect(() => {
    if (allStores.length) {
      const unique = Array.from(
        new Set(allStores.map((s) => s.category?.name))
      )
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
      setCategories(unique);
    }
  }, [allStores]);

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

  // Filtered stores
  const filteredStores = useMemo(() => {
    if (!selectedCategory) return allStores;
    return allStores.filter((store) => store.category?.name === selectedCategory);
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

  // Reset page on filter/category change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, filteredStores.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-blue-200 dark:from-gray-800 dark:via-blue-900 dark:to-gray-900 transition-colors duration-700">

      {/* CATEGORIES */}
      <div className="flex justify-center mb-6 overflow-x-auto whitespace-nowrap px-2 pt-7 glassy border border-white/40 shadow-lg rounded-2xl mx-auto max-w-6xl">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`inline-block p-3 px-4 text-center mx-1 cursor-pointer select-none transition font-semibold text-gray-700 dark:text-white shadow hover:scale-105 focus:scale-105 rounded-xl ${
              selectedCategory === cat.name
                ? "bg-blue-200/60 dark:bg-blue-900/60 border border-blue-500"
                : "bg-white/30 dark:bg-gray-800/30 border border-white/30"
            }`}
            onClick={() => setSelectedCategory(cat.name)}
            tabIndex={0}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden mb-2 flex items-center justify-center bg-white/40 dark:bg-black/20 border border-white/30 mx-auto">
              {cat.image ? (
                <Image src={cat.image} alt={cat.name} width={64} height={64} className="object-cover" />
              ) : (
                <span className="text-2xl text-blue-700 font-bold">{cat.name.slice(0, 2)}</span>
              )}
            </div>
            <span>{cat.name}</span>
          </button>
        ))}
        <button
          key="all"
          className={`inline-block p-3 px-4 text-center mx-1 cursor-pointer select-none transition font-semibold text-gray-700 dark:text-white shadow hover:scale-105 focus:scale-105 rounded-xl ${
            !selectedCategory
              ? "bg-blue-200/60 dark:bg-blue-900/60 border border-blue-500"
              : "bg-white/30 dark:bg-gray-800/30 border border-white/30"
          }`}
          onClick={() => setSelectedCategory(null)}
          tabIndex={0}
        >
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-200/60 dark:bg-black/30 border border-white/30 mx-auto text-xl font-bold">
            🛒
          </div>
          <span>{t("allStores")}</span>
        </button>
      </div>

      {/* TODAY'S DEALS */}
      <TodaysDealsCarousel deals={todaysDeals} />

      {/* NEARBY STORES */}
      <section className="max-w-6xl mx-auto px-2 py-2">
        <h2 className="text-xl md:text-2xl font-extrabold mb-4 glassy px-4 py-2 rounded-lg flex items-center gap-2">
          <span role="img" aria-label="map">📍</span> {t("nearbyStores")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userLocation && nearbyStores.length > 0 ? (
            nearbyStores.map((store) => <StoreCard key={store.id} store={store} />)
          ) : (
            <div className="col-span-full text-gray-400">{t("noStores")}</div>
          )}
        </div>
      </section>

      {/* ALL STORES + PAGINATOR */}
      <section className="max-w-6xl mx-auto px-2 py-2">
        <h2 className="text-xl md:text-2xl font-extrabold mb-4 glassy px-4 py-2 rounded-lg flex items-center gap-2">
          <span role="img" aria-label="shop">🏬</span> {t("allStores")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[18rem]">
          {storesLoading ? (
            <div className="col-span-full text-center">{t("loading")}</div>
          ) : pagedStores.length === 0 ? (
            <div className="col-span-full text-gray-400">{t("noStores")}</div>
          ) : (
            pagedStores.map((store) => <StoreCard key={store.id} store={store} />)
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-4 glassy p-3 rounded-2xl border border-white/30">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="rounded-full px-3 py-1 bg-white/70 dark:bg-black/30 text-blue-800 dark:text-white shadow font-bold transition disabled:opacity-40"
            >
              ⬅️
            </button>
            <span className="text-lg font-semibold text-blue-700 dark:text-yellow-200 px-4 py-1 bg-white/60 dark:bg-black/40 rounded-lg shadow glassy border border-white/30">
              {page} <span className="text-gray-400">/</span> {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="rounded-full px-3 py-1 bg-white/70 dark:bg-black/30 text-blue-800 dark:text-white shadow font-bold transition disabled:opacity-40"
            >
              ➡️
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeScreen;
