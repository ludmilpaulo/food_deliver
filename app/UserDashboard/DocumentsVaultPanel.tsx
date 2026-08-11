"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { fetchMyPropertyDocuments } from "@/services/propertyApplicationApi";

type DocRow = {
  id: number;
  kind: string;
  title: string;
  status?: string;
  application_id?: number;
};

export default function DocumentsVaultPanel() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMyPropertyDocuments()
      .then((data) => {
        if (cancelled) return;
        const docs: DocRow[] = data.application_documents.map((d) => ({
          id: d.id,
          kind: "document",
          title: d.original_filename || d.document_type,
          status: d.status,
          application_id: d.application,
        }));
        const leases: DocRow[] = data.leases
          .filter((l) => l.status === "executed" || l.status === "pending_signatures" || Boolean(l.has_pdf))
          .map((l) => ({
            id: l.id,
            kind: "lease",
            title: l.property_title || l.document_id || `Lease #${l.id}`,
            status: l.status,
            application_id: l.application,
          }));
        setRows([...docs, ...leases]);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-blue-900">{t("documents")}</h2>
      {loading ? (
        <p className="text-slate-500">{t("loading")}</p>
      ) : rows.length === 0 ? (
        <p className="text-slate-500">{t("noDocumentsRequired")}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={`${row.kind}-${row.id}`} className="rounded-xl border px-4 py-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{row.title || row.kind}</span>
                {row.status && <span className="text-xs uppercase">{row.status}</span>}
              </div>
              {row.application_id ? (
                <Link
                  href={`/properties/applications/${row.application_id}`}
                  className="mt-1 inline-block text-teal-700"
                >
                  {t("viewApplication")}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
