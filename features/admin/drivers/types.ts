export type DriverServiceType =
  | 'all'
  | 'taxi'
  | 'parcel'
  | 'food'
  | 'grocery'
  | 'store_delivery'
  | 'medical'
  | 'other';

export type DriverRegion =
  | 'all'
  | 'africa'
  | 'europe'
  | 'asia'
  | 'north_america'
  | 'south_america'
  | 'oceania';

export type DriverOpsStatus =
  | 'online'
  | 'offline'
  | 'on_job'
  | 'pending_verification'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'expired_documents';

export type DocumentStatus = 'valid' | 'pending' | 'expired' | 'rejected' | 'missing';

export type DemandLevel = 'low' | 'normal' | 'medium' | 'high';

export interface DriverOpsFilters {
  region?: DriverRegion;
  service_type?: DriverServiceType;
  date_from?: string;
  date_to?: string;
  search?: string;
  status?: string;
  country?: string;
  city?: string;
  page?: number;
  page_size?: number;
}

export interface DriverKpis {
  total_drivers: number;
  total_drivers_change: number;
  online_now: number;
  online_now_change: number;
  on_active_job: number;
  on_active_job_change: number;
  verification_pending: number;
  verification_pending_change: number;
  suspended: number;
  suspended_change: number;
  completed_today: number;
  completed_today_change: number;
  average_rating: number;
  average_rating_change: number;
  document_expiry_alerts: number;
  document_expiry_alerts_change: number;
}

export interface LiveMapDriver {
  id: string;
  driver_id: number;
  name: string;
  service_type: string;
  country: string;
  city: string;
  phone: string;
  vehicle_type: string;
  plate_number: string;
  latitude: number;
  longitude: number;
  status: string;
  demand_level: DemandLevel;
  current_job_id: string | null;
  battery_percentage: number | null;
  last_location_at: string | null;
}

export interface LiveMapCluster {
  region: string;
  latitude: number;
  longitude: number;
  count: number;
  demand_level: DemandLevel;
}

export interface LiveMapResponse {
  drivers: LiveMapDriver[];
  clusters: LiveMapCluster[];
}

export interface LiveInsights {
  gps_active: number;
  offline_drivers: number;
  high_demand_zones: number;
  emergency_alerts: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface DriverAnalytics {
  trip_volume: { total: number; change: number; series: ChartPoint[] };
  delivery_performance: { success_rate: number; change: number; series: ChartPoint[] };
  demand_by_region: { region: string; percentage: number }[];
  driver_availability: { online_rate: number; change: number; series: ChartPoint[] };
  verification_funnel: {
    submitted: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
}

export interface DriverOpsRow {
  id: string;
  driver_id: number;
  full_name: string;
  avatar_url: string | null;
  service_type: string;
  service_type_label: string;
  country: string;
  country_id?: number | null;
  country_code: string;
  city: string;
  phone: string;
  vehicle_type: string;
  plate_number: string;
  rating: number;
  completed_jobs: number;
  status: DriverOpsStatus;
  battery_percentage: number | null;
  document_status: DocumentStatus;
  last_online_at: string | null;
  verification_status: string;
  vehicle_type_label?: string;
  service_usages?: string[];
  service_usages_label?: string;
  taxi_category?: string | null;
  taxi_category_label?: string | null;
  vehicle_status?: string;
  vehicle_make_model?: string;
}

export interface DriverOpsListResponse {
  count: number;
  page: number;
  page_size: number;
  results: DriverOpsRow[];
}

export interface PendingVerificationItem {
  driver_id: number;
  full_name: string;
  avatar_url: string | null;
  service_type: string;
  country: string;
  missing_documents: string[];
}

export interface ExpiringDocumentItem {
  driver_id: number;
  full_name: string;
  country: string;
  document_type: string;
  days_remaining: number;
  risk: 'low' | 'medium' | 'high';
}

export interface IncidentItem {
  id: number;
  incident_type: string;
  location: string;
  severity: string;
  created_at: string;
  driver_name: string;
}

export interface TopDriverItem {
  rank: number;
  driver_id: number;
  full_name: string;
  city: string;
  country: string;
  rating: number;
  completed_jobs: number;
}

export interface PayoutSummary {
  gross_earnings: number;
  net_earnings: number;
  payouts_made: number;
  pending_payouts: number;
  change: number;
  period: string;
}
