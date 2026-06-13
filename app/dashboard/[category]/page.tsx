"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import {
  fetchBusinessCategories,
  fetchMyBusinessProfile,
  type BusinessCategory,
  type BusinessProfile,
} from "@/services/platformApi";
import { resolveProviderPortalTarget } from "@/lib/providerRoutes";

export default function DynamicBusinessDashboardPage() {
  const router = useRouter();
  const params = useParams<{ category: string }>();
  const { t, languageCode } = useTranslation();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const tokenRaw = window.localStorage.getItem("auth_token");
        if (!tokenRaw) {
          router.replace("/LoginScreenUser");
          return;
        }
        const token = JSON.parse(tokenRaw) as string;
        const [businessProfile, businessCategories] = await Promise.all([
          fetchMyBusinessProfile(token),
          fetchBusinessCategories(languageCode, "web"),
        ]);

        if (cancelled) return;
        setProfile(businessProfile);
        setCategories(businessCategories);

        const requested = params.category;
        const expected = businessProfile.dashboardRoute.split("/").pop();
        const portalTarget = resolveProviderPortalTarget(businessProfile.category);
        if (portalTarget.startsWith('/RestaurantDashboad') || portalTarget.startsWith('/PartnerDashboard')) {
          router.replace(portalTarget);
          return;
        }
        if (requested !== expected) {
          router.replace(businessProfile.dashboardRoute);
          return;
        }
        if (expected === "doctor") {
          router.replace("/dashboard/doctor");
        }
      } catch {
        if (!cancelled) {
          router.replace("/business");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [languageCode, params.category, router]);

  const category = useMemo(
    () => categories.find((item) => item.slug === profile?.category),
    [categories, profile?.category],
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t("loading", "Loading...")}</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900">{profile?.businessName || t("business", "Business")}</h1>
          <p className="text-sm text-slate-500 mt-1">{category?.description || ""}</p>
          <div className="mt-3 flex gap-2 flex-wrap">
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">{profile?.category}</span>
            <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
              {profile?.isApproved ? t("approved", "Approved") : t("pending", "Pending")}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">
              {profile?.isActive ? t("active", "Active") : t("inactive", "Inactive")}
            </span>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(category?.feature_keys || []).map((feature) => (
            <article key={feature} className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
              <h2 className="font-semibold text-slate-900">
                {t(`dashboardFeature.${feature}`, feature.replace(/_/g, " "))}
              </h2>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
