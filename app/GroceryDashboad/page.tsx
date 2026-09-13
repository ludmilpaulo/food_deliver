"use client";

import withPartnerAuth from "@/components/PartnerRouteGuard";
import GroceryDashboardApp from "@/features/grocery-partner/GroceryDashboardApp";

function GroceryPartnerPage() {
  return <GroceryDashboardApp />;
}

export default withPartnerAuth(GroceryPartnerPage);
