import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";

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
  const [isHovered, setIsHovered] = useState(false);

  const controls = useAnimation();

  useEffect(() => {
    if (!isHovered) {
      controls.start({
        x: ["100vw", "-100vw"],
        transition: { repeat: Infinity, duration: 10 },
      });
    } else {
      controls.stop();
    }
  }, [isHovered, controls]);


  useEffect(() => {
    fetch("https://www.sunshinedeliver.com/api/customer/restaurants/")
      .then((response) => response.json())
      .then((data) => setRestaurants(data.restaurants));
  }, []);

  return (
    <div className="p-4 flex flex-row overflow-x-auto scroll-snap-x-mandatory">
      <motion.div 
        animate={controls} 
        className="flex flex-row overflow-x-auto scroll-snap-x-mandatory" 
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}
      >
        {restaurants.map((restaurant: Restaurant) => (
           // eslint-disable-next-line react/jsx-key
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
             
            </div>
          </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
