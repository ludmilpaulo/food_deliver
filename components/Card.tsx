import React, { useEffect, useState } from 'react';
import Image from 'next/image';
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

    useEffect(() => {
      fetch('https://www.sunshinedeliver.com/api/customer/restaurants/')
        .then((response) => response.json())
        .then((data) => setRestaurants(data.restaurants));
    }, []);


  return (
    <div className="p-4 flex flex-wrap justify-around">
      {restaurants.map((restaurant: Restaurant) => (
        <div key={restaurant.id} className="m-4 bg-white bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg flex flex-col items-center p-4">
          <Image
          className="h-32 w-32 rounded-full mb-4"
          width={300}
          height={300} 
          src={restaurant.logo} 
          alt={restaurant.name}/>
          <div className="text-xl font-medium text-black">{restaurant.name}</div>
          <p className="text-gray-500">{restaurant.address}</p>
          <p className="text-gray-500">{restaurant.phone}</p>
        </div>
      ))}
    </div>
  );
}
