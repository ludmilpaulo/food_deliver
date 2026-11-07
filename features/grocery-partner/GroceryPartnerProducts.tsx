"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGetGroceryPartnerMetaQuery, useGetGroceryPartnerProductsQuery } from "./groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";
import {
  groceryCategoryTranslationKey,
  partnerStatusTranslationKey,
  sellingUnitTranslationKey,
} from "@/utils/groceryUnits";
import PageSpinner from "@/components/ui/PageSpinner";

export default function GroceryPartnerProducts() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [stock, setStock] = useState("");
  const filters = useMemo(
    () => ({
      q: q || undefined,
      category: category || undefined,
      status: status || undefined,
      stock: stock || undefined,
    }),
    [q, category, status, stock],
  );
  const { data, isFetching, isError, refetch } = useGetGroceryPartnerProductsQuery(filters);
  const meta = useGetGroceryPartnerMetaQuery();
  const products = data ?? [];
  const pending = !isError && (isFetching || data === undefined);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("gpProducts")}</h1>
        <Link
          href="/provider/grocery/products/new"
          className="rounded-full bg-[#0B8F45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#056B34]"
        >
          {t("gpAddProduct")}
        </Link>
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("gpSearchProducts")}
          className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm">
          <option value="">{t("gpFilterCategory")}</option>
          {(meta.data?.categories ?? []).map((item) => (
            <option key={item.slug} value={item.slug}>{t(groceryCategoryTranslationKey(item.slug), item.name)}</option>
          ))}
        </select>
        <select value={stock} onChange={(e) => setStock(e.target.value)} className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm">
          <option value="">{t("gpFilterStock")}</option>
          <option value="in">{t("gpInStock")}</option>
          <option value="low">{t("gpLowStock")}</option>
          <option value="out">{t("gpOutOfStock")}</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm">
          <option value="">{t("gpFilterStatus")}</option>
          <option value="active">{t("gpActive")}</option>
          <option value="low_stock">{t("gpLowStockStatus")}</option>
          <option value="out_of_stock">{t("gpOutOfStock")}</option>
          <option value="pending_approval">{t("gpPendingApproval")}</option>
          <option value="inactive">{t("gpInactive")}</option>
        </select>
      </div>
      {pending ? (
        <PageSpinner color="green" />
      ) : isError ? (
        <button type="button" onClick={() => void refetch()} className="text-[#0B8F45]">{t("gpTryAgain")}</button>
      ) : products.length === 0 ? (
        <p className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center text-[#6B7280]">{t("gpEmptyProducts")}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/provider/grocery/products/${product.id}`}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-4 hover:border-[#0B8F45]"
            >
              <div className="flex gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-[#F8FAF9]">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image} alt="" className="h-full w-full object-contain" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-xs text-[#6B7280]">
                    {product.brand || t(groceryCategoryTranslationKey(product.category_slug), product.category_name)}
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {product.currency} {product.price_per_unit} / {t(sellingUnitTranslationKey(product.selling_unit, "gp")).toLowerCase()}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {product.stock} {t(sellingUnitTranslationKey(product.selling_unit, "gp"))} · {t(partnerStatusTranslationKey(product.partner_status))}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
