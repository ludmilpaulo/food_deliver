"use client";
import { useEffect, useState } from 'react';
import { fetchAboutUsData } from '@/services/information';
import { AboutUsData, baseAPI, Restaurant } from '@/services/types';
import Banner from './Banner';

const HomePage = () => {
  const [headerData, setHeaderData] = useState<AboutUsData | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${baseAPI}/customer/customer/restaurants/`)
      .then((response) => response.json())
      .then((data) => {
        const approvedRestaurants = data.restaurants.filter(
          (restaurant: Restaurant) => restaurant.is_approved
        );
        setRestaurants(approvedRestaurants);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const header = await fetchAboutUsData();
      setHeaderData(header);
    };
    fetchData();
  }, []);

  if (!headerData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <Banner
        title={headerData.title}
        backgroundImage={headerData.backgroundImage}
        backgroundApp={headerData.backgroundApp}
        restaurants={restaurants}
      />
    </div>
  );
};

export default HomePage;
