export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export type AdminRestaurantRow = {
  id: number;
  name: string;
  verification_status: VerificationStatus;
  is_approved: boolean;
  accepting_orders: boolean;
  cuisine: string | null;
  owner: { name: string; email: string } | null;
  country: string | null;
  city: string | null;
  address: string;
  phone: string;
  order_count?: number;
};

export type AdminRestaurantDetail = AdminRestaurantRow & {
  description: string;
  verification_note: string;
  license: string | null;
  opening_hours: Array<{ day: string; from_hour: string; to_hour: string; is_closed: boolean }>;
  stats: { orders: number; completed: number; cancelled: number; rating: number | null; rating_count: number };
  documents: Array<{ id: number; type: string; status: string; file: string | null }>;
  audit: Array<{ action: string; actor: string | null; metadata: Record<string, unknown>; at: string }>;
};

export type AdminOrderRow = {
  id: number;
  number: string;
  status: string;
  status_label: string;
  restaurant: { id: number; name: string };
  customer: string;
  courier: string | null;
  fulfilment_type: 'delivery' | 'pickup';
  payment_method: string;
  payment_status: string;
  total: string;
  currency: string;
  created_at: string;
  cancellation_reason: string;
};

export type AdminOrderDetail = AdminOrderRow & {
  lines: Array<{ name: string; quantity: string; subtotal: string }>;
  delivery_fee: string;
  discount_amount: string;
  driver_commission: string;
  address: string | null;
  timeline: Array<{ status: string; label: string; at: string }>;
  payments: Array<{ reference: string; status: string; amount: string; method: string }>;
  delivery_request: { number: string; status: string; driver_commission: string; platform_fee: string } | null;
  refunds: Array<{ id: number; status: string; amount: string; reason: string }>;
};

export type AdminRefundRow = {
  id: number;
  order_id: number;
  order_number: string;
  restaurant: string;
  customer: string;
  reason: string;
  details: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  created_at: string;
};

export type AdminFoodOverview = {
  restaurants: Record<VerificationStatus, number>;
  orders_today: number;
  active_orders: number;
  cancelled_today: number;
  pending_refunds: number;
  stuck_orders: number;
};

export type AdminFoodConfig = {
  module: { is_active: boolean; allowed_country_ids: number[] };
  countries: Array<{ id: number; name: string; code: string; currency: string }>;
  delivery_fees: Array<{ id: number; country_id: number | null; delivery_base_fee: string; is_active: boolean }>;
  commissions: Array<{
    id: number;
    country_id: number | null;
    fee_type: string;
    value: string;
    fixed_fee: string;
    transaction_type: string;
    is_active: boolean;
  }>;
  notes: Record<string, string>;
};

export type AdminPromo = {
  id: number;
  code: string;
  title: string;
  description: string;
  discount_type: 'percent' | 'fixed';
  discount_value: string;
  min_order: string;
  max_discount: string | null;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  per_user_limit: number;
  store: number | null;
  is_active: boolean;
  uses?: number;
};

export type AdminFoodReport = {
  from: string;
  to: string;
  orders: number;
  completed: number;
  cancelled: number;
  gross_order_value: string;
  food_sales: string;
  discounts: string;
  delivery_fees: string;
  restaurant_commission: string;
  restaurant_earnings: string;
  courier_earnings: string;
  net_platform_revenue: string;
  refunds: { requested: number; pending: number; refunded_amount: string };
  payouts: { paid_out: string; outstanding: string };
  reconciliation: {
    online_order_total: string;
    verified_payments_total: string;
    difference: string;
    orders_without_verified_payment: number[];
  };
  generated_at: string;
  range_days: number;
};
