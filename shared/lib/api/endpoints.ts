/**
 * Kudya API v1 path helpers.
 * Base URL is the Django host; paths are under /api/v1/.
 */
export const API_V1_PREFIX = '/api/v1';

export const v1Endpoints = {
  businesses: `${API_V1_PREFIX}/businesses`,
  businessMe: `${API_V1_PREFIX}/businesses/me/`,
  partner: `${API_V1_PREFIX}/partner`,
  partnerStore: `${API_V1_PREFIX}/partner/store/`,
  partnerOrders: `${API_V1_PREFIX}/partner/orders/`,
  partnerReports: `${API_V1_PREFIX}/partner/reports/`,
  adminMarketplaceStores: `${API_V1_PREFIX}/admin/marketplace/stores/`,
  adminMarketplaceProducts: `${API_V1_PREFIX}/admin/marketplace/products/`,
  adminMarketplaceOrders: `${API_V1_PREFIX}/admin/marketplace/orders/`,
  adminMarketplaceReports: `${API_V1_PREFIX}/admin/marketplace/reports/`,
  adminMarketplaceCustomers: `${API_V1_PREFIX}/admin/marketplace/customers/`,
  adminMarketplaceDrivers: `${API_V1_PREFIX}/admin/marketplace/drivers/`,
  adminDashboard: `${API_V1_PREFIX}/admin/dashboard/`,
  notifications: `${API_V1_PREFIX}/notifications`,
  notificationsUnread: `${API_V1_PREFIX}/notifications/unread-count/`,
  notificationsMarkAll: `${API_V1_PREFIX}/notifications/mark-all-read/`,
  analyticsDashboard: `${API_V1_PREFIX}/analytics/dashboard/`,
  analyticsTrack: `${API_V1_PREFIX}/analytics/track/`,
  doctors: `${API_V1_PREFIX}/doctors`,
  platform: `${API_V1_PREFIX}/platform`,
  auth: `${API_V1_PREFIX}/auth`,
  wallet: `${API_V1_PREFIX}/wallet`,
  payments: `${API_V1_PREFIX}/payments`,
} as const;

export type V1EndpointKey = keyof typeof v1Endpoints;
