export type DashboardMetric = {
  key: string;
  label: string;
  description: string;
};

export type DashboardAction = {
  title: string;
  description: string;
  href?: string;
};

export type ProviderDashboardConfig = {
  categoryKey: string;
  title: string;
  subtitle: string;
  metrics: DashboardMetric[];
  actions: DashboardAction[];
  legacyPortalHref?: string;
};

export const PROVIDER_DASHBOARDS: Record<string, ProviderDashboardConfig> = {
  food: {
    categoryKey: "food",
    title: "Restaurant dashboard",
    subtitle: "Manage menus, live orders, kitchen status, and payouts.",
    legacyPortalHref: "/RestaurantDashboad",
    metrics: [
      { key: "live_orders", label: "Live orders", description: "Awaiting action" },
      { key: "preparing", label: "Preparing", description: "In kitchen" },
      { key: "ready", label: "Ready", description: "For pickup/delivery" },
      { key: "today_revenue", label: "Today's revenue", description: "Gross sales" },
      { key: "avg_rating", label: "Rating", description: "Customer reviews" },
      { key: "menu_items", label: "Menu items", description: "Active products" },
    ],
    actions: [
      { title: "Menu management", description: "Categories, meals, add-ons, and options." },
      { title: "Live orders", description: "Accept, reject, and update order status." },
      { title: "Opening hours", description: "Branches, delivery zones, and schedules." },
      { title: "Promotions", description: "Deals, coupons, and featured items." },
    ],
  },
  groceries: {
    categoryKey: "groceries",
    title: "Grocery store dashboard",
    subtitle: "Catalogue, inventory, orders, and delivery settings.",
    legacyPortalHref: "/RestaurantDashboad",
    metrics: [
      { key: "low_stock", label: "Low stock", description: "Needs replenishment" },
      { key: "pending_orders", label: "Pending orders", description: "To fulfil" },
      { key: "out_for_delivery", label: "Out for delivery", description: "On the way" },
      { key: "today_revenue", label: "Today's revenue", description: "Gross sales" },
      { key: "products", label: "Products", description: "Active SKUs" },
      { key: "avg_rating", label: "Rating", description: "Store reviews" },
    ],
    actions: [
      { title: "Product catalogue", description: "Add products, variants, and pricing." },
      { title: "Inventory", description: "Stock levels and low-stock alerts." },
      { title: "Orders", description: "Pickup and delivery fulfilment." },
      { title: "Delivery settings", description: "Zones, fees, and opening hours." },
    ],
  },
  property: {
    categoryKey: "property",
    title: "Property agency dashboard",
    subtitle: "Listings, viewings, leads, and documents.",
    metrics: [
      { key: "total_listings", label: "Listings", description: "All properties" },
      { key: "active_listings", label: "Live", description: "Visible to customers" },
      { key: "new_enquiries", label: "New leads", description: "Needs response" },
      { key: "scheduled_viewings", label: "Viewings", description: "Scheduled" },
      { key: "applications", label: "Applications", description: "Rental/buy" },
      { key: "pending_approval", label: "Pending", description: "Admin review" },
    ],
    actions: [
      { title: "Add listing", description: "Rent or sale with photos and features." },
      { title: "Viewing requests", description: "Schedule and confirm appointments." },
      { title: "Lead management", description: "Track buyer and renter interest." },
      { title: "Documents", description: "Ownership, lease, and application files." },
    ],
  },
  stay: {
    categoryKey: "stay",
    title: "Stay host dashboard",
    subtitle: "Accommodation listings, availability, and bookings.",
    metrics: [
      { key: "listings", label: "Listings", description: "Active stays" },
      { key: "upcoming_bookings", label: "Upcoming", description: "Confirmed stays" },
      { key: "check_ins_today", label: "Check-ins", description: "Today" },
      { key: "occupancy", label: "Occupancy", description: "This month" },
      { key: "revenue", label: "Revenue", description: "This month" },
      { key: "reviews", label: "Reviews", description: "Average rating" },
    ],
    actions: [
      { title: "Listings & rooms", description: "Pricing, amenities, and photos." },
      { title: "Availability calendar", description: "Block dates and manage inventory." },
      { title: "Bookings", description: "Guest details and check-in rules." },
      { title: "Cancellation policy", description: "House rules and policies." },
    ],
  },
  services: {
    categoryKey: "services",
    title: "Service provider dashboard",
    subtitle: "Quotes, bookings, jobs, and portfolio.",
    legacyPortalHref: "/PartnerDashboard",
    metrics: [
      { key: "quote_requests", label: "Quote requests", description: "New leads" },
      { key: "active_jobs", label: "Active jobs", description: "In progress" },
      { key: "completed_jobs", label: "Completed", description: "This month" },
      { key: "earnings", label: "Earnings", description: "This month" },
      { key: "rating", label: "Rating", description: "Customer reviews" },
      { key: "services", label: "Services", description: "Offerings live" },
    ],
    actions: [
      { title: "Services & pricing", description: "Packages, rates, and service areas." },
      { title: "Availability", description: "Working hours and coverage." },
      { title: "Active jobs", description: "Track status from quote to completion." },
      { title: "Portfolio", description: "Gallery and certifications." },
    ],
  },
  doctors: {
    categoryKey: "doctors",
    title: "Doctor dashboard",
    subtitle: "Consultations, availability, prescriptions, and earnings.",
    metrics: [
      { key: "upcoming", label: "Upcoming", description: "Consultations" },
      { key: "completed", label: "Completed", description: "This week" },
      { key: "available_slots", label: "Open slots", description: "Next 7 days" },
      { key: "patients", label: "Patients", description: "Unique this month" },
      { key: "earnings", label: "Earnings", description: "This month" },
      { key: "rating", label: "Rating", description: "Patient reviews" },
    ],
    actions: [
      { title: "Availability", description: "1-hour slots with 10-minute breaks." },
      { title: "Consultations", description: "Upcoming and completed visits." },
      { title: "Patient records", description: "Notes, DOB, and visit reason." },
      { title: "Documents", description: "Licence and certificate verification." },
    ],
  },
  "car-rental": {
    categoryKey: "car_rental",
    title: "Car rental dashboard",
    subtitle: "Fleet, bookings, inspections, and revenue.",
    metrics: [
      { key: "fleet", label: "Fleet", description: "Total vehicles" },
      { key: "available", label: "Available", description: "Ready to rent" },
      { key: "bookings", label: "Bookings", description: "Active" },
      { key: "pickups_today", label: "Pickups", description: "Today" },
      { key: "revenue", label: "Revenue", description: "This month" },
      { key: "deposits", label: "Deposits", description: "Held" },
    ],
    actions: [
      { title: "Fleet management", description: "Vehicles, images, and documents." },
      { title: "Pricing", description: "Daily/hourly rates and deposit rules." },
      { title: "Bookings", description: "Approve, reject, pickup and return." },
      { title: "Inspections", description: "Damage reports and checklists." },
    ],
  },
  "send-package": {
    categoryKey: "package",
    title: "Courier dashboard",
    subtitle: "Delivery requests, drivers, tracking, and pricing.",
    metrics: [
      { key: "pending", label: "Pending", description: "New requests" },
      { key: "in_transit", label: "In transit", description: "Active deliveries" },
      { key: "completed", label: "Completed", description: "Today" },
      { key: "drivers", label: "Drivers", description: "Online now" },
      { key: "revenue", label: "Revenue", description: "Today" },
      { key: "avg_delivery_time", label: "Avg time", description: "Minutes" },
    ],
    actions: [
      { title: "Delivery requests", description: "Accept, assign, and track packages." },
      { title: "Driver management", description: "Fleet and driver earnings." },
      { title: "Pricing rules", description: "Base fee, per-km, and zone pricing." },
      { title: "Proof of delivery", description: "Pickup and drop-off confirmation." },
    ],
  },
  wallet: {
    categoryKey: "wallet",
    title: "Provider wallet",
    subtitle: "Balances, payouts, commissions, and revenue by category.",
    metrics: [
      { key: "available", label: "Available", description: "Ready to withdraw" },
      { key: "pending", label: "Pending", description: "Clearing" },
      { key: "total_earnings", label: "Total earnings", description: "All time" },
      { key: "payouts", label: "Payouts", description: "This month" },
      { key: "commission", label: "Commission", description: "Platform fees" },
      { key: "refunds", label: "Refunds", description: "This month" },
    ],
    actions: [
      { title: "Request payout", description: "Withdraw available balance." },
      { title: "Payout history", description: "Past transfers and status." },
      { title: "Revenue breakdown", description: "Earnings by category." },
      { title: "Transaction log", description: "All wallet movements." },
    ],
  },
  business: {
    categoryKey: "business",
    title: "Business account dashboard",
    subtitle: "Employees, spending limits, orders, and invoicing.",
    metrics: [
      { key: "employees", label: "Employees", description: "Active users" },
      { key: "monthly_spend", label: "Monthly spend", description: "This month" },
      { key: "pending_approvals", label: "Approvals", description: "Awaiting manager" },
      { key: "invoices", label: "Invoices", description: "Open" },
      { key: "branches", label: "Branches", description: "Locations" },
      { key: "budget_used", label: "Budget used", description: "Of limit" },
    ],
    actions: [
      { title: "Employee management", description: "Roles, limits, and permissions." },
      { title: "Corporate orders", description: "Food, groceries, travel, and services." },
      { title: "Invoices & statements", description: "Download monthly reports." },
      { title: "Approval workflows", description: "Spending policies and limits." },
    ],
  },
};

export function getProviderDashboardConfig(slug: string): ProviderDashboardConfig | null {
  return PROVIDER_DASHBOARDS[slug] ?? null;
}
