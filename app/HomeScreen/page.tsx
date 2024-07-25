"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import withAuth from "@/components/ProtectedPage";
import RestaurantCard from "./RestaurantCard"; // Adjust the import path if necessary
import { useRouter } from "next/navigation";
import { baseAPI, Restaurant, Category } from "@/services/types";
import Image from "next/image";

type Restaurants = Restaurant[];

function HomeScreen() {
  const [restaurants, setRestaurants] = useState<Restaurants>([]);
  const [filteredDataSource, setFilteredDataSource] = useState<Restaurants>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurants>([]);
  const [masterDataSource, setMasterDataSource] = useState<Restaurants>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${baseAPI}/customer/customer/restaurants/`);
      const data = await response.json();
      const approvedRestaurants = data.restaurants.filter(
        (restaurant: Restaurant) => restaurant.is_approved
      );
      setMasterDataSource(approvedRestaurants);
      setLoading(false);

      // Extract unique categories from the restaurants
      const uniqueCategories = Array.from(
        new Set(
          approvedRestaurants.map((restaurant: Restaurant) => restaurant.category?.name)
        )
      ).map((category) => {
        const matchedRestaurant = approvedRestaurants.find(
          (restaurant: Restaurant) => restaurant.category?.name === category
        );
        return {
          name: category as string,
          id: matchedRestaurant?.category?.id as number,
          image: matchedRestaurant?.category?.image || null,
        };
      });

      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set interval to fetch data every 30 seconds
    const intervalId = setInterval(fetchData, 3000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchData]);

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

  const filterNearbyRestaurants = useCallback(
    (restaurants: Restaurant[], userLat: number, userLng: number, radius: number) => {
      return restaurants.filter((restaurant) => {
        const [restaurantLat, restaurantLng] = restaurant.location.split(",").map(Number);
        const distance = getDistance(userLat, userLng, restaurantLat, restaurantLng);
        return distance <= radius;
      });
    },
    []
  );

  useEffect(() => {
    if (userLocation) {
      const nearby = filterNearbyRestaurants(masterDataSource, userLocation.latitude, userLocation.longitude, 5);
      const withinArea = filterNearbyRestaurants(masterDataSource, userLocation.latitude, userLocation.longitude, 3.47);
      setNearbyRestaurants(nearby);
      setFilteredDataSource(withinArea);
    }
  }, [userLocation, masterDataSource, filterNearbyRestaurants]);

  // Filter restaurants by category
  const filterByCategory = useCallback((category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      const filteredData = masterDataSource.filter(
        (restaurant) => restaurant.category?.name === category
      );
      setFilteredDataSource(filteredData);
    } else {
      setFilteredDataSource(masterDataSource);
    }
  }, [masterDataSource]);

  // Calculate distance between two coordinates
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex justify-center mb-4 overflow-x-auto whitespace-nowrap category-container">
        {categories.map((category) => (
          <div
            key={category.id}
            className="inline-block p-4 text-center cursor-pointer"
            onClick={() => filterByCategory(category.name)}
            style={{ transition: "transform 0.3s ease-in-out" }}
          >
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-md hover:shadow-lg transform hover:scale-110 transition-transform duration-300">
              {category.image && (
                <Image
                  src={category.image}
                  alt={category.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="mt-2 text-gray-700">{category.name}</div>
          </div>
        ))}
      </div>
      <div className="px-4 py-6">
        <h2 className="text-2xl font-semibold mb-4">Ofertas de Hoje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDataSource
            .filter((restaurant) => restaurant.barnner)
            .map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Restaurantes Próximos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userLocation &&
            nearbyRestaurants.map(
              (restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              )
            )}
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Todos os Restaurantes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDataSource.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(HomeScreen);
