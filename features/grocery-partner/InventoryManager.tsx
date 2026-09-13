"use client";

import { useState } from "react";
import {
  useAdjustGroceryStockMutation,
  useGetGroceryInventoryQuery,
  useGetGroceryStockHistoryQuery,
} from "@/redux/slices/groceryPartnerApi";
import { formatMoney, inventoryLabel, unitLabel } from "./format";
import { EmptyState, Panel, StatusBadge } from "./ui";

export default function InventoryManager() {
  const [status, setStatus] = useState("");
  const { data = [], isLoading, error } = useGetGroceryInventoryQuery(status || undefined);
  const { data: history = [] } = useGetGroceryStockHistoryQuery();
  const [adjust] = useAdjustGroceryStockMutation();
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [reason, setReason] = useState("manual");
  const [message, setMessage] = useState("");

  async function apply(id: number, delta: number) {
    try {
      await adjust({ id, adjustment: delta, reason }).unwrap();
      setMessage("Stock updated.");
    } catch (err) {
      const detail = err as { data?: { detail?: string } };
      setMessage(detail.data?.detail || "Could not update stock.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500">Adjust stock in the same unit the product is sold by.</p>
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="">All</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {isLoading ? <p className="text-sm text-slate-500">Loading inventory…</p> : null}
      {error ? <EmptyState title="Could not load inventory" body="Try again in a moment." /> : null}
      {!isLoading && data.length === 0 ? (
        <EmptyState title="No inventory rows" body="Add grocery products first, then update stock here." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {data.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">{product.stock_quantity}</td>
                  <td className="px-4 py-3">{unitLabel(product.stock_unit || product.selling_unit)}</td>
                  <td className="px-4 py-3">{product.price_display || formatMoney(product.price)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={inventoryLabel(product.inventory_status)}
                      tone={product.inventory_status === "out_of_stock" ? "danger" : product.inventory_status === "low_stock" ? "warning" : "success"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" className="rounded-lg border px-2 py-1" onClick={() => apply(product.id, -1)}>−</button>
                      <input
                        className="w-20 rounded-lg border px-2 py-1"
                        value={draft[product.id] ?? ""}
                        placeholder="qty"
                        onChange={(event) => setDraft({ ...draft, [product.id]: event.target.value })}
                      />
                      <button type="button" className="rounded-lg border px-2 py-1" onClick={() => apply(product.id, 1)}>+</button>
                      <button
                        type="button"
                        className="rounded-lg bg-emerald-600 px-2 py-1 text-white"
                        onClick={() => apply(product.id, Number(draft[product.id] || 0))}
                      >
                        Apply
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <label className="text-sm">
        Adjustment reason
        <select value={reason} onChange={(event) => setReason(event.target.value)} className="ml-2 rounded-lg border px-2 py-1">
          <option value="received">Stock received</option>
          <option value="manual">Manual adjustment</option>
          <option value="damaged">Damaged goods</option>
          <option value="expired">Expired</option>
          <option value="returned">Returned</option>
          <option value="correction">Correction</option>
        </select>
      </label>
      <Panel title="Stock History">
        {history.length === 0 ? (
          <EmptyState title="No adjustments yet" body="Every stock change is recorded for accountability." />
        ) : (
          <div className="space-y-2 text-sm">
            {history.slice(0, 20).map((row) => (
              <div key={row.id} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span>
                  {row.product}: {row.previous_quantity} → {row.new_quantity} ({row.reason})
                </span>
                <span className="text-slate-500">{new Date(row.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
