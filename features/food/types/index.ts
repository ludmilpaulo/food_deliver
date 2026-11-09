export type Cuisine = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  store_count?: number;
};

export type OpeningHourRow = {
  day: string;
  from_hour: string;
  to_hour: string;
  is_closed: boolean;
};

export type FoodStore = {
  id: number;
  name: string;
  phone?: string;
  address: string;
  logo: string | null;
  cover_image: string | null;
  description: string;
  location?: string;
  latitude: string | null;
  longitude: string | null;
  is_approved: boolean;
  is_verified: boolean;
  is_open: boolean;
  accepting_orders: boolean;
  supports_pickup: boolean;
  minimum_order_amount: string;
  delivery_radius_km: string;
  preparation_time_minutes: number;
  delivery_time_min: number;
  delivery_time_max: number;
  delivery_fee: string;
  price_level: 1 | 2 | 3;
  promo_text: string;
  rating: number | null;
  rating_count: number;
  distance_km: number | null;
  currency: string;
  cuisine: { id: number; name: string; slug: string } | null;
  opening_hours: OpeningHourRow[];
  vertical: 'food' | 'groceries';
};

export type ProductAddon = {
  id: number;
  name: string;
  price: string;
};

export type ProductAddonGroup = {
  id: number;
  name: string;
  required: boolean;
  min_select: number;
  max_select: number;
  addons: ProductAddon[];
};

export type FoodProduct = {
  id: number;
  name: string;
  description: string;
  price: number | string;
  original_price: number | string;
  on_sale: boolean;
  discount_percentage: number;
  image_url: string[];
  category: string | null;
  store: number;
  currency?: string;
  is_active: boolean;
  is_purchasable: boolean;
  selling_unit?: string;
  addon_groups: ProductAddonGroup[];
};

export type StoreReview = {
  id: number;
  rating: number;
  comment: string;
  tags: string[];
  customer_name: string;
  created_at: string;
};

export type StoreDeal = {
  id: number;
  title: string;
  name: string;
  description: string;
  discount_type: string;
  discount_value: string;
  end_date: string;
  product: { id: number; name: string; image: string | null; price: string } | null;
};

export type FoodStoreFilters = {
  search?: string;
  cuisine?: string;
  category?: number;
  min_rating?: number;
  max_delivery_min?: number;
  max_delivery_fee?: number;
  max_min_order?: number;
  price_level?: number[];
  open_now?: boolean;
  has_promotion?: boolean;
  pickup?: boolean;
  country?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  ordering?: 'rating' | '-rating' | 'delivery_time' | 'price_level' | 'name' | '-created' | 'distance';
};

export type FulfilmentType = 'delivery' | 'pickup';

export type QuoteLineInput = {
  key: string;
  product_id: number;
  quantity: number;
  addons?: number[];
  special_instructions?: string;
};

export type QuoteLine = {
  key: string;
  product_id: number;
  name: string;
  quantity: string;
  selling_unit: string;
  unit_price: string;
  discount: string;
  subtotal: string;
  addons: ProductAddon[];
  special_instructions: string;
};

export type QuoteStore = {
  store_id: number;
  store_name: string;
  currency?: string;
  lines?: QuoteLine[];
  subtotal?: string;
  promotion_discount?: string;
  delivery_fee?: string;
  discount_amount?: string;
  total?: string;
  coupon_code?: string;
  coupon_error?: string | null;
  fulfilment_type?: FulfilmentType;
  minimum_order_amount?: string;
  error?: string;
  code?: string;
};

export type CartQuote = {
  stores: QuoteStore[];
  lines: QuoteLine[];
  unavailable_product_ids: number[];
  currency: string;
  coupon_code: string;
  coupon_error: string | null;
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  total: string;
  has_errors: boolean;
};

export type CartQuoteRequest = {
  lines: QuoteLineInput[];
  coupon_code?: string;
  fulfilment_type?: FulfilmentType;
};

