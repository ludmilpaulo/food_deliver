import axios from 'axios';
import { Meal, storeType } from './types';

const baseAPI = process.env.NEXT_PUBLIC_BASE_API || 'https://www.kudya.shop';

export const getstores = async () => {
  const response = await axios.get(`${baseAPI}/store/api/stores/`);
  return response.data;
};

export const activatestore = async (id: number) => {
  const response = await axios.post(`${baseAPI}/store/api/stores/${id}/activate/`);
  return response.data;
};

export const deactivatestore = async (id: number) => {
  const response = await axios.post(`${baseAPI}/store/api/stores/${id}/deactivate/`);
  return response.data;
};

export const updatestore = async (id: number, data: Partial<storeType>) => {
  const response = await axios.put(`${baseAPI}/store/api/stores/${id}/`, data);
  return response.data;
};

export const deletestore = async (id: number) => {
  const response = await axios.delete(`${baseAPI}/store/api/stores/${id}/`);
  return response.data;
};




 

  export const getMeals = async (): Promise<Meal[]> => {
    try {
      const response = await axios.get<{ meals: Meal[] }>(`${baseAPI}/store/api/meals/`);
      const meals = response.data.meals.map(meal => ({
        ...meal,
        original_price: Number(meal.original_price),
        price_with_markup: Number(meal.price_with_markup),
      }));
      return meals;
    } catch (error) {
      console.error('Error fetching meals:', error);
      throw error;
    }
  };