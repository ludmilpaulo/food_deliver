"use client";
import { useTranslation } from "@/hooks/useTranslation";

export default function RidesPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">{t("requestRide", "Request a Ride")}</h1>
      <p className="text-slate-400 mb-8">
        {t(
          "ridesSubtitle",
          "Use the Kudya mobile app for live ride tracking, upfront fares, and multiple ride types.",
        )}
      </p>
      <div className="bg-slate-800 rounded-2xl p-6">
        <p className="text-sm text-slate-300">
          {t(
            "ridesBody",
            "Economy, Comfort, Premium, and XL rides with secure payments and trip sharing.",
          )}
        </p>
      </div>
    </div>
  );
}
