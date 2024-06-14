"use client";
import React, { useEffect, useState } from "react";
import withAuth from "@/components/ProtectedPage";
import RestaurantCard from "./RestaurantCard"; // Adjust the import path if necessary
import { useRouter } from "next/navigation";
import { Transition } from "@headlessui/react";
import { baseAPI, Restaurant, Category } from "@/services/types";
import Image from "next/image";

type Restaurants = Restaurant[];

function HomeScreen() {
  const [restaurants, setRestaurants] = useState<Restaurants>([]);
  const [filteredDataSource, setFilteredDataSource] = useState<Restaurants>([]);
  const [masterDataSource, setMasterDataSource] = useState<Restaurants>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${baseAPI}/customer/customer/restaurants/`)
      .then((response) => response.json())
      .then((data) => {
        const approvedRestaurants = data.restaurants.filter(
          (restaurant: Restaurant) => restaurant.is_approved
        );
        setMasterDataSource(approvedRestaurants);
        setFilteredDataSource(approvedRestaurants);
        setLoading(false);

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
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const filterByCategory = (category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      const filteredData = masterDataSource.filter(
        (restaurant) => restaurant.category?.name === category
      );
      setFilteredDataSource(filteredData);
    } else {
      setFilteredDataSource(masterDataSource);
    }
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
      <div className="flex-grow px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Transition
              show={loading}
              enter="transition-opacity duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="flex items-center justify-center space-x-2 animate-pulse">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
              </div>
            </Transition>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDataSource.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(HomeScreen);
