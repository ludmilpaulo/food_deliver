import React, { useEffect, useState } from "react";
import Image from "next/image";

//import { Restaurant } from '@/interfaces';

type Restaurant = {
  id: number;
  name: string;
  phone: string;
  address: string;
  logo: string;
};

type Restaurants = Restaurant[];

export default function RestaurantCard() {
  const [restaurants, setRestaurants] = useState<Restaurants>([]);
  const [isOpen, setIsOpen] = useState(true);
 

  useEffect(() => {
    fetch("https://www.sunshinedeliver.com/api/customer/restaurants/")
      .then((response) => response.json())
      .then((data) => setRestaurants(data.restaurants));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
    {restaurants.map((restaurant: Restaurant) => (
      <div
        key={restaurant.id}
        className="relative flex flex-col p-4 bg-white shadow-lg bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-xl"
      >
        <div className="absolute top-0 left-0 p-2 bg-blue-500 text-white uppercase font-bold text-xs rounded-br-lg">
          {isOpen ? 'Aberto' : 'Fechado'}
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
          <p className="text-gray-500">{restaurant.phone}</p>
        </div>
        <button className="mt-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Ver Menu do {restaurant.name}
        </button>
      </div>
    ))}
  </div>
  

  );
}