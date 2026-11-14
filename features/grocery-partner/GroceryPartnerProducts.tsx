"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGetGroceryMetaQuery, useGetGroceryProductsQuery } from "@/redux/slices/groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";
import {
  groceryCategoryLabel,
  partnerStatusTranslationKey,
  sellingUnitTranslationKey,
} from "@/utils/groceryUnits";
import PageSpinner from "@/components/ui/PageSpinner";
import { partnerStatus } from "./format";

export default function GroceryPartnerProducts() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [stock, setStock] = useState("");
  const filters = useMemo(() => {
    const params: Record<string, string> = {};
    if (q) params.q = q;
    if (category) params.category = category;
    // The API reads one stock/status filter; the stock filter wins when both are set.
    if (stock || status) params.stock = stock || status;
    return params;
  }, [q, category, status, stock]);
  const { data, isFetching, isError, refetch } = useGetGroceryProductsQuery(filters);
  const meta = useGetGroceryMetaQuery();
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
            <option key={item.id} value={String(item.id)}>{groceryCategoryLabel(t, item.slug, item.name)}</option>
          ))}
        </select>
        <select value={stock} onChange={(e) => setStock(e.target.value)} className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm">
          <option value="">{t("gpFilterStock")}</option>
          <option value="in_stock">{t("gpInStock")}</option>
          <option value="low_stock">{t("gpLowStock")}</option>
          <option value="out_of_stock">{t("gpOutOfStock")}</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm">
          <option value="">{t("gpFilterStatus")}</option>
          <option value="active">{t("gpActive")}</option>
          <option value="draft">{t("gpDraft")}</option>
          <option value="pending">{t("gpPendingApproval")}</option>
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
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0]} alt="" className="h-full w-full object-contain" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-xs text-[#6B7280]">{product.brand || product.category || ""}</p>
                  <p className="mt-1 text-sm font-bold">
                    {product.price_display || `${product.currency ?? ""} ${product.price}`}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {product.stock_quantity} {t(sellingUnitTranslationKey(product.selling_unit, "gp"))} · {t(partnerStatusTranslationKey(partnerStatus(product)))}
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
