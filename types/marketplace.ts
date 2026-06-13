export type Country = {
  id: number;
  name: string;
  code: string;
  currency: string;
  currency_symbol?: string | null;
  is_active?: boolean;
};

export type City = {
  id: number;
  name: string;
  slug: string;
  country_code: string;
};

export type WalletSummary = {
  id: number;
  available_balance: string;
  pending_balance: string;
  currency: string;
};

export type WalletTransaction = {
  id: number;
  transaction_type: string;
  amount: string;
  currency: string;
  status: string;
  reference: string;
  description: string;
  created_at: string;
};

export type RentalVehicle = {
  id: number;
  make: string;
  model: string;
  year: number;
  seats: number;
  transmission: string;
  fuel_type: string;
  daily_price: string;
  deposit_amount: string;
  currency: string;
  images: { id: number; image: string; order: number }[];
};

export type AccommodationListing = {
  id: number;
  title: string;
  property_type: string;
  description: string;
  country_name: string;
  city_name: string | null;
  price_per_night: string;
  currency: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  rating: number;
  review_count: number;
  images: { id: number; image: string; order: number }[];
};

export type PackageEstimate = {
  distance_km: string;
  estimated_price: string;
  currency: string;
};