export type FoodCheckoutRequest = {
  store_id: number;
  fulfilment_type: FulfilmentType;
  address: string;
  location: string;
  use_current_location: boolean;
  payment_method: string;
  delivery_notes: string;
  coupon_code?: string;
  order_details: QuoteLineInput[];
};

export type FoodCheckoutResponse = {
  status: 'success' | 'failed';
  order_id: number;
  number: string;
  store_id: number;
  fulfilment_type: FulfilmentType;
  secret_pin: string;
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  total: string;
  currency: string;
  payment_method: string;
  order_ids: number[];
};

export type CheckoutErrorBody = {
  status?: 'failed';
  error?: string;
  code?: string;
  detail?: string;
};

export type AvailableCoupon = {
  code: string;
  title: string;
  description: string;
  discount_type: 'percent' | 'fixed';
  discount_value: string;
  min_order: string;
  expires_at: string | null;
  store_id: number | null;
  store_name: string | null;
  eligible: boolean;
  reason: string | null;
};

export type OrderStatusKey =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'picking'
  | 'packed'
  | 'ready'
  | 'courier_assigned'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export type OrderStep = {
  key: OrderStatusKey;
  label: string;
  state: 'done' | 'active' | 'pending';
  at?: string | null;
};

export type OrderListItem = {
  id: number;
  number: string;
  store: { id: number; name: string; logo: string | null; vertical: 'food' | 'groceries' | null };
  status: OrderStatusKey;
  status_label: string;
  status_code: number;
  total: string;
  currency: string;
  item_count: number;
  items_preview: string[];
  fulfilment_type: FulfilmentType;
  created_at: string;
  can_reorder: boolean;
  can_rate: boolean;
  rated: boolean;
};

export type OrderLine = {
  id: number;
  product_id: number | null;
  name: string;
  image: string | null;
  quantity: string;
  selling_unit: string;
  unit_price: string;
  subtotal: string;
  addons: Array<{ id: number | null; name: string; price: string }>;
  special_instructions: string;
};

export type OrderRating = {
  store_rating: number;
  driver_rating: number | null;
  comment: string;
  tags: string[];
  created_at: string;
};

export type OrderRefundSummary = {
  id: number;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  amount: string;
  reason: string;
};

export type OrderDetail = OrderListItem & {
  lines: OrderLine[];
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  payment_method: string;
  payment_status: string;
  is_paid: boolean;
  address: string | null;
  delivery_notes: string | null;
  secret_pin: string | null;
  driver: { name: string; phone: string | null; avatar: string | null; vehicle: string | null } | null;
  driver_location: { latitude: number; longitude: number } | null;
  timeline: Array<{ status: string; label: string; at: string }>;
  steps: OrderStep[];
  receipt_url: string | null;
  rating: OrderRating | null;
  refund: OrderRefundSummary | null;
  chat_enabled: boolean;
  eta_minutes: number | null;
  can_cancel: boolean;
  cancellation_reason: string;
  prep_estimate_minutes: number | null;
};

export type OrdersPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrderListItem[];
};

export type CustomerRefund = {
  id: number;
  order_id: number;
  order_number: string;
  store_name: string;
  amount: string;
  currency: string;
  status: OrderRefundSummary['status'];
  reason: string;
  details: string;
  created_at: string;
  updated_at: string;
};

export type OrderChatMessage = {
  id: number;
  sender: 'customer' | 'driver' | 'store';
  text: string;
  created_at: string;
};

export type RefundReason = 'missing_items' | 'wrong_items' | 'damaged' | 'late' | 'quality' | 'other';

export type ReorderLine = {
  product_id: number;
  name: string;
  price: string;
  image: string | null;
  store: number;
  store_name: string;
  vertical: 'food' | 'groceries' | null;
  quantity: number;
  selling_unit: string;
  addons: Array<{ id: number; name: string; price: string }>;
  special_instructions: string;
};

export type ReorderResponse = {
  lines: ReorderLine[];
  unavailable: Array<{ product_id: number | null; name: string; reason: string }>;
};

export type CustomerAddress = {
  id: number;
  label: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  instructions: string;
  is_default: boolean;
};
