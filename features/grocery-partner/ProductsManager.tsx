"use client";

import { useMemo, useState } from "react";
import {
  useCreateGroceryProductMutation,
  useDeleteGroceryProductMutation,
  useGetGroceryMetaQuery,
  useGetGroceryProductsQuery,
  useUpdateGroceryProductMutation,
} from "@/redux/slices/groceryPartnerApi";
import type { GroceryProduct } from "./types";
import { formatMoney, inventoryLabel, unitLabel } from "./format";
import { EmptyState, Panel, StatusBadge } from "./ui";

const PRODUCT_STATUSES = [
  { id: "", label: "All statuses" },
  { id: "in_stock", label: "Active / In Stock" },
  { id: "low_stock", label: "Low Stock" },
  { id: "out_of_stock", label: "Out of Stock" },
  { id: "draft", label: "Draft" },
  { id: "pending", label: "Pending Approval" },
  { id: "inactive", label: "Inactive" },
];

type FormState = {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  selling_unit: string;
  price: string;
  stock_quantity: string;
  weight: string;
  weight_unit: string;
  low_stock_threshold: string;
  publish: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  category: "",
  subcategory: "",
  brand: "",
  selling_unit: "item",
  price: "",
  stock_quantity: "",
  weight: "",
  weight_unit: "",
  low_stock_threshold: "10",
  publish: true,
};

