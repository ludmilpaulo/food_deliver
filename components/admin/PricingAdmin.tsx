"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  fetchAdminPricingRules,
  fetchAdminCommissionRules,
  fetchAdminRideCategories,
  updateAdminPricingRule,
  createAdminPricingRule,
  updateAdminCommissionRule,
  createAdminCommissionRule,
  updateAdminRideCategory,
  type PricingRuleAdmin,
  type CommissionRuleAdmin,
  type RideCategoryAdmin,
} from "@/services/platformAdminApi";

type Tab = "pricing" | "rides" | "commissions";

const PLATFORM_SERVICE_TYPES: { value: string; label: string }[] = [
  { value: "doctor", label: "Doctor / Healthcare booking" },
  { value: "food", label: "Food delivery" },
  { value: "grocery", label: "Grocery delivery" },
  { value: "ride", label: "Ride hailing" },
  { value: "package", label: "Package delivery" },
  { value: "car_rental", label: "Car rental" },
  { value: "service", label: "Professional services" },
  { value: "accommodation", label: "Accommodation" },
  { value: "rental_lead", label: "Long-term rental lead" },
  { value: "property_sale", label: "Property sale lead" },
];

const emptyPricing: Partial<PricingRuleAdmin> = {
  service_type: "ride",
  ride_type: "economy",
  base_fare: "25",
  per_km_rate: "8",
  per_minute_rate: "1.5",
  minimum_fare: "35",
  delivery_base_fee: "20",
  service_fee_percent: "5",
  surge_enabled: false,
  is_active: true,
};

