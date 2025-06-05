import axios from 'axios';
import { product, storeType } from './types';

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




 

  export const getproducts = async (): Promise<product[]> => {
    try {
      const response = await axios.get<{ products: product[] }>(`${baseAPI}/store/api/products/`);
      const products = response.data.products.map(product => ({
        ...product,
        original_price: Number(product.original_price),
        price_with_markup: Number(product.price_with_markup),
      }));
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  };