export default function ProductsManager() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("-id");
  const [editing, setEditing] = useState<GroceryProduct | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");

  const query = useMemo(
    () => ({
      q: search,
      category,
      brand,
      status,
      sort,
    }),
    [search, category, brand, status, sort],
  );
  const { data: products = [], isLoading, error } = useGetGroceryProductsQuery(query);
  const { data: meta } = useGetGroceryMetaQuery();
  const [createProduct, { isLoading: creating }] = useCreateGroceryProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateGroceryProductMutation();
  const [deleteProduct] = useDeleteGroceryProductMutation();

  const children = meta?.categories.find((item) => String(item.id) === form.category || item.name === form.category)?.children || [];

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFiles(null);
    setOpen(true);
  }

  function openEdit(product: GroceryProduct) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description?.replace(/<[^>]+>/g, "") || "",
      category: typeof product.category === "string" ? product.category : "",
      subcategory: product.subcategory || "",
      brand: product.brand || "",
      selling_unit: product.selling_unit || "item",
      price: String(product.original_price ?? product.price ?? ""),
      stock_quantity: String(product.stock_quantity ?? product.stock ?? ""),
      weight: product.weight != null ? String(product.weight) : "",
      weight_unit: product.weight_unit || "",
      low_stock_threshold: String(product.low_stock_threshold ?? 10),
      publish: product.is_active,
    });
    setOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const body = new FormData();
    body.append("name", form.name);
    body.append("description", form.description);
    body.append("category", form.category);
    if (form.subcategory) body.append("subcategory", form.subcategory);
    body.append("brand", form.brand);
    body.append("selling_unit", form.selling_unit);
    body.append("stock_unit", form.selling_unit);
    body.append("price", form.price);
    body.append("stock_quantity", form.stock_quantity);
    if (form.weight) body.append("weight", form.weight);
    if (form.weight_unit) body.append("weight_unit", form.weight_unit);
    body.append("low_stock_threshold", form.low_stock_threshold);
    body.append("publish", form.publish ? "true" : "false");
    body.append("is_active", form.publish ? "true" : "false");
    if (files?.[0]) body.append("image", files[0]);
    if (files) {
      Array.from(files).forEach((file) => body.append("images", file));
    }
    try {
      if (editing) {
        await updateProduct({ id: editing.id, body }).unwrap();
        setMessage("Product updated.");
      } else {
        await createProduct(body).unwrap();
        setMessage("Product added.");
      }
      setOpen(false);
    } catch (err) {
      const detail = err as { data?: { error?: string; detail?: string } };
      setMessage(detail.data?.error || detail.data?.detail || "Could not save product.");
    }
  }

  async function remove(product: GroceryProduct) {
    if (!confirm(`Deactivate or delete ${product.name}?`)) return;
    await deleteProduct(product.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage grocery items, packs, and products sold by weight.</p>
        </div>
        <button type="button" onClick={openCreate} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">
          Add Product
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="">All categories</option>
          {meta?.categories.map((item) => (
            <option key={item.id} value={item.name}>{item.name}</option>
          ))}
        </select>
        <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Brand" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          {PRODUCT_STATUSES.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="-id">Newest</option>
          <option value="name">Name A-Z</option>
          <option value="-name">Name Z-A</option>
          <option value="price">Price low-high</option>
          <option value="-price">Price high-low</option>
          <option value="stock">Stock low-high</option>
          <option value="-stock">Stock high-low</option>
        </select>
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {isLoading ? <p className="text-sm text-slate-500">Loading products…</p> : null}
      {error ? <EmptyState title="Could not load products" body="Check your connection and try again." /> : null}
      {!isLoading && products.length === 0 ? (
        <EmptyState title="No products yet" body="Add milk, produce, packs, and variable-weight items from the Add Product button." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Sold by</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.brand || product.category}</p>
                  </td>
                  <td className="px-4 py-3">{unitLabel(product.selling_unit)}</td>
                  <td className="px-4 py-3">{product.stock_quantity} {unitLabel(product.stock_unit)}</td>
                  <td className="px-4 py-3">{product.price_display || `${formatMoney(product.price)}/${unitLabel(product.selling_unit)}`}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={product.approval_status === "pending" ? "Pending Approval" : inventoryLabel(product.inventory_status)}
                      tone={product.inventory_status === "out_of_stock" ? "danger" : product.inventory_status === "low_stock" ? "warning" : "success"}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" className="mr-3 text-emerald-700" onClick={() => openEdit(product)}>Edit</button>
                    <button type="button" className="text-rose-600" onClick={() => remove(product)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4">
          <form onSubmit={submit} className="w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold">{editing ? "Edit product" : "Add product"}</h2>
            <Panel title="Basic information">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Product Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
                <Field label="Brand" value={form.brand} onChange={(value) => setForm({ ...form, brand: value })} />
                <label className="md:col-span-2 text-sm">
                  Description
                  <textarea className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                </label>
                <label className="text-sm">
                  Category
                  <select required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value, subcategory: "" })}>
                    <option value="">Select</option>
                    {meta?.categories.map((item) => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Subcategory
                  <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.subcategory} onChange={(event) => setForm({ ...form, subcategory: event.target.value })}>
                    <option value="">None</option>
                    {children.map((item) => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </label>
              </div>
            </Panel>
            <Panel title="Product images">
              <input type="file" accept="image/*" multiple onChange={(event) => setFiles(event.target.files)} />
              <p className="mt-1 text-xs text-slate-500">Upload a main image and additional photos. Images are compressed before upload.</p>
            </Panel>
            <Panel title="Pricing & unit">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm">
                  Sold By
                  <select required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.selling_unit} onChange={(event) => setForm({ ...form, selling_unit: event.target.value })}>
                    {(meta?.selling_units || [{ value: "item", label: "Item" }, { value: "kg", label: "Kg" }]).map((unit) => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </label>
                <Field label={`Price per ${unitLabel(form.selling_unit)}`} value={form.price} onChange={(value) => setForm({ ...form, price: value })} required />
                <Field label={`Available quantity (${unitLabel(form.selling_unit)})`} value={form.stock_quantity} onChange={(value) => setForm({ ...form, stock_quantity: value })} required />
                <Field label="Low stock threshold" value={form.low_stock_threshold} onChange={(value) => setForm({ ...form, low_stock_threshold: value })} />
                <Field label="Pack weight (optional)" value={form.weight} onChange={(value) => setForm({ ...form, weight: value })} />
                <label className="text-sm">
                  Weight unit
                  <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" value={form.weight_unit} onChange={(event) => setForm({ ...form, weight_unit: event.target.value })}>
                    <option value="">None</option>
                    <option value="kg">Kg</option>
                    <option value="gram">Gram</option>
                    <option value="litre">Litre</option>
                    <option value="millilitre">Millilitre</option>
                    <option value="item">Item</option>
                  </select>
                </label>
              </div>
            </Panel>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.publish} onChange={(event) => setForm({ ...form, publish: event.target.checked })} />
              Publish product (uncheck to save as draft)
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" className="rounded-xl border px-4 py-2" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white" disabled={creating || updating}>
                {editing ? "Save changes" : "Save product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="text-sm">
      {label}
      <input
        required={required}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
