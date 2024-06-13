"use client";
import { useEffect, useState } from 'react';
import { fetchAboutUsData } from '@/services/information';
import { AboutUsData, baseAPI, Restaurant } from '@/services/types';
import Banner from './Banner';
import { Transition } from '@headlessui/react';

const HomePage = () => {
  const [headerData, setHeaderData] = useState<AboutUsData | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [header, restaurantResponse] = await Promise.all([
          fetchAboutUsData(),
          fetch(`${baseAPI}/customer/customer/restaurants/`)
            .then((response) => response.json())
        ]);

        const approvedRestaurants = restaurantResponse.restaurants.filter(
          (restaurant: Restaurant) => restaurant.is_approved
        );

        setHeaderData(header);
        setRestaurants(approvedRestaurants);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Transition>
      {!loading && headerData && (
        <Banner
          title={headerData.title}
          backgroundImage={headerData.backgroundImage}
          backgroundApp={headerData.backgroundApp}
          bottomImage={headerData.bottomImage}
          restaurants={restaurants}
        />
      )}
    </div>
  );
};

export default HomePage;