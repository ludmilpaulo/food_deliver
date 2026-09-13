import {
  BadgePercent,
  BarChart3,
  Boxes,
  Clock3,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Wallet,
  ChevronLeft,
  Star,
  Tags,
  LineChart,
  UserCog,
} from "lucide-react";
import type { GroceryNavKey } from "./types";

const MAIN: Array<{ key: GroceryNavKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "products", label: "Products", icon: Package },
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "categories", label: "Categories", icon: Tags },
  { key: "promotions", label: "Promotions", icon: BadgePercent },
  { key: "customers", label: "Customers", icon: Users },
  { key: "reviews", label: "Reviews", icon: Star },
];

const BUSINESS: Array<{ key: GroceryNavKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: "sales", label: "Sales", icon: LineChart },
  { key: "revenue", label: "Revenue", icon: BarChart3 },
  { key: "payouts", label: "Payouts", icon: Wallet },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

const STORE: Array<{ key: GroceryNavKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: "profile", label: "Store Profile", icon: Store },
  { key: "hours", label: "Opening Hours", icon: Clock3 },
  { key: "delivery", label: "Delivery Settings", icon: Truck },
  { key: "staff", label: "Staff", icon: UserCog },
  { key: "settings", label: "Settings", icon: Settings },
];

type Props = {
  active: GroceryNavKey;
  collapsed: boolean;
  storeName?: string;
  logo?: string;
  pendingOrders?: number;
  onSelect: (key: GroceryNavKey) => void;
  onToggle: () => void;
  onLogout: () => void;
};

function NavGroup({
  title,
  items,
  active,
  collapsed,
  pendingOrders,
  onSelect,
}: {
  title: string;
  items: Array<{ key: GroceryNavKey; label: string; icon: typeof LayoutDashboard }>;
  active: GroceryNavKey;
  collapsed: boolean;
  pendingOrders?: number;
  onSelect: (key: GroceryNavKey) => void;
}) {
  return (
    <div className="mb-5">
      {!collapsed && (
        <p className="px-3 mb-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-emerald-200/80">
          {title}
        </p>
      )}
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const selected = active === item.key;
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  selected ? "bg-white text-emerald-800 shadow-sm" : "text-emerald-50 hover:bg-emerald-700/60"
                }`}
              >
                <Icon size={18} />
                {!collapsed && <span className="flex-1 text-left font-medium">{item.label}</span>}
                {!collapsed && item.key === "orders" && pendingOrders ? (
                  <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-emerald-950">
                    {pendingOrders}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function GrocerySidebar({
  active,
  collapsed,
  storeName,
  logo,
  pendingOrders,
  onSelect,
  onToggle,
  onLogout,
}: Props) {
  return (
    <aside
      className={`flex h-full flex-col bg-emerald-800 text-white transition-all ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-5">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-10 w-10 rounded-full object-cover bg-white" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-bold">K</div>
        )}
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-semibold">{storeName || "Grocery Partner"}</p>
            <p className="text-xs text-emerald-200">Partner dashboard</p>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        <NavGroup title="Main" items={MAIN} active={active} collapsed={collapsed} pendingOrders={pendingOrders} onSelect={onSelect} />
        <NavGroup title="Business" items={BUSINESS} active={active} collapsed={collapsed} onSelect={onSelect} />
        <NavGroup title="Store" items={STORE} active={active} collapsed={collapsed} onSelect={onSelect} />
      </div>
      <div className="space-y-1 border-t border-emerald-700 p-2">
        <button
          type="button"
          onClick={() => onSelect("support")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-emerald-50 hover:bg-emerald-700/60"
        >
          <HelpCircle size={18} />
          {!collapsed && "Help & Support"}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-100 hover:bg-rose-600/40"
        >
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-xl px-3 py-2 text-emerald-100 hover:bg-emerald-700/60"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className={collapsed ? "rotate-180" : ""} size={18} />
        </button>
      </div>
    </aside>
  );
}