export default function PricingAdmin() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("commissions");
  const [pricingRules, setPricingRules] = useState<PricingRuleAdmin[]>([]);
  const [rideCategories, setRideCategories] = useState<RideCategoryAdmin[]>([]);
  const [commissions, setCommissions] = useState<CommissionRuleAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | "new" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rules, rides, comm] = await Promise.all([
        fetchAdminPricingRules(),
        fetchAdminRideCategories(),
        fetchAdminCommissionRules(),
      ]);
      setPricingRules(rules);
      setRideCategories(rides);
      setCommissions(comm);
    } catch {
      setError(
        t(
          "pricingLoadFailed",
          "Failed to load pricing. Finance admin or super admin role required.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const tabBtn = (id: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`rounded-lg px-4 py-2 text-sm font-medium ${
        tab === id ? "bg-blue-600 text-white" : "bg-white text-slate-700 shadow"
      }`}
    >
      {label}
    </button>
  );

  const serviceLabel = (value: string) =>
    PLATFORM_SERVICE_TYPES.find((item) => item.value === value)?.label ?? value;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-900">
        {t("pricingAndFees", "Pricing & fees")}
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        {t(
          "pricingAndFeesDesc",
          "Set base fares, per-km rates, ride categories, and platform service fees for each Kudya module.",
        )}
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {tabBtn("commissions", t("platformServiceFees", "Platform service fees"))}
        {tabBtn("pricing", t("servicePricing", "Service pricing"))}
        {tabBtn("rides", t("rideCategories", "Ride categories"))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : tab === "commissions" ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
            {t(
              "platformServiceFeesHelp",
              "Configure the platform/service fee shown to customers during checkout. Use percentage for a share of the booking amount, or fixed for a flat fee. Scope rules by country or city when needed. Doctor bookings use the Doctor / Healthcare rule.",
            )}
          </div>
          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white"
            onClick={async () => {
              setSavingId("new");
              try {
                const created = await createAdminCommissionRule({
                  service_type: "doctor",
                  fee_type: "percentage",
                  value: "5",
                  currency: "AOA",
                  is_active: true,
                });
                setCommissions((prev) => [...prev, created]);
              } catch {
                setError(t("adminSaveFailed", "Failed to save changes."));
              } finally {
                setSavingId(null);
              }
            }}
          >
            {t("addPlatformServiceFee", "Add platform service fee")}
          </button>
          <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">{t("service", "Service")}</th>
                  <th className="px-3 py-2">{t("countryId", "Country ID")}</th>
                  <th className="px-3 py-2">{t("cityId", "City ID")}</th>
                  <th className="px-3 py-2">{t("feeType", "Fee type")}</th>
                  <th className="px-3 py-2">{t("value", "Value")}</th>
                  <th className="px-3 py-2">{t("currency", "Currency")}</th>
                  <th className="px-3 py-2">{t("active", "Active")}</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-3 py-2">
                      <select
                        className="min-w-[220px] rounded border px-2 py-1"
                        value={c.service_type}
                        onChange={(e) =>
                          setCommissions((prev) =>
                            prev.map((x) =>
                              x.id === c.id ? { ...x, service_type: e.target.value } : x,
                            ),
                          )
                        }
                      >
                        {PLATFORM_SERVICE_TYPES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-slate-400">{serviceLabel(c.service_type)}</p>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-20 rounded border px-1 py-1"
                        value={c.country ?? ""}
                        placeholder="All"
                        onChange={(e) =>
                          setCommissions((prev) =>
                            prev.map((x) =>
                              x.id === c.id
                                ? {
                                    ...x,
                                    country: e.target.value ? Number(e.target.value) : null,
                                  }
                                : x,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-20 rounded border px-1 py-1"
                        value={c.city ?? ""}
                        placeholder="All"
                        onChange={(e) =>
                          setCommissions((prev) =>
                            prev.map((x) =>
                              x.id === c.id
                                ? { ...x, city: e.target.value ? Number(e.target.value) : null }
                                : x,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="rounded border px-1 py-1"
                        value={c.fee_type}
                        onChange={(e) =>
                          setCommissions((prev) =>
                            prev.map((x) =>
                              x.id === c.id ? { ...x, fee_type: e.target.value } : x,
                            ),
                          )
                        }
                      >
                        <option value="percentage">{t("percentageFee", "Percentage")}</option>
                        <option value="fixed">{t("fixedFee", "Fixed amount")}</option>
                        <option value="subscription">{t("subscriptionFee", "Subscription")}</option>
                        <option value="per_lead">{t("perLeadFee", "Per lead")}</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-24 rounded border px-1 py-1"
                        value={c.value}
                        onChange={(e) =>
                          setCommissions((prev) =>
                            prev.map((x) =>
                              x.id === c.id ? { ...x, value: e.target.value } : x,
                            ),
                          )
                        }
                      />
                      <p className="mt-1 text-xs text-slate-400">
                        {c.fee_type === "percentage"
                          ? t("percentOfBooking", "% of booking")
                          : t("flatAmount", "Flat fee")}
                      </p>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-16 rounded border px-1 py-1"
                        value={c.currency}
                        onChange={(e) =>
                          setCommissions((prev) =>
                            prev.map((x) =>
                              x.id === c.id ? { ...x, currency: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={c.is_active}
                        onChange={(e) =>
                          setCommissions((prev) =>
                            prev.map((x) =>
                              x.id === c.id ? { ...x, is_active: e.target.checked } : x,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
                        onClick={async () => {
                          setSavingId(c.id);
                          try {
                            await updateAdminCommissionRule(c.id, c);
                          } catch {
                            setError(t("adminSaveFailed", "Failed to save changes."));
                          } finally {
                            setSavingId(null);
                          }
                        }}
                      >
                        {t("save", "Save")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "pricing" ? (
        <div className="space-y-4">
          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white"
            onClick={async () => {
              setSavingId("new");
              try {
                const created = await createAdminPricingRule(emptyPricing);
                setPricingRules((prev) => [...prev, created]);
              } catch {
                setError(t("adminSaveFailed", "Failed to save changes."));
              } finally {
                setSavingId(null);
              }
            }}
          >
            {t("addPricingRule", "Add pricing rule")}
          </button>
          <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">{t("service", "Service")}</th>
                  <th className="px-3 py-2">{t("baseFare", "Base")}</th>
                  <th className="px-3 py-2">{t("perKm", "/km")}</th>
                  <th className="px-3 py-2">{t("perMinute", "/min")}</th>
                  <th className="px-3 py-2">{t("minimumFare", "Min")}</th>
                  <th className="px-3 py-2">{t("serviceFee", "Fee %")}</th>
                  <th className="px-3 py-2">{t("active", "Active")}</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {pricingRules.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">
                      <select
                        className="rounded border px-1 py-1"
                        value={r.service_type}
                        onChange={(e) =>
                          setPricingRules((prev) =>
                            prev.map((x) =>
                              x.id === r.id ? { ...x, service_type: e.target.value } : x,
                            ),
                          )
                        }
                      >
                        <option value="ride">ride</option>
                        <option value="food_delivery">food_delivery</option>
                        <option value="grocery_delivery">grocery_delivery</option>
                        <option value="package">package</option>
                        <option value="rental">rental</option>
                      </select>
                    </td>
                    {(["base_fare", "per_km_rate", "per_minute_rate", "minimum_fare", "service_fee_percent"] as const).map(
                      (field) => (
                        <td key={field} className="px-3 py-2">
                          <input
                            className="w-20 rounded border px-1 py-1"
                            value={r[field]}
                            onChange={(e) =>
                              setPricingRules((prev) =>
                                prev.map((x) =>
                                  x.id === r.id ? { ...x, [field]: e.target.value } : x,
                                ),
                              )
                            }
                          />
                        </td>
                      ),
                    )}
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={r.is_active}
                        onChange={(e) =>
                          setPricingRules((prev) =>
                            prev.map((x) =>
                              x.id === r.id ? { ...x, is_active: e.target.checked } : x,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        disabled={savingId === r.id}
                        className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
                        onClick={async () => {
                          setSavingId(r.id);
                          try {
                            await updateAdminPricingRule(r.id, r);
                          } catch {
                            setError(t("adminSaveFailed", "Failed to save changes."));
                          } finally {
                            setSavingId(null);
                          }
                        }}
                      >
                        {t("save", "Save")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">{t("name", "Name")}</th>
                <th className="px-3 py-2">{t("baseFare", "Base")}</th>
                <th className="px-3 py-2">{t("perKm", "/km")}</th>
                <th className="px-3 py-2">{t("perMinute", "/min")}</th>
                <th className="px-3 py-2">{t("minimumFare", "Min")}</th>
                <th className="px-3 py-2">{t("serviceFee", "Fee")}</th>
                <th className="px-3 py-2">{t("active", "Active")}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rideCategories.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-2">{c.name}</td>
                  {(["base_fare", "price_per_km", "price_per_minute", "minimum_fare", "service_fee"] as const).map(
                    (field) => (
                      <td key={field} className="px-3 py-2">
                        <input
                          className="w-20 rounded border px-1 py-1"
                          value={c[field]}
                          onChange={(e) =>
                            setRideCategories((prev) =>
                              prev.map((x) =>
                                x.id === c.id ? { ...x, [field]: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </td>
                    ),
                  )}
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={c.is_active}
                      onChange={(e) =>
                        setRideCategories((prev) =>
                          prev.map((x) =>
                            x.id === c.id ? { ...x, is_active: e.target.checked } : x,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
                      onClick={async () => {
                        setSavingId(c.id);
                        try {
                          await updateAdminRideCategory(c.id, c);
                        } catch {
                          setError(t("adminSaveFailed", "Failed to save changes."));
                        } finally {
                          setSavingId(null);
                        }
                      }}
                    >
                      {t("save", "Save")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
