export type PartnerTab = 'new' | 'accepted' | 'preparing' | 'ready' | 'with_courier' | 'completed' | 'cancelled';
export type PartnerAction = 'accept' | 'reject' | 'start_preparing' | 'mark_ready' | 'handover' | 'collected';
export type FoodFulfilmentStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'courier_assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PartnerCapability =
  | 'view_orders'
  | 'accept_orders'
  | 'prepare_orders'
  | 'handover_orders'
  | 'manage_menu'
  | 'manage_hours'
  | 'manage_team'
  | 'manage_store'
  | 'view_reports'
  | 'view_finance';

export type PartnerMe = {
  store: {
    id: number;
    name: string;
    is_approved: boolean;
    accepting_orders: boolean;
    supports_pickup: boolean;
    verification_status: 'approved' | 'pending';
  };
  role: string;
  capabilities: PartnerCapability[];
};

export type PartnerDashboard = {
  currency: string;
  today: Record<PartnerTab, number> & { orders: number; revenue: string };
  open: Record<'new' | 'accepted' | 'preparing' | 'ready' | 'with_courier', number>;
  outstanding_payouts?: string;
  rating: { average: number | null; count: number };
  popular_products: Array<{ name: string; quantity: string; revenue: string }>;
  accepting_orders: boolean;
  is_approved: boolean;
};

export type PartnerOrderCard = {
  id: number;
  number: string;
  status: FoodFulfilmentStatus;
  status_label: string;
  fulfilment_type: 'delivery' | 'pickup';
  customer_name: string;
  item_count: string;
  items_preview: string[];
  total: string;
  payment_method: string;
  created_at: string;
  prep_estimate_minutes: number | null;
  has_courier: boolean;
};

export type PartnerOrderPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PartnerOrderCard[];
  counts: Record<PartnerTab, number>;
};

export type PartnerOrderDetail = PartnerOrderCard & {
  currency: string;
  lines: Array<{
    id: number;
    name: string;
    quantity: string;
    unit_price: string;
    subtotal: string;
    addons: Array<{ name: string; price: string }>;
    special_instructions: string;
  }>;
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  delivery_notes: string;
  cancellation_reason: string;
  payment_status: string;
  courier: { name: string; vehicle: string } | null;
  timeline: Array<{ status: string; label: string; at: string }>;
  settlement: { gross: string; platform_fee: string; net: string; paid_out: boolean } | null;
  actions: PartnerAction[];
};

export type PartnerStoreSettings = {
  id: number;
  name: string;
  logo: string | null;
  cover_image: string | null;
  is_approved: boolean;
  accepting_orders: boolean;
  supports_pickup: boolean;
  preparation_time_minutes: number;
  minimum_order_amount: string;
  delivery_radius_km: string;
  price_level: number;
  promo_text: string;
  description: string;
  phone: string;
  address: string;
};

export type PartnerAddon = { id: number; name: string; price: string; is_active: boolean; sort_order: number };
export type PartnerAddonGroup = {
  id: number;
  product: number;
  name: string;
  required: boolean;
  min_select: number;
  max_select: number;
  sort_order: number;
  addons: PartnerAddon[];
};

export type PartnerProduct = {
  id: number;
  name: string;
  description: string;
  base_price: string | number;
  price: string | number;
  category: string | null;
  category_id: number | null;
  is_active: boolean;
  stock: string | number;
  available_quantity: string | number;
  image_url: string[];
  addon_groups: PartnerAddonGroup[];
};

export type ProductCategoryOption = { id: number; name: string; vertical?: string };

export type PartnerOpeningHour = {
  id: number;
  day: number;
  day_number: number;
  day_label: string;
  from_hour: string;
  to_hour: string;
  is_closed: boolean;
};

export type PartnerPromotion = {
  id: number;
  product: number | null;
  title: string;
  discount_type: string;
  discount_value: string;
  min_quantity: string;
  max_quantity: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export type TeamRole = 'store_admin' | 'manager' | 'kitchen' | 'order_processing' | 'finance';
export type TeamMember = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: TeamRole | string;
  is_active: boolean;
  linked: boolean;
  created_at: string;
};

export type PartnerReport = {
  from: string;
  to: string;
  currency: string;
  summary: {
    orders: number;
    completed: number;
    cancelled: number;
    revenue: string;
    discounts: string;
    average_prep_minutes: number | null;
    commissions?: string;
    gross_earnings?: string;
    net_earnings?: string;
    paid_out?: string;
    outstanding?: string;
    refunds_requested: number;
    refunds_amount: string;
  };
  daily: Array<{ date: string; orders: number; completed: number; cancelled: number; revenue: string }>;
  best_sellers: Array<{ name: string; quantity: string; revenue: string }>;
};
