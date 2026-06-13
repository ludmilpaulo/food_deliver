"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { supportedLocales, type SupportedLocale } from "@/configs/translations";
import {
  fetchAdminTranslations,
  createAdminTranslation,
  updateAdminTranslation,
  deleteAdminTranslation,
  invalidateTranslationCache,
  type TranslationAdmin,
} from "@/services/platformAdminApi";

const MODULES = ["common", "admin", "platform", "module"];

export default function TranslationsAdmin() {
  const { t, languageCode } = useTranslation();
  const [filterLang, setFilterLang] = useState(languageCode);
  const [filterModule, setFilterModule] = useState("admin");
  const [rows, setRows] = useState<TranslationAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ key: "", value: "", module: "admin" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminTranslations({
        language: filterLang,
        module: filterModule,
      });
      setRows(data);
    } catch {
      setError(t("translationsLoadFailed", "Failed to load translations."));
    } finally {
      setLoading(false);
    }
  }, [filterLang, filterModule, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveRow = async (row: TranslationAdmin) => {
    try {
      await updateAdminTranslation(row.id, row);
      invalidateTranslationCache(row.language);
    } catch {
      setError(t("adminSaveFailed", "Failed to save changes."));
    }
  };

  const addRow = async () => {
    if (!draft.key.trim() || !draft.value.trim()) return;
    try {
      const created = await createAdminTranslation({
        key: draft.key.trim(),
        value: draft.value.trim(),
        language: filterLang,
        module: draft.module || filterModule,
        is_active: true,
      });
      setRows((prev) => [...prev, created]);
      setDraft({ key: "", value: "", module: filterModule });
      invalidateTranslationCache(filterLang);
    } catch {
      setError(t("adminSaveFailed", "Failed to save changes."));
    }
  };

  const removeRow = async (id: number) => {
    try {
      await deleteAdminTranslation(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      invalidateTranslationCache(filterLang);
    } catch {
      setError(t("adminDeleteFailed", "Failed to delete."));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-900">
        {t("translationsAdmin", "Translations")}
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        {t(
          "translationsAdminDesc",
          "Manage platform copy in English, Portuguese, French, and Spanish. Changes apply to web and mobile apps.",
        )}
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm">
          {t("language", "Language")}
          <select
            className="rounded border px-2 py-1"
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value as SupportedLocale)}
          >
            {supportedLocales.map((loc) => (
              <option key={loc} value={loc}>
                {loc.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          {t("module", "Module")}
          <select
            className="rounded border px-2 py-1"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            {MODULES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-6 rounded-xl bg-white p-4 shadow">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">
          {t("addTranslation", "Add translation")}
        </h3>
        <div className="flex flex-wrap gap-2">
          <input
            placeholder={t("translationKey", "Key e.g. admin.dashboard")}
            className="min-w-[200px] flex-1 rounded border px-3 py-2 text-sm"
            value={draft.key}
            onChange={(e) => setDraft((d) => ({ ...d, key: e.target.value }))}
          />
          <input
            placeholder={t("translationValue", "Translated text")}
            className="min-w-[200px] flex-[2] rounded border px-3 py-2 text-sm"
            value={draft.value}
            onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => void addRow()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white"
          >
            {t("add", "Add")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">{t("key", "Key")}</th>
                <th className="px-4 py-3">{t("translationValue", "Value")}</th>
                <th className="px-4 py-3">{t("active", "Active")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-mono text-xs">{row.key}</td>
                  <td className="px-4 py-2">
                    <textarea
                      className="w-full rounded border px-2 py-1"
                      rows={2}
                      value={row.value}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === row.id ? { ...x, value: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={row.is_active}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === row.id ? { ...x, is_active: e.target.checked } : x,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      type="button"
                      className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
                      onClick={() => void saveRow(row)}
                    >
                      {t("save", "Save")}
                    </button>
                    <button
                      type="button"
                      className="rounded bg-red-100 px-2 py-1 text-xs text-red-700"
                      onClick={() => void removeRow(row.id)}
                    >
                      {t("delete", "Delete")}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    {t("noTranslations", "No translations for this filter.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
