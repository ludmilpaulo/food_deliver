"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Store } from "@/services/types";
import { t } from "@/configs/i18n";

interface StoreCardProps {
  store: Store;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [timeAway, setTimeAway] = useState<number | null>(null);

  // Get user's geolocation once
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
        () => setUserLocation(null)
      );
    }
  }, []);

  // Compute distance and walking time
  useEffect(() => {
    if (userLocation && store.location) {
      const [storeLat, storeLng] = store.location.split(",").map(Number);
      const dist = getDistance(userLocation.latitude, userLocation.longitude, storeLat, storeLng);
      setDistance(dist);
      const walkingSpeedKmh = 5;
      setTimeAway((dist / walkingSpeedKmh) * 60);
    }
  }, [userLocation, store.location]);

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

  // Handle click event
  const handleClick = () => {
    if (!isOpenNow()) {
      alert(t("storeClosed"));
      return;
    }
    router.push(`/storeMenuPage?store_id=${store.id}`);
  };

  if (!store) return null;

  return (
    <div
      className={`bg-white rounded-2xl shadow-md overflow-hidden transition-shadow hover:shadow-xl cursor-pointer ${!isOpenNow() ? "opacity-50" : ""}`}
      onClick={handleClick}
    >
      <div className="relative w-full h-44">
        {store.logo && (
          <Image
            src={store.logo}
            alt={store.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
        )}
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold truncate">{store.name}</h2>
        {store.category && (
          <span className="inline-block mt-1 mb-2 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
            {store.category.name}
          </span>
        )}
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              isOpenNow()
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isOpenNow() ? t("open") : t("closed")}
          </span>
          {distance !== null && (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
              {distance.toFixed(1)} km {t("away")}
            </span>
          )}
          {timeAway !== null && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
              {Math.round(timeAway)} min {t("away")}
            </span>
          )}
        </div>
        <div className="text-gray-500 text-sm truncate">{store.address}</div>
        {store.banner && (
          <div className="mt-4 bg-gradient-to-r from-yellow-400 to-blue-600 p-2 rounded text-white text-center font-bold shadow-md">
            {t("seeMenu")}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreCard;
