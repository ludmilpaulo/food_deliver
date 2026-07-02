"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  fetchAdminModules,
  fetchAdminBusinessCategories,
  updateAdminModule,
  updateAdminBusinessCategory,
  type PlatformModuleAdmin,
  type BusinessCategoryAdmin,
} from "@/services/platformAdminApi";

type Tab = "modules" | "categories";

export default function PlatformModulesAdmin() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("modules");
  const [modules, setModules] = useState<PlatformModuleAdmin[]>([]);
  const [categories, setCategories] = useState<BusinessCategoryAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [mods, cats] = await Promise.all([
          fetchAdminModules(),
          fetchAdminBusinessCategories(),
        ]);
        if (cancelled) return;
        setModules(mods);
        setCategories(cats);
      } catch {
        if (!cancelled) {
          setError(t("adminLoadFailed", "Failed to load platform data."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
    // Load once on mount; `t` from useTranslation is recreated each render.
  }, []);

  const saveModule = async (item: PlatformModuleAdmin) => {
    setSavingId(item.id);
    try {
      await updateAdminModule(item.id, item);
    } catch {
      setError(t("adminSaveFailed", "Failed to save changes."));
    } finally {
      setSavingId(null);
    }
  };

  const saveCategory = async (item: BusinessCategoryAdmin) => {
    setSavingId(item.id);
    try {
      await updateAdminBusinessCategory(item.id, item);
    } catch {
      setError(t("adminSaveFailed", "Failed to save changes."));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-900">
        {t("platformControl", "Platform control")}
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        {t(
          "platformControlDesc",
          "Manage home modules, partner categories, and where they appear on web and mobile.",
        )}
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("modules")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "modules" ? "bg-blue-600 text-white" : "bg-white text-slate-700 shadow"
          }`}
        >
          {t("homeModules", "Home modules")}
        </button>
        <button
          type="button"
          onClick={() => setTab("categories")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "categories" ? "bg-blue-600 text-white" : "bg-white text-slate-700 shadow"
          }`}
        >
          {t("businessCategories", "Business categories")}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : tab === "modules" ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">{t("key", "Key")}</th>
                <th className="px-4 py-3">{t("name", "Name")}</th>
                <th className="px-4 py-3">{t("route", "Route")}</th>
                <th className="px-4 py-3">{t("sortOrder", "Order")}</th>
                <th className="px-4 py-3">{t("web", "Web")}</th>
                <th className="px-4 py-3">{t("mobile", "Mobile")}</th>
                <th className="px-4 py-3">{t("active", "Active")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-mono text-xs">{m.key}</td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full rounded border px-2 py-1"
                      value={m.name}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full rounded border px-2 py-1"
                      value={m.route}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((x) => (x.id === m.id ? { ...x, route: e.target.value } : x)),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      className="w-16 rounded border px-2 py-1"
                      value={m.sort_order}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((x) =>
                            x.id === m.id ? { ...x, sort_order: Number(e.target.value) } : x,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={m.available_on_web}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((x) =>
                            x.id === m.id ? { ...x, available_on_web: e.target.checked } : x,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={m.available_on_mobile}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((x) =>
                            x.id === m.id ? { ...x, available_on_mobile: e.target.checked } : x,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={m.is_active}
                      onChange={(e) =>
                        setModules((prev) =>
                          prev.map((x) =>
                            x.id === m.id ? { ...x, is_active: e.target.checked } : x,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      disabled={savingId === m.id}
                      onClick={() => void saveModule(m)}
                      className="rounded bg-blue-600 px-3 py-1 text-xs text-white disabled:opacity-50"
                    >
                      {savingId === m.id ? t("saving", "Saving…") : t("save", "Save")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">{t("slug", "Slug")}</th>
                <th className="px-4 py-3">{t("name", "Name")}</th>
                <th className="px-4 py-3">{t("dashboardRoute", "Dashboard")}</th>
                <th className="px-4 py-3">{t("sortOrder", "Order")}</th>
                <th className="px-4 py-3">{t("active", "Active")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full rounded border px-2 py-1"
                      value={c.name}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full rounded border px-2 py-1"
                      value={c.dashboard_route}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((x) =>
                            x.id === c.id ? { ...x, dashboard_route: e.target.value } : x,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      className="w-16 rounded border px-2 py-1"
                      value={c.sort_order}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((x) =>
                            x.id === c.id ? { ...x, sort_order: Number(e.target.value) } : x,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={c.is_active}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((x) =>
                            x.id === c.id ? { ...x, is_active: e.target.checked } : x,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      disabled={savingId === c.id}
                      onClick={() => void saveCategory(c)}
                      className="rounded bg-blue-600 px-3 py-1 text-xs text-white disabled:opacity-50"
                    >
                      {savingId === c.id ? t("saving", "Saving…") : t("save", "Save")}
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
