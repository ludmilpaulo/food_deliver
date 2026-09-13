export const GROCERY_NAV = {
  dashboard: "Dashboard",
  orders: "Orders",
  products: "Products",
  inventory: "Inventory",
  categories: "Categories",
  promotions: "Promotions",
  customers: "Customers",
  reviews: "Reviews",
  sales: "Sales",
  revenue: "Revenue",
  payouts: "Payouts",
  analytics: "Analytics",
  profile: "Store Profile",
  hours: "Opening Hours",
  delivery: "Delivery Settings",
  staff: "Staff",
  settings: "Settings",
  support: "Help & Support",
  more: "More",
} as const;

export type GroceryNavKey = keyof typeof GROCERY_NAV;

export type GrocerySellingUnit =
  | "item"
  | "kg"
  | "gram"
  | "litre"
  | "millilitre"
  | "pack"
  | "box"
  | "bottle"
  | "dozen"
  | "tray";

export type GroceryProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string | null;
  subcategory?: string | null;
  subcategory_id?: number | null;
  brand?: string;
  images: string[];
  image_url?: string[];
  selling_unit: GrocerySellingUnit | string;
  sold_by?: string;
  price_per?: string;
  price_display?: string;
  stock: number;
  stock_quantity: number;
  stock_unit: string;
  weight?: number | null;
  weight_unit?: string;
  low_stock_threshold?: number;
  inventory_status: "in_stock" | "low_stock" | "out_of_stock" | string;
  is_active: boolean;
  is_purchasable?: boolean;
  approval_status: string;
  approval_note?: string;
  currency?: string;
};

export type GroceryOrder = {
  id: number;
  grocery_status?: string;
  status: string;
  status_code: number;
  total: number;
  original_price?: number;
  payment_status_store?: string;
  created_at: string;
  customer?: { id: number; name: string; phone?: string };
  order_details: Array<{
    id: number;
    quantity: number;
    sub_total: number;
    selling_unit?: string;
    unit_price?: number;
    pick_status?: string;
    substitution_status?: string;
    pick_note?: string;
    product: { id: number; name: string; selling_unit?: string };
    substituted_product?: { id: number; name: string } | null;
  }>;
};

export type GroceryDashboardData = {
  greeting_name: string;
  accepting_orders: boolean;
  store: {
    id: number;
    name: string;
    logo?: string;
    phone?: string;
    address?: string;
    email?: string;
    description?: string;
    accepting_orders?: boolean;
    delivery_radius_km?: number;
    minimum_order_amount?: number;
    preparation_time_minutes?: number;
    cover_image?: string | null;
  };
  kpis: {
    sales_today: number;
    sales_today_change: number;
    orders_today: number;
    orders_today_change: number;
    products: number;
    low_stock: number;
    pending_orders: number;
    revenue: number;
  };
  low_stock_products: GroceryProduct[];
  recent_orders: GroceryOrder[];
};

export type GroceryMeta = {
  selling_units: Array<{ value: string; label: string }>;
  stock_reasons: Array<{ value: string; label: string }>;
  order_statuses: Array<{ value: string; label: string }>;
  pick_statuses: Array<{ value: string; label: string }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    icon?: string;
    children: Array<{ id: number; name: string; slug?: string }>;
  }>;
};

export type GrocerySalesData = {
  range: string;
  labels: string[];
  sales: number[];
  orders: number[];
  completed: number[];
  summary: {
    total_sales: number;
    orders: number;
    average_order_value: number;
    completed_orders: number;
  };
};

export type GroceryRevenueData = {
  gross_sales: number;
  commission: number;
  commission_rate: number;
  delivery_charges: number;
  discounts: number;
  refunds: number;
  net_earnings: number;
  pending_payout: number;
  paid_out: number;
};

export type GroceryAnalyticsData = {
  best_selling: Array<{ id: number; name: string; sold: number }>;
  low_performing: Array<{ id: number; name: string; sold: number }>;
  average_order_value: number;
  customer_repeat_rate: number;
  orders: number;
  sales: number;
};

export type GroceryPromotion = {
  id: number;
  title: string;
  discount_type: string;
  discount_value: number;
  min_quantity: number;
  max_quantity: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  product: number | null;
  product_name: string | null;
};

export type GroceryStaff = {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  is_active: boolean;
};
