"use client";

import { useState } from "react";
import {
  useCreateGroceryPromotionMutation,
  useCreateGroceryStaffMutation,
  useCreateOpeningHourMutation,
  useGetGroceryAnalyticsQuery,
  useGetGroceryCustomersQuery,
  useGetGroceryMetaQuery,
  useGetGroceryProductsQuery,
  useGetGroceryPromotionsQuery,
  useGetGroceryRevenueQuery,
  useGetGroceryReviewsQuery,
  useGetGroceryStaffQuery,
  useGetOpeningHoursQuery,
  useUpdateGroceryAvailabilityMutation,
  useUpdateGroceryStoreMutation,
} from "@/redux/slices/groceryPartnerApi";
import { formatMoney } from "./format";
import { EmptyState, Panel } from "./ui";
import type { GroceryDashboardData, GroceryNavKey } from "./types";

export function GroceryMoreHub({ onSelect }: { onSelect: (key: GroceryNavKey) => void }) {
  const items: Array<{ key: GroceryNavKey; label: string; hint: string }> = [
    { key: "sales", label: "Sales", hint: "Charts and order volume" },
    { key: "revenue", label: "Revenue", hint: "Gross, commission, and payouts" },
    { key: "promotions", label: "Promotions", hint: "Percentage, BOGO, and weekly deals" },
    { key: "profile", label: "Store Profile", hint: "Name, hours, and delivery settings" },
    { key: "settings", label: "Settings", hint: "Pause orders and store details" },
    { key: "support", label: "Support", hint: "Help for grocery partners" },
  ];
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">More</h1>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelect(item.key)}
          className="flex w-full flex-col rounded-2xl bg-white px-4 py-4 text-left shadow-sm"
        >
          <span className="font-semibold text-slate-900">{item.label}</span>
          <span className="text-sm text-slate-500">{item.hint}</span>
        </button>
      ))}
    </div>
  );
}

export default function GrocerySections({
  view,
  dashboard,
}: {
  view: GroceryNavKey;
  dashboard?: GroceryDashboardData;
}) {
  if (view === "promotions") return <Promotions />;
  if (view === "revenue" || view === "payouts") return <Revenue />;
  if (view === "analytics" || view === "sales") return <Analytics />;
  if (view === "customers") return <Customers />;
  if (view === "reviews") return <Reviews />;
  if (view === "categories") return <Categories />;
  if (view === "profile" || view === "delivery" || view === "settings") return <StoreProfile dashboard={dashboard} />;
  if (view === "hours") return <Hours />;
  if (view === "staff") return <Staff />;
  if (view === "support") return <Support />;
  return null;
}

