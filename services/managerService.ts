import axios from 'axios';
import { baseAPI, Product, Store as StoreType } from './types';



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

export const updatestore = async (id: number, data: Partial<StoreType>) => {
  const response = await axios.put(`${baseAPI}/store/api/stores/${id}/`, data);
  return response.data;
};

export const deletestore = async (id: number) => {
  const response = await axios.delete(`${baseAPI}/store/api/stores/${id}/`);
  return response.data;
};




 

  export const getproducts = async (): Promise<Product[]> => {
    try {
      const response = await axios.get<{ products: Product[] }>(`${baseAPI}/store/api/products/`);
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