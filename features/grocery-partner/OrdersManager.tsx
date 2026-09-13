"use client";

import { useState } from "react";
import {
  useGetGroceryOrdersQuery,
  useGetGroceryProductsQuery,
  usePickGroceryOrderItemMutation,
  useUpdateGroceryOrderStatusMutation,
} from "@/redux/slices/groceryPartnerApi";
import { formatMoney, groceryStatusLabel } from "./format";
import { EmptyState, StatusBadge } from "./ui";

const NEXT: Record<string, Array<{ status: string; label: string }>> = {
  new: [
    { status: "accepted", label: "Accept Order" },
    { status: "cancelled", label: "Reject" },
  ],
  accepted: [{ status: "preparing", label: "Start Preparing" }],
  preparing: [{ status: "ready", label: "Ready for Pickup" }],
  ready: [
    { status: "picked_up", label: "Picked Up" },
    { status: "handed_to_driver", label: "Handed to Driver" },
  ],
};

export default function OrdersManager() {
  const { data = [], isLoading, error } = useGetGroceryOrdersQuery();
  const { data: products = [] } = useGetGroceryProductsQuery();
  const [updateStatus] = useUpdateGroceryOrderStatusMutation();
  const [pickItem] = usePickGroceryOrderItemMutation();
  const [message, setMessage] = useState("");

  async function changeStatus(id: number, status: string) {
    try {
      await updateStatus({ id, status }).unwrap();
      setMessage(`Order #${id} updated.`);
    } catch (err) {
      const detail = err as { data?: { detail?: string } };
      setMessage(detail.data?.detail || "Could not update order.");
    }
  }

  if (isLoading) return <p className="text-sm text-slate-500">Loading orders…</p>;
  if (error) return <EmptyState title="Could not load orders" body="Refresh and try again." />;
  if (data.length === 0) return <EmptyState title="No grocery orders yet" body="Incoming orders will appear as cards with picking actions." />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <div className="grid gap-4">
        {data.map((order) => {
          const status = order.grocery_status || "new";
          return (
            <article key={order.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">Order #KDY-{order.id}</p>
                  <p className="text-sm text-slate-500">
                    {order.customer?.name || "Customer"} · {order.order_details.length} products · {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatMoney(order.total)}</p>
                  <StatusBadge label={groceryStatusLabel(status)} tone="info" />
                  <p className="mt-1 text-xs text-slate-500">Payment: {order.payment_status_store || "unpaid"}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {order.order_details.map((line) => (
                  <div key={line.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={line.pick_status === "found"}
                        onChange={() => pickItem({ orderId: order.id, itemId: line.id, pick_status: line.pick_status === "found" ? "pending" : "found" })}
                      />
                      {line.product.name} — {line.quantity} {line.selling_unit || line.product.selling_unit || "item"}
                    </label>
                    <div className="flex gap-2">
                      <button type="button" className="text-xs text-amber-700" onClick={() => pickItem({ orderId: order.id, itemId: line.id, pick_status: "missing" })}>
                        Missing
                      </button>
                      <select
                        className="rounded-lg border px-2 py-1 text-xs"
                        defaultValue=""
                        onChange={(event) => {
                          if (!event.target.value) return;
                          void pickItem({
                            orderId: order.id,
                            itemId: line.id,
                            pick_status: "substituted",
                            substituted_product: Number(event.target.value),
                          });
                        }}
                      >
                        <option value="">Substitute product</option>
                        {products.filter((product) => product.id !== line.product.id).map((product) => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(NEXT[status] || []).map((action) => (
                  <button
                    key={action.status}
                    type="button"
                    onClick={() => changeStatus(order.id, action.status)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      action.status === "cancelled" ? "border border-rose-200 text-rose-700" : "bg-emerald-600 text-white"
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
