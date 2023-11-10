import { ReactNode } from "react";

export const googleAPi = "AIzaSyDn1X_BlFj-57ydasP6uZK_X_WTERNJb78";

export const basAPI = "https://www.sunshinedeliver.com/";

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
