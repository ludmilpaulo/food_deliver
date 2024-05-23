import { baseAPI } from "./types";

// src/services/apiService.ts
export const fetchUserDetails = async (userId: number, token: string) => {
    const response = await fetch(`${baseAPI}api/customer/profile/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId }),
    });
  
    if (response.ok) {
      const resJson = await response.json();
      return resJson.customer_details;
    } else {
      throw new Error("Failed to fetch user details");
    }
  };
  
  export const fetchRestaurantDetails = async (restaurantId: string) => {
    const response = await fetch(`${baseAPI}/customer/customer/restaurants/${restaurantId}/`);
    if (response.ok) {
      const resJson = await response.json();
      return resJson.restaurant;
    } else {
      throw new Error("Failed to fetch restaurant details");
    }
  };
  
  export const completeOrderRequest = async (orderData: any) => {
    const response = await fetch(`${baseAPI}api/customer/order/add/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });
  
    const responseData = await response.json();
    return responseData;
  };
  