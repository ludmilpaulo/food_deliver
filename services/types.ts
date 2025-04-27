// src/services/types.ts
//export const baseAPI: string = process.env.NEXT_PUBLIC_BASE_API || 'https://www.kudya.shop';



export const baseAPI = "http://127.0.0.1:8000";

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
    driver: {
      name: string;
    };
    total: number;
    status: string;
  }
  

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
  
 // @/services/types.ts

export type OpeningHour = {
    day: string;
    from_hour: string;
    to_hour: string;
    is_closed: boolean;
  };
  
  export type Category = {
    id: number;
    name: string;
    image: string | null;
  };
  
  export type Restaurant = {
    id: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    category?: Category;
    barnner: boolean;
    is_approved: boolean;
    location: string;
    opening_hours: OpeningHour[];
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
  
  
  


  export type CategoryType = {
    id: number;
    name: string;
    image: string | null;
  };
  
  export type RestaurantType = {
    id: number;
    name: string;
    phone: string;
    address: string;
    logo: string;
    category?: CategoryType;
    barnner: boolean;
    is_approved: boolean;
    opening_hours: OpeningHourType[];
    location: string; // Add location field
  };


  export interface AboutUsData {
    id: number;
    title: string;
    logo: string;
    back: string;
    backgroundApp: string;
    backgroundImage: string;
    bottomImage: string;
    about: string;
    born_date: string;
    address: string;
    phone: string;
    email: string;
    whatsapp: string;
    linkedin: string | null;
    facebook: string;
    twitter: string;
    instagram: string;
  }


  // types.ts
export interface Career {
  id: number;
  title: string;
  description: string;
}

export interface JobApplication {
  career: number;
  full_name: string;
  email: string;
  resume: File | null;
}


export interface Meal {
  name: string;
  short_description: string;
  image: string;
  original_price: number;
  price_with_markup: number;
  restaurant_name: string;
}
