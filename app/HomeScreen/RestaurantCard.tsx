"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type OpeningHour = {
  day: string;
  from_hour: string;
  to_hour: string;
  is_closed: boolean;
};

type Category = {
  id: number;
  name: string;
  image: string | null;
};

type RestaurantProps = {
  restaurant: {
    id: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    category?: Category;
    barnner: boolean;
    is_approved: boolean;
    location: string; // Assumes location is a string with "latitude,longitude"
    opening_hours: OpeningHour[];
  };
};

const RestaurantCard: React.FC<RestaurantProps> = ({ restaurant }) => {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [timeAway, setTimeAway] = useState<number | null>(null);

  useEffect(() => {
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
    if (userLocation && restaurant.location) {
      const [restaurantLat, restaurantLng] = restaurant.location.split(",").map(Number);

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        restaurantLat,
        restaurantLng
      );
      setDistance(distance);

      const walkingSpeedKmh = 5; // Average walking speed in km/h
      const timeInMinutes = (distance / walkingSpeedKmh) * 60;
      setTimeAway(timeInMinutes);
    }
  }, [userLocation, restaurant.location]);

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

  if (!restaurant) {
    return null; // Render nothing if the restaurant is undefined
  }

  const isOpen = () => {
    const today = new Date();
    const currentDay = today.toLocaleString("pt-BR", { weekday: "long" }).toLowerCase();
    const currentTime = today.getHours() * 60 + today.getMinutes();

    const openingHour = restaurant.opening_hours.find(
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

  const handleClick = () => {
    if (!isOpen()) {
      alert(`O restaurante ${restaurant.name} está fechado de momento, tente mais tarde`);
    } else {
      router.push(`/RestaurantMenuPage?restaurant_id=${restaurant.id}`);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
        !isOpen() ? "opacity-50" : ""
      }`}
      onClick={handleClick}
    >
      {restaurant.logo && (
        <Image
          src={restaurant.logo}
          alt={restaurant.name}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-2xl font-semibold text-gray-800">{restaurant.name}</h2>
        
        {restaurant.category && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 mt-2 rounded-full">
            {restaurant.category.name}
          </span>
        )}
        {restaurant.barnner && (
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

export default RestaurantCard;
