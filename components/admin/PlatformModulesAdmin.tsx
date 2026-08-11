"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  createAdminModule,
  fetchAdminModules,
  fetchAdminBusinessCategories,
  updateAdminModule,
  updateAdminBusinessCategory,
  type PlatformModuleAdmin,
  type BusinessCategoryAdmin,
} from "@/services/platformAdminApi";

type Tab = "modules" | "categories";

const EMPTY_MODULE: Omit<PlatformModuleAdmin, "id"> = {
  key: "",
  name: "",
  slug: "",
  description: "",
  icon: "grid",
  icon_url: null,
  route: "/",
  gradient_start: "#2563EB",
  gradient_end: "#1D4ED8",
  color: "#2563EB",
  sort_order: 100,
  is_active: true,
  available_on_web: true,
  available_on_mobile: true,
  available_on_parceiro: true,
  requires_auth: false,
};

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 ${
        checked ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function PlatformChip({
  on,
  label,
  disabled,
  onToggle,
}: {
  on: boolean;
  label: string;
  disabled?: boolean;
  onToggle?: () => void;
}) {
  const interactive = typeof onToggle === "function";
  const className = `inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold tracking-wide transition ${
    on
      ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200"
      : "bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-200"
  } ${
    interactive
      ? "cursor-pointer hover:scale-[1.02] hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
      : ""
  }`;

  const content = (
    <>
      <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-blue-500" : "bg-slate-300"}`} />
      {label}
      {interactive && (
        <span className={`ml-0.5 text-[10px] ${on ? "text-blue-500" : "text-slate-400"}`}>
          {on ? "✓" : "+"}
        </span>
      )}
    </>
  );

  if (!interactive) {
    return <span className={className}>{content}</span>;
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`${label}: ${on ? "on" : "off"}`}
      disabled={disabled}
      onClick={onToggle}
      className={className}
      title={on ? `Disable on ${label}` : `Enable on ${label}`}
    >
      {content}
    </button>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

export default function PlatformModulesAdmin() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("modules");
  const [modules, setModules] = useState<PlatformModuleAdmin[]>([]);
  const [categories, setCategories] = useState<BusinessCategoryAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_MODULE);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mods, cats] = await Promise.all([
        fetchAdminModules(),
        fetchAdminBusinessCategories(),
      ]);
      setModules(mods);
      setCategories(cats);
    } catch {
      setError(t("adminLoadFailed", "Failed to load platform data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const active = modules.filter((m) => m.is_active).length;
    return {
      total: modules.length,
      active,
      inactive: modules.length - active,
      web: modules.filter((m) => m.is_active && m.available_on_web).length,
    };
  }, [modules]);

  const filteredModules = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return modules;
    return modules.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.key.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q),
    );
  }, [modules, query]);

  const patchModuleLocal = (id: number, patch: Partial<PlatformModuleAdmin>) => {
    setModules((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const flashSuccess = (message: string) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(null), 2500);
  };

  const saveModule = async (item: PlatformModuleAdmin) => {
    setSavingId(item.id);
    setError(null);
    try {
      const updated = await updateAdminModule(item.id, item);
      setModules((prev) => prev.map((x) => (x.id === item.id ? { ...x, ...updated } : x)));
      setEditingId(null);
      flashSuccess(t("serviceSaved", "Service updated."));
    } catch {
      setError(t("adminSaveFailed", "Failed to save changes."));
    } finally {
      setSavingId(null);
    }
  };

  const toggleActive = async (item: PlatformModuleAdmin) => {
    const next = !item.is_active;
    patchModuleLocal(item.id, { is_active: next });
    setSavingId(item.id);
    setError(null);
    try {
      const updated = await updateAdminModule(item.id, { is_active: next });
      setModules((prev) => prev.map((x) => (x.id === item.id ? { ...x, ...updated } : x)));
      flashSuccess(
        next
          ? t("serviceActivated", `${item.name || item.key} is now active.`)
          : t("serviceDeactivated", `${item.name || item.key} is now inactive.`),
      );
    } catch {
      patchModuleLocal(item.id, { is_active: item.is_active });
      setError(t("adminSaveFailed", "Failed to save changes."));
    } finally {
      setSavingId(null);
    }
  };

  const togglePlatform = async (
    item: PlatformModuleAdmin,
    field: "available_on_mobile" | "available_on_parceiro" | "available_on_web",
  ) => {
    const next = !item[field];
    patchModuleLocal(item.id, { [field]: next });
    setSavingId(item.id);
    setError(null);
    try {
      const updated = await updateAdminModule(item.id, { [field]: next });
      setModules((prev) => prev.map((x) => (x.id === item.id ? { ...x, ...updated } : x)));
      const platformLabel =
        field === "available_on_mobile"
          ? t("mobile", "Mobile")
          : field === "available_on_parceiro"
            ? t("parceiro", "Parceiro")
            : t("web", "Web");
      flashSuccess(
        next
          ? t("platformEnabled", `${item.name || item.key} enabled on ${platformLabel}.`)
          : t("platformDisabled", `${item.name || item.key} disabled on ${platformLabel}.`),
      );
    } catch {
      patchModuleLocal(item.id, { [field]: item[field] });
      setError(t("adminSaveFailed", "Failed to save changes."));
    } finally {
      setSavingId(null);
    }
  };

  const createModule = async () => {
    if (!draft.key.trim() || !draft.name.trim()) {
      setError(t("adminRequiredFields", "Name and key are required."));
      return;
    }
    setSavingId("create");
    setError(null);
    try {
      const payload = {
        ...draft,
        key: draft.key.trim().toLowerCase().replace(/\s+/g, "_"),
        slug: (draft.slug || draft.key).trim().toLowerCase().replace(/\s+/g, "-"),
      };
      const created = await createAdminModule(payload);
      setModules((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
      setCreating(false);
      setDraft(EMPTY_MODULE);
      flashSuccess(t("serviceCreated", "Service created."));
    } catch {
      setError(t("adminSaveFailed", "Failed to save changes."));
    } finally {
      setSavingId(null);
    }
  };

  const saveCategory = async (item: BusinessCategoryAdmin) => {
    setSavingId(item.id);
    setError(null);
    try {
      await updateAdminBusinessCategory(item.id, item);
      flashSuccess(t("categorySaved", "Category updated."));
    } catch {
      setError(t("adminSaveFailed", "Failed to save changes."));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-950 text-white shadow-[0_12px_28px_-18px_rgba(15,23,42,0.35)]">
        <div className="relative bg-[radial-gradient(900px_280px_at_10%_-30%,rgba(59,130,246,0.35),transparent),linear-gradient(135deg,#0b1220_0%,#12203a_55%,#1d4ed8_160%)] px-5 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
            {t("platformOps", "Platform operations")}
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("platformServices", "Platform services")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100/90">
                {t(
                  "platformControlDesc",
                  "Control which Kudya services appear on customer mobile, Parceiro, and web. Changes publish instantly — no app release required.",
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/20"
            >
              {t("refresh", "Refresh")}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t("totalServices", "Total services")} value={stats.total} accent="bg-slate-800" />
          <StatCard label={t("active", "Active")} value={stats.active} accent="bg-emerald-500" />
          <StatCard label={t("inactive", "Inactive")} value={stats.inactive} accent="bg-rose-400" />
          <StatCard label={t("liveOnWeb", "Live on web")} value={stats.web} accent="bg-blue-500" />
        </div>

        {(error || success) && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {error || success}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setTab("modules")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                tab === "modules"
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("platformServicesTab", "Services")}
              <span className="ml-2 rounded-md bg-white/20 px-1.5 py-0.5 text-[11px] tabular-nums">
                {modules.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("categories")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                tab === "categories"
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("businessCategories", "Business categories")}
              <span className="ml-2 rounded-md bg-white/15 px-1.5 py-0.5 text-[11px] tabular-nums">
                {categories.length}
              </span>
            </button>
          </div>

          {tab === "modules" && (
            <>
              <div className="relative min-w-[220px] flex-1">
                <input
                  className={inputClass}
                  placeholder={t("searchServices", "Search services…")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setCreating((v) => !v)}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
              >
                {creating ? t("cancel", "Cancel") : t("addService", "+ Add service")}
              </button>
            </>
          )}
        </div>

        {creating && tab === "modules" && (
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              {t("createService", "Create service")}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {t(
                "createServiceHint",
                "New services appear on clients after activation. Wire routes in each app for deep screens.",
              )}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Field label={t("name", "Name")}>
                <input
                  className={inputClass}
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </Field>
              <Field label={t("key", "Key")}>
                <input
                  className={`${inputClass} font-mono`}
                  placeholder="pharmacy"
                  value={draft.key}
                  onChange={(e) => setDraft((d) => ({ ...d, key: e.target.value }))}
                />
              </Field>
              <Field label={t("description", "Description")}>
                <input
                  className={inputClass}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                />
              </Field>
              <Field label={t("route", "Route")}>
                <input
                  className={inputClass}
                  value={draft.route}
                  onChange={(e) => setDraft((d) => ({ ...d, route: e.target.value }))}
                />
              </Field>
              <Field label={t("color", "Color")}>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-11 w-12 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                    value={draft.color}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        color: e.target.value,
                        gradient_start: e.target.value,
                      }))
                    }
                  />
                  <input
                    className={inputClass}
                    value={draft.color}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        color: e.target.value,
                        gradient_start: e.target.value,
                      }))
                    }
                  />
                </div>
              </Field>
              <Field label={t("sortOrder", "Order")}>
                <input
                  type="number"
                  className={inputClass}
                  value={draft.sort_order}
                  onChange={(e) => setDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))}
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                disabled={savingId === "create"}
                onClick={() => void createModule()}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {savingId === "create" ? t("saving", "Saving…") : t("createService", "Create service")}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-blue-200 border-t-blue-600" />
          </div>
        ) : tab === "modules" ? (
          <div className="space-y-3">
            {filteredModules.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
                {t("noServicesFound", "No services match your search.")}
              </div>
            ) : (
              filteredModules.map((m) => {
                const isEditing = editingId === m.id;
                return (
                  <article
                    key={m.id}
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                      isEditing
                        ? "border-blue-200 ring-2 ring-blue-100"
                        : "border-slate-200/90 hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6">
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-inner"
                        style={{
                          background: `linear-gradient(145deg, ${m.gradient_start || m.color}, ${
                            m.gradient_end || m.color
                          })`,
                        }}
                      >
                        {(m.name || m.key).slice(0, 1).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-semibold text-slate-900">
                            {m.name || m.key}
                          </h3>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500">
                            {m.key}
                          </span>
                          {!m.is_active && (
                            <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                              {t("hiddenFromPublic", "Hidden from public")}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                          {m.description || t("noDescription", "No description")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <PlatformChip
                            on={m.available_on_mobile}
                            label={t("mobile", "Mobile")}
                            disabled={savingId === m.id}
                            onToggle={() => void togglePlatform(m, "available_on_mobile")}
                          />
                          <PlatformChip
                            on={m.available_on_parceiro}
                            label={t("parceiro", "Parceiro")}
                            disabled={savingId === m.id}
                            onToggle={() => void togglePlatform(m, "available_on_parceiro")}
                          />
                          <PlatformChip
                            on={m.available_on_web}
                            label={t("web", "Web")}
                            disabled={savingId === m.id}
                            onToggle={() => void togglePlatform(m, "available_on_web")}
                          />
                          <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
                            {t("order", "Order")} {m.sort_order}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 md:flex-col md:items-end">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-500">
                            {m.is_active ? t("active", "Active") : t("inactive", "Inactive")}
                          </span>
                          <Toggle
                            checked={m.is_active}
                            disabled={savingId === m.id}
                            label={t("toggleActive", "Toggle active")}
                            onChange={() => void toggleActive(m)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingId(isEditing ? null : m.id)}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          {isEditing ? t("close", "Close") : t("edit", "Edit")}
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-5">
                        <div className="grid gap-6 lg:grid-cols-3">
                          <section className="space-y-3 lg:col-span-2">
                            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                              {t("basicInformation", "Basic information")}
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <Field label={t("name", "Name")}>
                                <input
                                  className={inputClass}
                                  value={m.name}
                                  onChange={(e) => patchModuleLocal(m.id, { name: e.target.value })}
                                />
                              </Field>
                              <Field label={t("description", "Description")}>
                                <input
                                  className={inputClass}
                                  value={m.description}
                                  onChange={(e) =>
                                    patchModuleLocal(m.id, { description: e.target.value })
                                  }
                                />
                              </Field>
                              <Field label={t("icon", "Icon name")}>
                                <input
                                  className={inputClass}
                                  value={m.icon}
                                  onChange={(e) => patchModuleLocal(m.id, { icon: e.target.value })}
                                />
                              </Field>
                              <Field label={t("route", "Route")}>
                                <input
                                  className={inputClass}
                                  value={m.route}
                                  onChange={(e) => patchModuleLocal(m.id, { route: e.target.value })}
                                />
                              </Field>
                              <Field label={t("color", "Color")}>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    className="h-11 w-12 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                                    value={m.color || "#2563EB"}
                                    onChange={(e) =>
                                      patchModuleLocal(m.id, {
                                        color: e.target.value,
                                        gradient_start: e.target.value,
                                      })
                                    }
                                  />
                                  <input
                                    className={inputClass}
                                    value={m.color}
                                    onChange={(e) =>
                                      patchModuleLocal(m.id, {
                                        color: e.target.value,
                                        gradient_start: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </Field>
                              <Field label={t("sortOrder", "Display order")}>
                                <input
                                  type="number"
                                  className={inputClass}
                                  value={m.sort_order}
                                  onChange={(e) =>
                                    patchModuleLocal(m.id, { sort_order: Number(e.target.value) })
                                  }
                                />
                              </Field>
                            </div>
                          </section>

                          <section className="space-y-3">
                            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                              {t("availability", "Availability")}
                            </h4>
                            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                              {(
                                [
                                  ["available_on_mobile", t("availableOnCustomerApp", "Customer app")],
                                  ["available_on_parceiro", t("availableOnParceiro", "Parceiro")],
                                  ["available_on_web", t("availableOnWeb", "Web")],
                                ] as const
                              ).map(([field, label]) => (
                                <div key={field} className="flex items-center justify-between gap-3">
                                  <span className="text-sm font-medium text-slate-700">{label}</span>
                                  <Toggle
                                    checked={Boolean(m[field])}
                                    onChange={() =>
                                      patchModuleLocal(m.id, { [field]: !m[field] })
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                disabled={savingId === m.id}
                                onClick={() => void saveModule(m)}
                                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                              >
                                {savingId === m.id ? t("saving", "Saving…") : t("save", "Save changes")}
                              </button>
                              <button
                                type="button"
                                onClick={() => void load()}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
                              >
                                {t("reset", "Reset")}
                              </button>
                            </div>
                          </section>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  <th className="px-4 py-3">{t("slug", "Slug")}</th>
                  <th className="px-4 py-3">{t("name", "Name")}</th>
                  <th className="px-4 py-3">{t("dashboardRoute", "Dashboard")}</th>
                  <th className="px-4 py-3">{t("sortOrder", "Order")}</th>
                  <th className="px-4 py-3 text-center">{t("parceiro", "Parceiro")}</th>
                  <th className="px-4 py-3 text-center">{t("active", "Active")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.slug}</td>
                    <td className="px-4 py-3">
                      <input
                        className={inputClass}
                        value={c.name}
                        onChange={(e) =>
                          setCategories((prev) =>
                            prev.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)),
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className={inputClass}
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
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className={`${inputClass} w-20`}
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
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={c.available_on_parceiro}
                          onChange={() =>
                            setCategories((prev) =>
                              prev.map((x) =>
                                x.id === c.id
                                  ? { ...x, available_on_parceiro: !x.available_on_parceiro }
                                  : x,
                              ),
                            )
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={c.is_active}
                          onChange={() =>
                            setCategories((prev) =>
                              prev.map((x) =>
                                x.id === c.id ? { ...x, is_active: !x.is_active } : x,
                              ),
                            )
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={savingId === c.id}
                        onClick={() => void saveCategory(c)}
                        className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
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
    </div>
  );
}