function Promotions() {
  const { data = [], isLoading } = useGetGroceryPromotionsQuery();
  const { data: products = [] } = useGetGroceryProductsQuery();
  const [createPromo] = useCreateGroceryPromotionMutation();
  const [form, setForm] = useState({
    title: "Weekend Special",
    discount_type: "percentage",
    discount_value: "10",
    product: "",
    start_date: "",
    end_date: "",
    min_quantity: "1",
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Promotions</h1>
      <form
        className="grid gap-3 rounded-2xl bg-white p-5 md:grid-cols-3"
        onSubmit={async (event) => {
          event.preventDefault();
          await createPromo({
            title: form.title,
            discount_type: form.discount_type,
            discount_value: Number(form.discount_value),
            product: form.product ? Number(form.product) : null,
            start_date: form.start_date,
            end_date: form.end_date,
            min_quantity: Number(form.min_quantity),
            is_active: true,
          });
        }}
      >
        <input className="rounded-xl border px-3 py-2" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title" />
        <select className="rounded-xl border px-3 py-2" value={form.discount_type} onChange={(event) => setForm({ ...form, discount_type: event.target.value })}>
          <option value="percentage">10% OFF / Percentage</option>
          <option value="fixed">Fixed discount</option>
          <option value="bogo">Buy One Get One</option>
          <option value="multibuy">Multi-buy</option>
          <option value="weekly">Weekly Deal</option>
        </select>
        <input className="rounded-xl border px-3 py-2" value={form.discount_value} onChange={(event) => setForm({ ...form, discount_value: event.target.value })} placeholder="Value" />
        <select className="rounded-xl border px-3 py-2" value={form.product} onChange={(event) => setForm({ ...form, product: event.target.value })}>
          <option value="">All products</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>{product.name}</option>
          ))}
        </select>
        <input type="date" className="rounded-xl border px-3 py-2" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} />
        <input type="date" className="rounded-xl border px-3 py-2" value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} />
        <button className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white" type="submit">Create promotion</button>
      </form>
      {isLoading ? <p>Loading…</p> : data.length === 0 ? <EmptyState title="No promotions" body="Create percentage, fixed, BOGO, or multi-buy deals." /> : (
        <div className="space-y-2">
          {data.map((promo) => (
            <div key={promo.id} className="rounded-xl border bg-white px-4 py-3">
              <p className="font-semibold">{promo.title}</p>
              <p className="text-sm text-slate-500">{promo.discount_type} · {promo.discount_value} · {promo.start_date}–{promo.end_date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Revenue() {
  const [range, setRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data, isLoading } = useGetGroceryRevenueQuery(
    range === "custom" ? { range: "custom", start_date: startDate, end_date: endDate } : { range }
  );
  if (isLoading) return <p>Loading revenue…</p>;
  if (!data) return <EmptyState title="No revenue yet" body="Completed orders will populate this report." />;
  const rows = [
    ["Gross sales", data.gross_sales],
    ["Kudya commission", data.commission],
    ["Delivery-related charges", data.delivery_charges],
    ["Discounts", data.discounts],
    ["Refunds", data.refunds],
    ["Net earnings", data.net_earnings],
    ["Pending payout", data.pending_payout],
    ["Paid out", data.paid_out],
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Revenue</h1>
      <div className="flex flex-wrap gap-2">
        {["today", "week", "month", "custom"].map((item) => (
          <button key={item} type="button" onClick={() => setRange(item)} className={`rounded-full px-3 py-1 text-sm ${range === item ? "bg-emerald-700 text-white" : "border"}`}>
            {item === "custom" ? "Custom" : item}
          </button>
        ))}
      </div>
      {range === "custom" ? (
        <div className="flex flex-wrap gap-2">
          <input type="date" className="rounded-xl border px-3 py-2" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <input type="date" className="rounded-xl border px-3 py-2" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-xl font-semibold">{formatMoney(Number(value))}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Analytics() {
  const { data, isLoading } = useGetGroceryAnalyticsQuery();
  if (isLoading) return <p>Loading analytics…</p>;
  if (!data) return <EmptyState title="No analytics yet" body="Best sellers appear after completed grocery orders." />;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Sales" value={formatMoney(data.sales)} />
        <Stat label="Orders" value={String(data.orders)} />
        <Stat label="Average order value" value={formatMoney(data.average_order_value)} />
        <Stat label="Customer repeat rate" value={`${data.customer_repeat_rate}%`} />
      </div>
      <Panel title="Best-selling products">
        {data.best_selling.map((item, index) => (
          <p key={item.id}>{index + 1}. {item.name} — {item.sold} sold</p>
        ))}
      </Panel>
      <Panel title="Low-performing products">
        {data.low_performing.map((item) => (
          <p key={item.id}>{item.name} — {item.sold} sold</p>
        ))}
      </Panel>
    </div>
  );
}

function Customers() {
  const { data = [], isLoading } = useGetGroceryCustomersQuery();
  if (isLoading) return <p>Loading customers…</p>;
  if (data.length === 0) return <EmptyState title="No customers yet" body="Customers who order from this store will appear here." />;
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Customers</h1>
      {data.map((customer) => (
        <div key={customer.id} className="rounded-xl bg-white px-4 py-3 shadow-sm">{customer.name || `Customer #${customer.id}`}</div>
      ))}
    </div>
  );
}

function Reviews() {
  const { data = [], isLoading } = useGetGroceryReviewsQuery();
  if (isLoading) return <p>Loading reviews…</p>;
  if (data.length === 0) return <EmptyState title="No reviews yet" body="Customer product reviews will show here." />;
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Reviews</h1>
      {data.map((row) => (
        <div key={row.id} className="rounded-xl bg-white p-4 shadow-sm">
          <p className="font-semibold">{row.product} · {row.rating}/5</p>
          <p className="text-sm text-slate-600">{row.comment}</p>
        </div>
      ))}
    </div>
  );
}

function Categories() {
  const { data } = useGetGroceryMetaQuery();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {data?.categories.map((category) => (
          <div key={category.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="font-semibold">{category.name}</p>
            <p className="text-sm text-slate-500">{category.children.map((child) => child.name).join(", ") || "No subcategories"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoreProfile({ dashboard }: { dashboard?: GroceryDashboardData }) {
  const [updateStore] = useUpdateGroceryStoreMutation();
  const [updateAvailability] = useUpdateGroceryAvailabilityMutation();
  const store = dashboard?.store;
  const [form, setForm] = useState({
    name: store?.name || "",
    phone: store?.phone || "",
    address: store?.address || "",
    email: store?.email || "",
    description: store?.description || "",
    delivery_radius_km: String(store?.delivery_radius_km ?? 5),
    minimum_order_amount: String(store?.minimum_order_amount ?? 0),
    preparation_time_minutes: String(store?.preparation_time_minutes ?? 30),
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Store Profile</h1>
      <div className="flex items-center justify-between rounded-2xl bg-white p-4">
        <div>
          <p className="font-semibold">{store?.accepting_orders ? "Store accepting orders" : "Store temporarily unavailable"}</p>
          <p className="text-sm text-slate-500">Pause orders without changing opening hours.</p>
        </div>
        <button
          type="button"
          onClick={() => updateAvailability({ accepting_orders: !store?.accepting_orders })}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${store?.accepting_orders ? "bg-emerald-600 text-white" : "bg-slate-200"}`}
        >
          {store?.accepting_orders ? "ON" : "OFF"}
        </button>
      </div>
      <form
        className="grid gap-3 rounded-2xl bg-white p-5 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          await updateStore(form);
          await updateAvailability({
            delivery_radius_km: Number(form.delivery_radius_km),
            minimum_order_amount: Number(form.minimum_order_amount),
            preparation_time_minutes: Number(form.preparation_time_minutes),
            email: form.email,
            description: form.description,
          });
        }}
      >
        {(["name", "phone", "address", "email", "description", "delivery_radius_km", "minimum_order_amount", "preparation_time_minutes"] as const).map((field) => (
          <label key={field} className="text-sm">
            {field.replace(/_/g, " ")}
            <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />
          </label>
        ))}
        <button className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white" type="submit">Save store settings</button>
        <a className="rounded-xl border px-4 py-2 text-center text-sm font-semibold" href="/stores" target="_blank" rel="noreferrer">
          View Store as Customer
        </a>
      </form>
    </div>
  );
}

function Hours() {
  const { data = [] } = useGetOpeningHoursQuery();
  const [createHour] = useCreateOpeningHourMutation();
  const [form, setForm] = useState({ day: "1", from_hour: "08:00 AM", to_hour: "08:00 PM", is_closed: false });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Opening Hours</h1>
      {data.map((row, index) => (
        <div key={`${row.day}-${index}`} className="rounded-xl bg-white px-4 py-3">
          {row.day}: {row.is_closed ? "Closed" : `${row.from_hour} – ${row.to_hour}`}
        </div>
      ))}
      <form
        className="grid gap-3 rounded-2xl bg-white p-5 md:grid-cols-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await createHour(form);
        }}
      >
        <input className="rounded-xl border px-3 py-2" value={form.day} onChange={(event) => setForm({ ...form, day: event.target.value })} placeholder="Day 1-7" />
        <input className="rounded-xl border px-3 py-2" value={form.from_hour} onChange={(event) => setForm({ ...form, from_hour: event.target.value })} />
        <input className="rounded-xl border px-3 py-2" value={form.to_hour} onChange={(event) => setForm({ ...form, to_hour: event.target.value })} />
        <button className="rounded-xl bg-emerald-600 text-white" type="submit">Add hours</button>
      </form>
    </div>
  );
}

function Staff() {
  const { data = [] } = useGetGroceryStaffQuery();
  const [createStaff] = useCreateGroceryStaffMutation();
  const [form, setForm] = useState({ name: "", role: "picker", phone: "", email: "" });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Staff</h1>
      {data.length === 0 ? <EmptyState title="No staff yet" body="Add pickers, cashiers, or managers for this store." /> : data.map((row) => (
        <div key={row.id} className="rounded-xl bg-white px-4 py-3">{row.name} · {row.role}</div>
      ))}
      <form
        className="grid gap-3 rounded-2xl bg-white p-5 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          await createStaff(form);
        }}
      >
        <input className="rounded-xl border px-3 py-2" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <select className="rounded-xl border px-3 py-2" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
          <option value="manager">Manager</option>
          <option value="cashier">Cashier</option>
          <option value="picker">Picker</option>
          <option value="stock">Stock clerk</option>
        </select>
        <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white" type="submit">Add staff</button>
      </form>
    </div>
  );
}

function Support() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Help & Support</h1>
      <Panel title="Grocery partner tips">
        <p>Use kg/g/litre for produce and liquids. Packs and trays keep a fixed pack price with optional weight.</p>
        <p className="mt-2">Low-stock alerts use each product threshold. Out-of-stock items stay visible to you but cannot be purchased.</p>
      </Panel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
