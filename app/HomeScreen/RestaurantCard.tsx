import React from 'react';
import Image from 'next/image';

type RestaurantProps = {
  restaurant: {
    id: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    category: {
      id: number;
      name: string;
      image: string;
    };
    barnner: boolean;
    is_approved: boolean;
  };
};

const RestaurantCard: React.FC<RestaurantProps> = ({ restaurant }) => {
  if (!restaurant) {
    return null; // Render nothing if the restaurant is undefined
  }

  return (
    <div className="w-full p-4 md:w-1/2 lg:w-1/3">
      <div className="flex flex-col items-center bg-white rounded-lg shadow-md overflow-hidden">
        {restaurant.logo && (
          <Image
            src={restaurant.logo}
            alt={restaurant.name}
            width={400}
            height={300}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4 w-full">
          <h2 className="text-lg font-semibold text-gray-800">{restaurant.name}</h2>
          <p className="text-gray-600">{restaurant.address}</p>
          <p className="text-gray-600">{restaurant.phone}</p>
          {restaurant.category && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 mt-2 rounded-full">
              {restaurant.category.name}
            </span>
          )}
          {restaurant.barnner && (
            <div className="mt-4 bg-gradient-to-r from-yellow-400 to-blue-600 p-2 rounded text-white text-center">
              Promotional
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
