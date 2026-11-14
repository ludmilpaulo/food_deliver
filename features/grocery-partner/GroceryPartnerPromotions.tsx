"use client";

import { FormEvent, useState } from "react";
import {
  useCreateGroceryPromotionMutation,
  useGetGroceryProductsQuery,
  useGetGroceryPromotionsQuery,
} from "@/redux/slices/groceryPartnerApi";
import { useTranslation } from "@/hooks/useTranslation";
import PageSpinner from "@/components/ui/PageSpinner";
import { groceryDiscountTypeTranslationKey } from "@/utils/groceryUnits";

export default function GroceryPartnerPromotions() {
  const { t } = useTranslation();
  const { data, isFetching } = useGetGroceryPromotionsQuery();
  const products = useGetGroceryProductsQuery();
  const [createPromo] = useCreateGroceryPromotionMutation();
  const [title, setTitle] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [value, setValue] = useState("");
  const [productId, setProductId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await createPromo({
      title,
      discount_type: discountType,
      discount_value: Number(value),
      product: productId ? Number(productId) : null,
      start_date: start,
      end_date: end,
      is_active: true,
    }).unwrap();
    setTitle("");
    setValue("");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("gpPromotions")}</h1>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-5 md:grid-cols-2">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("gpCreatePromotion")} className="rounded-xl border border-[#E5E7EB] px-3 py-2" />
        <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="rounded-xl border border-[#E5E7EB] px-3 py-2">
          <option value="percentage">{t("gpDiscountPercent")}</option>
          <option value="fixed">{t("gpDiscountFixed")}</option>
          <option value="bogo">{t("gpDiscountBogo")}</option>
          <option value="multibuy">{t("gpDiscountMulti")}</option>
          <option value="weekly">{t("gpDiscountWeekly")}</option>
        </select>
        <input required value={value} onChange={(e) => setValue(e.target.value)} placeholder={t("gpPricePer")} className="rounded-xl border border-[#E5E7EB] px-3 py-2" />
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="rounded-xl border border-[#E5E7EB] px-3 py-2">
          <option value="">{t("gpProducts")}</option>
          {(products.data ?? []).map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <label className="text-sm text-[#6B7280]">
          {t("gpStartAt")}
          <input required type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2" />
        </label>
        <label className="text-sm text-[#6B7280]">
          {t("gpEndAt")}
          <input required type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2" />
        </label>
        <button type="submit" className="rounded-full bg-[#0B8F45] px-4 py-2 text-sm font-semibold text-white md:col-span-2">
          {t("gpCreatePromotion")}
        </button>
      </form>
      {isFetching || data === undefined ? (
        <PageSpinner color="green" />
      ) : (
      <ul className="space-y-2">
        {(data ?? []).map((promo) => (
          <li key={promo.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <p className="font-semibold">{promo.title}</p>
            <p className="text-sm text-[#6B7280]">
              {t(groceryDiscountTypeTranslationKey(promo.discount_type))} {promo.discount_value} · {promo.product_name || t("gpAll")}
            </p>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
