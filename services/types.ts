
//export const baseAPI: string = process.env.NEXT_PUBLIC_BASE_API || 'https://www.kudya.shop';

//export const baseAPI: string = "http://127.0.0.1:8000";

export const baseAPI: string = "https://kudya.pythonanywhere.com";
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
      product: {
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
  
export interface ProductImage {
  id: number;
  image: string;
}
export interface ProductCategory {
  id: number;
  name: string;
  icon: string;
}
export interface Product {
  id: number;
  store_id: number;
  name: string;
  category: string | ProductCategory;
  description?: string;
  price: number;
  stock: number;
  on_sale: boolean;
  bulk_sale: boolean;
  discount_percentage: number;
  season?: string;
  images: string[];
  image_url: string[]; // matches Django @property
  gender?: string;
  colors?: string[];
  sizes?: string[];
  store: number;
  price_with_markup: number;
  original_price: number; // if you send this
  store_name?: string;    // if you send this
}

  
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
    store: number;
    day: number;
    from_hour: string;
    to_hour: string;
    is_closed: boolean;
  }
  
  export interface StoreType {
  id: number;
  name: string;
  description?: string;
  icon?: string;
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

export interface StoreCategory {
  id: number;
  name: string;
  image: string | null;
  slug: string;
}

export interface StoreOpeningHour {
  id: number;
  day: string; // e.g., "monday"
  from_hour: string; // "09:00 AM"
  to_hour: string;   // "05:00 PM"
  is_closed: boolean;
}


export interface Store {
  id: number;
  name: string;
  phone: string;
  address: string;
  logo: string | null;
  images?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  bank?: string;
  account_number?: string;
  iban?: string;
  location?: string;
  license?: string | null;
  banner?: boolean;
  barnner: boolean;
  is_approved?: boolean;
  store_type?: number | null;
  distance?: number | null;
  category: StoreCategory | null;
  opening_hours: StoreOpeningHour[]; 
   // Calculated client-side
}


export interface CartItem {
  id: number;            // productId
  name: string;
  price: number;
  image?: string;
  size: string;
  color: string;
  quantity: number;
  store: number;  
     // storeId
}