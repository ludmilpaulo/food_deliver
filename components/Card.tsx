import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";


//import { Restaurant } from '@/interfaces';

type Restaurant = {
  id: number;
  name: string;
  phone: string;
  address: string;
  logo: string;
};

type Restaurants = Restaurant[];

export default function Card() {
  const [restaurants, setRestaurants] = useState<Restaurants>([]);
  
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      x: [0, -10, 0],
      transition: { repeat: Infinity, duration: 2 },
    });
  }, [controls]);


  useEffect(() => {
    fetch("https://www.sunshinedeliver.com/api/customer/restaurants/")
      .then((response) => response.json())
      .then((data) => setRestaurants(data.restaurants));
  }, []);

  return (

<div className="p-4 flex flex-row overflow-x-auto scroll-snap-x-mandatory">
      {restaurants.map((restaurant: Restaurant) => (
        <div key={restaurant.id} className="flex-shrink-0 flex-none scroll-snap-start">
          <div className="flex flex-col items-center p-4 m-4 bg-white shadow-lg bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-xl">
            <Image
              className="w-32 h-32 mb-4 rounded-full sm:w-32 sm:h-32 md:w-32 md:h-32 lg:w-64 lg:h-32 xl:w-32 xl:h-32"
              width={300}
              height={300}
              src={restaurant.logo}
              alt={restaurant.name}
            />
            <div className="text-xl font-medium text-black">
              {restaurant.name}
            </div>
            <p className="text-gray-500">{restaurant.address}</p>
            <p className="text-gray-500">{restaurant.phone}</p>
          </div>
        </div>
      ))}
    </div>

   
  );
}
