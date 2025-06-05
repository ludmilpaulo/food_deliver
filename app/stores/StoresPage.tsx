"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchStoresByType } from "@/redux/slices/storesSlice";

import { motion } from "framer-motion";
import Image from "next/image";
import { t } from "@/configs/i18n";


// Util for distance calculation (Haversine formula)
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Optional: Simple user location hook
function useUserLocation() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setLocation(null),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 180000 }
    );
  }, []);
  return location;
}

export default function StoresPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useSearchParams();
  const storeTypeId = Number(params.get("storeTypeId"));

  const stores = useAppSelector((state) => state.stores.data);
  const loading = useAppSelector((state) => state.stores.loading);
  const error = useAppSelector((state) => state.stores.error);

  const userLocation = useUserLocation();

  useEffect(() => {
    if (storeTypeId) dispatch(fetchStoresByType(storeTypeId));
  }, [storeTypeId, dispatch]);

  // Add distances to stores
  const storesWithDistance = useMemo(() => {
    return stores.map((store) => {
      let distance = null;
      if (
        userLocation &&
        typeof store.latitude === "number" &&
        typeof store.longitude === "number"
      ) {
        distance = getDistanceFromLatLonInKm(
          userLocation.latitude,
          userLocation.longitude,
          store.latitude,
          store.longitude
        );
      }
      return { ...store, distance };
    });
  }, [stores, userLocation]);

  // Sort by distance if available
  const sortedStores = useMemo(() => {
    return [...storesWithDistance].sort((a, b) => {
      if (a.distance != null && b.distance != null) {
        return a.distance - b.distance;
      }
      if (a.distance != null) return -1;
      if (b.distance != null) return 1;
      return 0;
    });
  }, [storesWithDistance]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-400 to-blue-500 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-6">{t("Stores")}</h1>

        {loading && (
          <div className="flex flex-col items-center py-24">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin" />
            <p className="text-white mt-4">{t("loading")}</p>
          </div>
        )}

        {error && !loading && (
          <p className="text-center text-red-200 bg-red-600/70 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {!loading && !error && sortedStores.length === 0 && (
          <p className="text-center text-white/90 mt-16 text-base">
            {t("noStores")}
          </p>
        )}

        <div className="flex flex-wrap gap-6 justify-between">
          {!loading &&
            sortedStores.map((store, idx) => (
              <motion.div
                key={store.id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.06, type: "spring", stiffness: 120 }}
                className="bg-white/90 hover:bg-blue-50 transition rounded-2xl shadow-lg w-full sm:w-[48%] md:w-[31%] p-5 flex flex-col items-center mb-4 cursor-pointer"
                onClick={() => router.push(`/products?storeId=${store.id}&storeName=${encodeURIComponent(store.name)}`)}
              >
                {store.images ? (
                  <Image
                    src={store.images}
                    alt={store.name}
                    width={90}
                    height={90}
                    className="rounded-xl object-cover mb-3"
                  />
                ) : (
                  <div className="w-[90px] h-[90px] rounded-xl bg-blue-300 flex items-center justify-center mb-3">
                    <span className="text-3xl text-white font-bold">{store.name[0]}</span>
                  </div>
                )}
                <h2 className="text-lg font-semibold text-blue-900 mb-2">{store.name}</h2>
                <p className="text-sm text-gray-600 text-center line-clamp-2">{store.address}</p>
                {store.distance != null && (
                  <div className="text-xs text-blue-600 mt-2">
                    {store.distance.toFixed(1)} km {t("away") /* Add this key to translations if you want */}
                  </div>
                )}
              </motion.div>
            ))}
        </div>
      </div>
    </main>
  );
}
