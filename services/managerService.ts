import axios from 'axios';
import { Meal, RestaurantType } from './types';

const baseAPI = process.env.NEXT_PUBLIC_BASE_API || 'https://www.kudya.shop';

export const getRestaurants = async () => {
  const response = await axios.get(`${baseAPI}/restaurant/api/restaurants/`);
  return response.data;
};

export const activateRestaurant = async (id: number) => {
  const response = await axios.post(`${baseAPI}/restaurant/api/restaurants/${id}/activate/`);
  return response.data;
};

export const deactivateRestaurant = async (id: number) => {
  const response = await axios.post(`${baseAPI}/restaurant/api/restaurants/${id}/deactivate/`);
  return response.data;
};

export const updateRestaurant = async (id: number, data: Partial<RestaurantType>) => {
  const response = await axios.put(`${baseAPI}/restaurant/api/restaurants/${id}/`, data);
  return response.data;
};

export const deleteRestaurant = async (id: number) => {
  const response = await axios.delete(`${baseAPI}/restaurant/api/restaurants/${id}/`);
  return response.data;
};




export const getMeals = async (): Promise<Meal[]> => {
    try {
      const response = await axios.get<{ meals: Meal[] }>(`${baseAPI}/restaurant/api/meals/`);
      return response.data.meals;
    } catch (error) {
      console.error('Error fetching meals:', error);
      throw error;
    }
  };