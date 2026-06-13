"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Store } from "@/services/types";
import { useTranslation } from "@/hooks/useTranslation";

interface StoreCardProps {
  store: Store;
  userLocation?: { latitude: number; longitude: number } | null;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, userLocation }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [imageErrored, setImageErrored] = useState(false);

  useEffect(() => {
    setImageErrored(false);
  }, [store.logo]);

  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  }

  const distanceAndEta = useMemo(() => {
    if (!userLocation || !store.location) {
      return { distance: null as number | null, timeAway: null as number | null };
    }
    const [storeLat, storeLng] = store.location.split(",").map(Number);
    if (Number.isNaN(storeLat) || Number.isNaN(storeLng)) {
      return { distance: null as number | null, timeAway: null as number | null };
    }
    const distance = getDistance(
      userLocation.latitude,
      userLocation.longitude,
      storeLat,
      storeLng,
    );
    const walkingSpeedKmh = 5;
    return { distance, timeAway: (distance / walkingSpeedKmh) * 60 };
  }, [store.location, userLocation]);

  // Opening hours logic
  function isOpenNow(): boolean {
    const today = new Date();
    const currentDay = today.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    const currentMinutes = today.getHours() * 60 + today.getMinutes();

    const todayHour = store.opening_hours?.find(
      (hour) => hour.day.toLowerCase() === currentDay
    );
    if (!todayHour || todayHour.is_closed) return false;

    const toMinutes = (timeStr: string) => {
      const [timePart, modifier] = timeStr.split(" ");
      let [hours, minutes] = timePart.split(":").map(Number);
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const open = toMinutes(todayHour.from_hour);
    const close = toMinutes(todayHour.to_hour);

    return currentMinutes >= open && currentMinutes <= close;
  }

  const storeIsOpen = isOpenNow();

  // Handle click event
  const handleClick = () => {
    if (!storeIsOpen) {
      alert(t("storeClosed", "This store is currently closed."));
      return;
    }
    router.push(`/storeMenuPage?store_id=${store.id}`);
  };

  if (!store) return null;

  return (
    <div
      className={`group h-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden cursor-pointer dark:bg-slate-900 dark:border-slate-800 brand-motion-lift ${!storeIsOpen ? "opacity-75" : ""}`}
      onClick={handleClick}
    >
      <div className="relative w-full h-44">
        {store.logo && !imageErrored ? (
          <Image
            src={store.logo}
            alt={store.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
            onError={() => setImageErrored(true)}
            style={{ transitionDuration: "var(--brand-motion-normal)" }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-200 via-blue-300 to-sky-500 flex items-center justify-center text-white text-3xl font-black">
            {store.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {store.category && (
            <span className="brand-chip text-[11px] px-2.5 py-1 bg-white/90 text-slate-800">
              {store.category.name}
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              storeIsOpen ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            }`}
          >
            {storeIsOpen ? t("open", "Open") : t("closed", "Closed")}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h2 className="text-base md:text-lg font-extrabold text-white truncate drop-shadow">{store.name}</h2>
        </div>
      </div>
      <div className="p-4">
        <div className="text-slate-600 dark:text-slate-300 text-sm leading-5 line-clamp-1 mb-3">
          {store.address}
        </div>
        <div className="flex flex-wrap gap-2 items-center mb-4">
          {distanceAndEta.distance !== null && (
            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium">
              {distanceAndEta.distance.toFixed(1)} km {t("away", "away")}
            </span>
          )}
          {distanceAndEta.timeAway !== null && (
            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium dark:bg-slate-800 dark:text-slate-300">
              {Math.round(distanceAndEta.timeAway)} min {t("away", "away")}
            </span>
          )}
        </div>
        <div className="mt-2 bg-gradient-to-r from-blue-600 to-sky-500 p-2.5 rounded-lg text-white text-center text-sm font-semibold shadow-sm transition-transform duration-200 group-hover:scale-[1.01]">
          {t("seeMenu", "See menu")}
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
