"use client";
import React, { useEffect, useState } from "react";
import { fetchAllKYC, approveKYC, rejectKYC, type AdminKYC } from "@/services/adminMarketplaceApi";
import { useTranslation } from "@/hooks/useTranslation";

export default function KYCAdmin() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<AdminKYC[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchAllKYC();
      setList(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("failedToLoadKyc", "Failed to load KYC"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onApprove = async (id: number) => {
    await approveKYC(id);
    await load();
  };
  const onReject = async (id: number) => {
    const reason =
      prompt(t("reasonForRejection", "Reason for rejection?")) ||
      t("notSpecified", "Not specified");
    await rejectKYC(id, reason);
    await load();
  };

  if (loading) return <div>{t("loading")}</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">{t("kyc", "KYC")}</h2>
      <div className="space-y-3">
        {list.map((k) => (
          <div key={k.id} className="border rounded-xl p-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{k.parceiro_name || k.parceiro}</div>
              <div className="text-sm capitalize">{k.status}</div>
            </div>
            <div className="text-sm text-gray-600">{k.full_legal_name} · {k.id_document_type} · {k.id_document_number}</div>
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={() => onApprove(k.id)}>
                {t("approve", "Approve")}
              </button>
              <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={() => onReject(k.id)}>
                {t("reject", "Reject")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


