export type PartnerPortalUser = {
  role?: string;
  business_profile?: { category?: string } | null;
};

export const RESTAURANT_DASHBOARD_PATH = "/RestaurantDashboad";
export const GROCERY_DASHBOARD_PATH = "/provider/grocery";

function categoryOf(user: PartnerPortalUser | null | undefined): string {
  return (user?.business_profile?.category || "").toLowerCase();
}

function roleOf(user: PartnerPortalUser | null | undefined): string {
  return (user?.role || "").toLowerCase();
}

export function isGroceryPartnerUser(user: PartnerPortalUser | null | undefined): boolean {
  if (!user) return false;
  if (categoryOf(user) === "grocery") return true;
  return roleOf(user) === "grocery_store_owner";
}

export function isRestaurantPartnerUser(user: PartnerPortalUser | null | undefined): boolean {
  if (!user || isGroceryPartnerUser(user)) return false;
  const category = categoryOf(user);
  if (category === "restaurant" || category === "store") return true;
  const role = roleOf(user);
  return role === "restaurant" || role === "merchant";
}
