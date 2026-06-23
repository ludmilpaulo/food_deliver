import { Product, Store as StoreType } from './types';
import {
  activateAdminStore,
  deactivateAdminStore,
  deleteAdminStore,
  fetchAdminProducts,
  fetchAdminStores,
  updateAdminStore,
} from '@/features/admin/api/adminMarketplaceApi';

export const getstores = async (): Promise<StoreType[]> => fetchAdminStores();

export const activatestore = async (id: number) => activateAdminStore(id);

export const deactivatestore = async (id: number) => deactivateAdminStore(id);

export const updatestore = async (id: number, data: Partial<StoreType>) => updateAdminStore(id, data);

export const deletestore = async (id: number) => deleteAdminStore(id);

export const getproducts = async (): Promise<Product[]> => {
  try {
    return await fetchAdminProducts();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
