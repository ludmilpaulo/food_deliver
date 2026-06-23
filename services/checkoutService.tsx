import { baseAPI } from './types';
import axios from 'axios';
import { readAuthToken } from '@/lib/authToken';
import {
  completeCheckout,
  completeMultipleCheckout,
  fetchStoreForCheckout,
  validateCouponV1,
} from '@/features/marketplace/api/checkoutApi';

export { fetchStoreForCheckout, completeCheckout, completeMultipleCheckout, validateCouponV1 };

export const fetchUserDetails = async (userId: number, token: string) => {
  const response = await fetch(`${baseAPI}/customer/customer/profile/?user_id=${userId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const resJson = await response.json();
    return resJson.customer_details;
  }
  throw new Error('Failed to fetch user details');
};

export const fetchstoreDetails = async (storeId: string | number) => {
  return fetchStoreForCheckout(Number(storeId));
};

export const completeOrderRequest = async (orderData: Record<string, unknown>) => {
  const token = (orderData.access_token as string) || readAuthToken() || '';
  return completeCheckout({
    ...(orderData as object),
    access_token: token,
  } as Parameters<typeof completeCheckout>[0]);
};

export const validateCouponRequest = async (couponCode: string, subtotal = 0) => {
  return validateCouponV1(couponCode, subtotal);
};

export const checkUserCoupon = async (token: string) => {
  const response = await axios.post(`${baseAPI}/order/coupons/check/`, { access_token: token });
  return response.data;
};
