import axios from 'axios';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useEarnings = (type: string, id: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/${type}/${id}/earnings`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]);

  return { data, loading, error };
};


export const getRestaurantEarnings = async (restaurantId: string) => {
  const response = await axios.get(`${API_URL}/restaurants/${restaurantId}/earnings`);
  return response.data;
};

export const getPartnerEarnings = async (partnerId: string) => {
  const response = await axios.get(`${API_URL}/partners/${partnerId}/earnings`);
  return response.data;
};

export const getDriverEarnings = async (driverId: string) => {
  const response = await axios.get(`${API_URL}/drivers/${driverId}/earnings`);
  return response.data;
};
