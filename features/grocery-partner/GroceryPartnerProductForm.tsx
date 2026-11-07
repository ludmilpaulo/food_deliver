"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useCreateGroceryPartnerProductMutation,
  useGetGroceryPartnerMetaQuery,
  useGetGroceryPartnerProductQuery,
  useUpdateGroceryPartnerProductMutation,
} from "./groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";
import type { GrocerySellingUnit } from "./types";
import { groceryCategoryTranslationKey, grocerySubcategoryTranslationKey, sellingUnitTranslationKey } from "@/utils/groceryUnits";
import PageSpinner from "@/components/ui/PageSpinner";

const UNIT_KEYS: Record<GrocerySellingUnit, string> = {
  item: "gpUnitItem",
  kg: "gpUnitKg",
  g: "gpUnitG",
  l: "gpUnitL",
  ml: "gpUnitMl",
  pack: "gpUnitPack",
  box: "gpUnitBox",
  bottle: "gpUnitBottle",
  dozen: "gpUnitDozen",
  tray: "gpUnitTray",
};

export default function GroceryPartnerProductForm({ mode }: { mode: "create" | "edit" }) {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const productId = mode === "edit" && params.id ? Number(params.id) : null;
  const existing = useGetGroceryPartnerProductQuery(productId ?? 0, { skip: !productId });
  const meta = useGetGroceryPartnerMetaQuery();
  const [createProduct, createState] = useCreateGroceryPartnerProductMutation();
  const [updateProduct, updateState] = useUpdateGroceryPartnerProductMutation();
  const product = existing.data;
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(product?.category_slug ?? "fresh-produce");
  const [subcategory, setSubcategory] = useState(product?.subcategory ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [sellingUnit, setSellingUnit] = useState<GrocerySellingUnit>(product?.selling_unit ?? "item");
  const [price, setPrice] = useState(product?.price ?? "");
  const [stock, setStock] = useState(product?.stock ?? "");
  const [weight, setWeight] = useState(product?.weight ?? "");
  const [weightUnit, setWeightUnit] = useState(product?.weight_unit ?? "");
  const [threshold, setThreshold] = useState(product?.low_stock_threshold ?? "10");
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setDescription(product.description);
    setCategory(product.category_slug || "fresh-produce");
    setSubcategory(product.subcategory);
    setBrand(product.brand);
    setSellingUnit(product.selling_unit);
    setPrice(String(product.price));
    setStock(String(product.stock));
    setWeight(product.weight ? String(product.weight) : "");
    setWeightUnit(product.weight_unit);
    setThreshold(String(product.low_stock_threshold));
  }, [product]);

  const selectedCategory = useMemo(
    () => meta.data?.categories.find((item) => item.slug === category),
    [meta.data, category],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const body = new FormData();
    body.set("name", name);
    body.set("description", description);
    body.set("category", selectedCategory?.name || category);
    body.set("subcategory", subcategory);
    body.set("brand", brand);
    body.set("selling_unit", sellingUnit);
    body.set("price", price);
    body.set("stock", stock);
    body.set("low_stock_threshold", threshold);
    if (weight) body.set("weight", weight);
    if (weightUnit) body.set("weight_unit", weightUnit);
    if (file) body.set("image", file);
    try {
      if (productId) {
        await updateProduct({ id: productId, body }).unwrap();
      } else {
        await createProduct(body).unwrap();
      }
      router.push("/provider/grocery/products");
    } catch {
      setError(t("gpLoadError"));
    }
  }

  if (productId && (existing.isFetching || existing.isLoading)) {
    return <PageSpinner color="green" />;
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{productId ? t("gpProducts") : t("gpAddProduct")}</h1>
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="mb-3 font-semibold">{t("gpBasicInfo")}</h2>
        <div className="grid gap-3">
          <label className="text-sm">
            {t("gpProductName")}
            <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2" />
          </label>
          <label className="text-sm">
            {t("gpDescription")}
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2" rows={3} />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              {t("gpCategory")}
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2">
                {(meta.data?.categories ?? []).map((item) => (
                    <option key={item.slug} value={item.slug}>{t(groceryCategoryTranslationKey(item.slug), item.name)}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              {t("gpSubcategory")}
              <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2">
                <option value="">{t("gpAll")}</option>
                {(selectedCategory?.subcategories ?? []).map((item) => (
                    <option key={item} value={item}>{t(grocerySubcategoryTranslationKey(item), item)}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="text-sm">
            {t("gpBrand")}
            <input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2" />
          </label>
        </div>
      </section>
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="mb-3 font-semibold">{t("gpImages")}</h2>
        <label className="block text-sm text-[#6B7280]">
          {t("gpChooseImage")}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm text-[#111827]"
          />
        </label>
      </section>
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="mb-3 font-semibold">{t("gpPricingUnit")}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            {t("gpSoldBy")}
            <select
              value={sellingUnit}
              onChange={(e) => setSellingUnit(e.target.value as GrocerySellingUnit)}
              className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2"
            >
              {(meta.data?.selling_units ?? []).map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {t(UNIT_KEYS[unit.value], unit.label)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            {t("gpPricePer")} ({t(UNIT_KEYS[sellingUnit])})
            <input required value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2" />
          </label>
          <label className="text-sm">
            {t("gpAvailableQty")}
            <input required value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2" />
          </label>
          <label className="text-sm">
            {t("gpLowStockThreshold")}
            <input value={threshold} onChange={(e) => setThreshold(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2" />
          </label>
          <label className="text-sm">
            {t("gpWeight")}
            <input value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2" />
          </label>
          <label className="text-sm">
            {t("gpWeightUnit")}
            <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2">
              <option value="">{t("gpAll")}</option>
              {(meta.data?.weight_units ?? []).map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {t(sellingUnitTranslationKey(unit.value, "gp"), unit.label)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={createState.isLoading || updateState.isLoading}
        className="rounded-full bg-[#0B8F45] px-6 py-3 text-sm font-semibold text-white hover:bg-[#056B34] disabled:opacity-60"
      >
        {t("gpSaveProduct")}
      </button>
    </form>
  );
}
