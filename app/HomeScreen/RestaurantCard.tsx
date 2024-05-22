import React from 'react';
import Image from 'next/image';

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
    category?: Category; // Mark category as optional
    barnner: boolean;
    is_approved: boolean;
    opening_hours: OpeningHour[];
  };
};

const RestaurantCard: React.FC<RestaurantProps> = ({ restaurant }) => {
  if (!restaurant) {
    return null; // Render nothing if the restaurant is undefined
  }

  const isOpen = () => {
    const today = new Date();
    const currentDay = today.toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase();
    const currentTime = today.getHours() * 60 + today.getMinutes();

    console.log("Today:", today);
    console.log("Current Day:", currentDay);
    console.log("Current Time (in minutes):", currentTime);

    const openingHour = restaurant.opening_hours.find(
      (hour) => hour.day.toLowerCase() === currentDay
    );

    console.log("Opening Hour for Today:", openingHour);

    if (!openingHour || openingHour.is_closed) {
      console.log("Restaurant is closed today or no opening hours found.");
      return false;
    }

    const parseTime = (time: string) => {
      const [timePart, modifier] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);

      if (modifier === 'PM' && hours !== 12) {
        hours += 12;
      } else if (modifier === 'AM' && hours === 12) {
        hours = 0;
      }

      return hours * 60 + minutes;
    };

    const openingTime = parseTime(openingHour.from_hour);
    const closingTime = parseTime(openingHour.to_hour) - 20; // 20 minutes before closing

    console.log("Opening Time (in minutes):", openingTime);
    console.log("Adjusted Closing Time (in minutes, 20 minutes earlier):", closingTime);

    const isCurrentlyOpen = currentTime >= openingTime && currentTime <= closingTime;
    console.log("Is Restaurant Currently Open:", isCurrentlyOpen);

    return isCurrentlyOpen;
  };

  const handleClick = () => {
    if (!isOpen()) {
      alert(`O restaurante ${restaurant.name} está fechado de momento, tente mais tarde`);
    } else {
      // Handle restaurant click when it's open
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${!isOpen() ? 'opacity-50' : ''}`}
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
        <p className="text-gray-600">{restaurant.address}</p>
        <p className="text-gray-600">{restaurant.phone}</p>
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
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${isOpen() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isOpen() ? 'Aberto' : 'Fechado'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
