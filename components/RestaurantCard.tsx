import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type RestaurantCardProps = {
  restaurantData: Restaurants;
};

type Restaurant = {
  id: number;
  name: string;
  phone: string;
  address: string;
  logo: string;
};

type Restaurants = Restaurant[];

export default function RestaurantCard({
  restaurantData,
}: RestaurantCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 py-4 px-4 mb-12">
      <div
          className="absolute top-0
          left-0
          w-full
          h-96
          bg-gradient-to-br
          from-[#FCB61A]
          to-[#0171CE]
          rounded-md
          filter
          blur-3xl
          opacity-50
          -z-20"
        />
      {restaurantData.map((restaurant: Restaurant) => (
        <div
          key={restaurant.id}
          className="relative flex flex-col p-4 bg-white shadow-lg bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-xl"
        >
          <div className="absolute top-0 left-0 p-2 bg-blue-500 text-white uppercase font-bold text-xs rounded-br-lg">
            {isOpen ? "Aberto" : "Fechado"}
          </div>
          <Image
            className="w-32 h-32 mb-4 rounded-full self-center"
            width={300}
            height={300}
            src={restaurant.logo}
            alt={restaurant.name}
          />
          <div className="flex flex-col items-center flex-grow">
            <div className="text-xl font-medium text-black">
              {restaurant.name}
            </div>
            <p className="text-gray-500">{restaurant.address}</p>
          </div>
          <Link
            href={{
              pathname: "/RestaurantMenu",
              query: {
                restaurantName: restaurant.name,
                restaurantId: restaurant.id,
                phone: restaurant.phone,
                image_url: restaurant.logo,
                address: restaurant.address,
              },
            }}
          >
            <button className="mt-auto w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Ver Menu do {restaurant.name}
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
}
