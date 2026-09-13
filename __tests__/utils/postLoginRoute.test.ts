import { getPostLoginRoute, isPlatformAdminUser } from "@/utils/postLoginRoute";
import type { LoginResult } from "@/redux/slices/authSlice";

const restaurant: LoginResult = {
  token: "t",
  user_id: 1,
  username: "store@kudya.shop",
  role: "restaurant",
  is_customer: false,
  is_driver: false,
  message: "ok",
  business_profile: {
    id: 1,
    businessName: "Kudya Restaurant",
    category: "restaurant",
    dashboardRoute: "/dashboard/restaurant",
    isApproved: true,
    isActive: true,
  },
};

describe("post-login routing", () => {
  it("sends restaurant partners to the restaurant dashboard even if customer flag is stale", () => {
    expect(getPostLoginRoute({ ...restaurant, is_customer: true })).toBe("/RestaurantDashboad");
  });

  it("sends grocery partners to the grocery dashboard", () => {
    expect(
      getPostLoginRoute({
        token: "t",
        user_id: 4,
        username: "grocery@kudya.shop",
        role: "grocery_store_owner",
        is_customer: false,
        is_driver: false,
        message: "ok",
        business_profile: {
          id: 2,
          businessName: "Kudya Grocery",
          category: "grocery",
          dashboardRoute: "/dashboard/grocery",
          isApproved: true,
          isActive: true,
        },
      }),
    ).toBe("/GroceryDashboad");
  });

  it("sends customers home and admins to the admin console", () => {
    expect(
      getPostLoginRoute({
        token: "t",
        user_id: 2,
        username: "customer@kudya.shop",
        role: "customer",
        is_customer: true,
        is_driver: false,
        message: "ok",
      }),
    ).toBe("/HomeScreen");
    expect(
      isPlatformAdminUser({ role: "super_admin", is_platform_admin: true }),
    ).toBe(true);
    expect(
      getPostLoginRoute({
        token: "t",
        user_id: 3,
        username: "admin@kudya.shop",
        role: "super_admin",
        is_platform_admin: true,
        is_customer: false,
        is_driver: false,
        message: "ok",
      }),
    ).toBe("/AdminDashboard");
  });
});
