export type ProviderType =
  | 'restaurant'
  | 'grocery'
  | 'store'
  | 'service'
  | 'service_provider'
  | 'property'
  | 'stay'
  | 'car_rental'
  | 'courier'
  | 'business';

const PROVIDER_WEB_ROUTES: Record<string, string> = {
  restaurant: '/provider/restaurant',
  grocery: '/provider/grocery',
  store: '/provider/store',
  service: '/provider/services',
  service_provider: '/provider/services',
  property: '/provider/properties',
  stay: '/provider/stay',
  car_rental: '/provider/car-rental',
  courier: '/provider/courier',
  business: '/provider/business',
};

const LEGACY_DASHBOARD_ROUTES: Record<string, string> = {
  '/dashboard/restaurant': '/provider/restaurant',
  '/dashboard/grocery': '/provider/grocery',
  '/dashboard/store': '/provider/store',
  '/dashboard/service-provider': '/provider/services',
  '/dashboard/property': '/provider/properties',
  '/dashboard/stay': '/provider/stay',
  '/dashboard/car-rental': '/provider/car-rental',
  '/dashboard/courier': '/provider/courier',
  '/dashboard/business': '/provider/business',
};

export function getProviderDashboardRoute(providerType: ProviderType): string {
  return PROVIDER_WEB_ROUTES[providerType] ?? '/provider/onboarding';
}

export function resolveProviderWebRoute(category: string, apiRoute?: string): string {
  const normalizedCategory = category.toLowerCase().replace(/-/g, '_') as ProviderType;
  if (PROVIDER_WEB_ROUTES[normalizedCategory]) {
    return PROVIDER_WEB_ROUTES[normalizedCategory];
  }
  if (apiRoute && LEGACY_DASHBOARD_ROUTES[apiRoute]) {
    return LEGACY_DASHBOARD_ROUTES[apiRoute];
  }
  if (apiRoute?.startsWith('/')) {
    return apiRoute;
  }
  return '/provider/onboarding';
}

export function resolveProviderPortalTarget(category: string): string {
  const route = resolveProviderWebRoute(category);
  const targets: Record<string, string> = {
    '/provider/restaurant': '/RestaurantDashboad',
    '/provider/grocery': '/RestaurantDashboad',
    '/provider/store': '/RestaurantDashboad',
    '/provider/services': '/PartnerDashboard',
    '/provider/business': '/PartnerDashboard',
  };
  return targets[route] ?? route;
}
