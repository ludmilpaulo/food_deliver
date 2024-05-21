"use client";
import React, { useEffect, useState } from "react";
import withAuth from "@/components/ProtectedPage";
import RestaurantCard from "./RestaurantCard"; // Adjust the import path if necessary
import { FiSearch } from "react-icons/fi";
import { Transition } from "@headlessui/react";
import { Restaurant } from "@/services/types";

type Restaurants = Restaurant[];

function HomeScreen() {
  const [restaurants, setRestaurants] = useState<Restaurants>([]);
  const [search, setSearch] = useState("");
  const [filteredDataSource, setFilteredDataSource] = useState<Restaurants>([]);
  const [masterDataSource, setMasterDataSource] = useState<Restaurants>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/customer/customer/restaurants/`)
      .then((response) => response.json())
      .then((data) => {
        const approvedRestaurants = data.restaurants.filter(
          (restaurant: Restaurant) => restaurant.is_approved
        );
        setMasterDataSource(approvedRestaurants);
        setFilteredDataSource(approvedRestaurants);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const searchFilterFunction = (text: string) => {
    if (text) {
      const newData = masterDataSource.filter((item) => {
        const itemData = item.name ? item.name.toUpperCase() : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      setFilteredDataSource(masterDataSource);
      setSearch(text);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="px-2 sm:px-4">
        
          <div className="pb-16 mx-8 my-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDataSource.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </div>
      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-gray-900 bg-opacity-50">
          <div className="w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Transition>
    </div>
  );
}

export default withAuth(HomeScreen);
