export const baseAPI = "http://127.0.0.1:8000" 
import { ReactNode } from "react";

export type UserDetails = {
    // customer_detais: string;
    address: string;
    avatar: string;
    id: number;
    phone: number;
  };
  
  export type FornecedorType = {
    id: number;
    user: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    licenca: string;
    aprovado: boolean;
    criado_em: string;
    modificado_em: string;
    children: ReactNode;
  };
  
  
  export interface OrderTypes {
    id: number;
    order_details: {
      id: number;
      meal: {
        name: string;
        price: number;
      };
      quantity: number;
      sub_total: number;
    }[];
    customer: {
      name: string;
    };
    driver: string | null;
    total: number;
    status: string;
  }
  
  export type Restaurant = {
    id: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    category?: {
      name: string;
      image: string;
    };
    is_approved: boolean;
    barnner: boolean;
  };

  export type Product = {
    user_id?: number;
    id?: number;
    name: string;
    short_description: string;
    image: string;
    price: string;
    category: string | number;
    // Add other fields if necessary...
  };
  
  export type Categoria = {
    id: number;
    name: string;
    slug: string;
  };


  export interface OpeningHourType {
    id?: number;
    restaurant: number;
    day: number;
    from_hour: string;
    to_hour: string;
    is_closed: boolean;
  }
  
  export interface RestaurantType {
    id: number;
    user: number;
    category: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    restaurant_license: string;
    barnner: boolean;
    is_approved: boolean;
    opening_hours: OpeningHourType[];
  }
  