export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_customer: boolean;
  is_driver: boolean;
}

export interface WhyChooseUsRecord {
  id: number;
  title: string;
  content: string;
}

export interface TeamRecord {
  id: number;
  name: string;
  title: string;
  bio: string;
  image?: string | null;
  github?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
}

export interface ContactRecord {
  id: number;
  subject: string;
  email: string;
  phone: string;
  message: string;
  timestamp: string;
}

export interface AboutUsRecord {
  id: number;
  title: string;
  about: string;
  born_date?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logo?: string | null;
  backgroundImage?: string | null;
  backgroundApp?: string | null;
  bottomImage?: string | null;
  github?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
}

export interface MarketplaceCustomerRow {
  id: number;
  name: string;
  avatar: string | null;
  phone: string;
  address: string;
  total_orders: number;
}

export interface AuthMeResponse {
  id?: number;
  user_id?: number;
  username?: string;
  email?: string;
  role?: string;
  is_platform_admin?: boolean;
}

export type CmsWritePayload = Record<string, string | number | boolean | null | undefined>;

/** Strip read-only id for CMS edit forms. */
export function toCmsWritePayload<T extends { id?: number }>(record: T): CmsWritePayload {
  const { id: _id, ...rest } = record;
  return rest as CmsWritePayload;
}
