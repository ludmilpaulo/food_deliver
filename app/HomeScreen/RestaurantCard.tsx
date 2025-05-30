"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { store } from "@/services/types";

type storeProps = {
  store: store;
};

const storeCard: React.FC<storeProps> = ({ store }) => {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [timeAway, setTimeAway] = useState<number | null>(null);

  useEffect(() => {
    // Get user's current location
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching user location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Calculate distance and time away if user location and store location are available
    if (userLocation && store.location) {
      const [storeLat, storeLng] = store.location.split(",").map(Number);

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        storeLat,
        storeLng
      );
      setDistance(distance);

      const walkingSpeedKmh = 5; // Average walking speed in km/h
      const timeInMinutes = (distance / walkingSpeedKmh) * 60;
      setTimeAway(timeInMinutes);
    }
  }, [userLocation, store.location]);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  if (!store) {
    return null; // Render nothing if the store is undefined
  }

  // Check if the store is currently open
  const isOpen = () => {
    const today = new Date();
    const currentDay = today.toLocaleString("pt-BR", { weekday: "long" }).toLowerCase();
    const currentTime = today.getHours() * 60 + today.getMinutes();

    const openingHour = store.opening_hours.find(
      (hour) => hour.day.toLowerCase() === currentDay
    );

    if (!openingHour || openingHour.is_closed) {
      return false;
    }

    const parseTime = (time: string) => {
      const [timePart, modifier] = time.split(" ");
      let [hours, minutes] = timePart.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) {
        hours += 12;
      } else if (modifier === "AM" && hours === 12) {
        hours = 0;
      }

      return hours * 60 + minutes;
    };

    const openingTime = parseTime(openingHour.from_hour);
    const closingTime = parseTime(openingHour.to_hour) - 20; // 20 minutes before closing

    return currentTime >= openingTime && currentTime <= closingTime;
  };

  // Handle click event on the store card
  const handleClick = () => {
    if (!isOpen()) {
      alert(`O storee ${store.name} está fechado de momento, tente mais tarde`);
    } else {
      router.push(`/storeMenuPage?store_id=${store.id}`);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
        !isOpen() ? "opacity-50" : ""
      }`}
      onClick={handleClick}
    >
      {store.logo && (
        <Image
          src={store.logo}
          alt={store.name}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-2xl font-semibold text-gray-800">{store.name}</h2>
        
        {store.category && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 mt-2 rounded-full">
            {store.category.name}
          </span>
        )}
        {store.barnner && (
          <div className="mt-4 bg-gradient-to-r from-yellow-400 to-blue-600 p-2 rounded text-white text-center">
            Ver o Menu
          </div>
        )}
        <div className="mt-2">
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
              isOpen() ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {isOpen() ? "Aberto" : "Fechado"}
          </span>
          {timeAway && (
            <div className="mt-2 text-sm text-gray-600">
              Você está a aproximadamente {Math.round(timeAway)} minutos de distância
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default storeCard;
