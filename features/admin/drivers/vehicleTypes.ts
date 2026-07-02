export type ChoiceOption = {
  value: string;
  label: string;
  allowed_service_usages?: string[];
};

export type CountryVehicleRule = {
  id: number;
  country_id: number;
  country_name: string;
  country_code: string;
  allow_motorcycle_taxi: boolean;
  allow_bicycle_delivery: boolean;
  allow_scooter_delivery: boolean;
  distance_unit: string;
  currency: string;
};

export type AdminDriverVehicle = {
  id: number;
  vehicle_type: string;
  vehicle_type_label: string;
  plate_number: string;
  make: string;
  model: string;
  color: string;
  year: number | null;
  service_usages: string[];
  service_usage_labels: string[];
  taxi_category: string | null;
  taxi_category_label: string | null;
  passenger_capacity: number;
  cargo_capacity_kg: number | null;
  is_active: boolean;
  verification_status: string;
  rejection_reason: string;
  allowed_service_usages?: string[];
  created_at?: string;
  updated_at?: string;
};

export type DriverVehicleFormState = {
  vehicle_type: string;
  make: string;
  model: string;
  year: string;
  color: string;
  plate_number: string;
  passenger_capacity: number;
  cargo_capacity_kg: string;
  service_usages: string[];
  taxi_category: string;
  is_active: boolean;
};
