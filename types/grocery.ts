export type GroceryNavItem = {
  label: string;
  slug: string;
  kind: 'home' | 'category' | 'deals' | 'all';
};

export type GroceryCategory = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  image: string | null;
  sort_order: number;
};

export type GroceryProductCategory = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
};

export type GroceryProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  sale_price: number;
  unit: string;
  brand: string;
  stock: number;
  on_sale: boolean;
  discount_percentage: number;
  featured: boolean;
  selling_unit: string;
  selling_unit_label: string;
  weight: string | number | null;
  weight_unit: string;
  stock_status: string;
  allows_fractional: boolean;
  image: string | null;
  images: string[];
  category: GroceryProductCategory | null;
  is_favorited: boolean;
  store: number;
  store_name: string;
};

export type GroceryBanner = {
  id: number;
  kind: 'hero' | 'promo';
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_slug: string;
  badge_lines: string[];
  image: string | null;
  sort_order: number;
};

export type GroceryBenefit = {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  sort_order: number;
};

export type GroceryHome = {
  nav: GroceryNavItem[];
  popular_filters: GroceryNavItem[];
  hero: GroceryBanner[];
  benefits: GroceryBenefit[];
  promotions: GroceryBanner[];
  deals_end_at: string | null;
  categories: GroceryCategory[];
};

export type GroceryProductPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: GroceryProduct[];
};

export type GroceryProductQuery = {
  q?: string;
  category_slug?: string;
  on_sale?: boolean;
  featured?: boolean;
  page?: number;
  page_size?: number;
};
