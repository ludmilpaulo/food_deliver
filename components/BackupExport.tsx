"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BackupListFilters,
  BackupStatus,
  BackupSummary,
  BackupType,
  PlatformBackup,
  createBackup,
  deleteBackup,
  downloadBackup,
  fetchBackupSummary,
  fetchBackups,
  formatBytes,
} from "@/services/platformBackupApi";

const STATUS_STYLES: Record<BackupStatus, string> = {
  processing: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-red-100 text-red-800 border-red-200",
};

const TYPE_LABELS: Record<BackupType, string> = {
  full: "Full Backup",
  database: "Database Only",
  files: "Files Only",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function BackupExport() {
  const [summary, setSummary] = useState<BackupSummary | null>(null);
  const [backups, setBackups] = useState<PlatformBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<BackupType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BackupListFilters>({
    search: "",
    backup_type: "",
    status: "",
    date_from: "",
    date_to: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, backupData] = await Promise.all([
        fetchBackupSummary(),
        fetchBackups(filters),
      ]);
      setSummary(summaryData);
      setBackups(backupData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load backup data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const hasProcessing = backups.some((b) => b.status === "processing");
    if (!hasProcessing) return undefined;
    const interval = window.setInterval(() => {
      loadData();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [backups, loadData]);

  const handleCreate = async (backupType: BackupType) => {
    try {
      setCreating(backupType);
      setError(null);
      await createBackup({ backup_type: backupType });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create backup");
    } finally {
      setCreating(null);
    }
  };

  const handleDownload = async (backup: PlatformBackup) => {
    try {
      setError(null);
      await downloadBackup(backup.id, backup.name.replace(/[^\w\s-]/g, "").trim() || `backup-${backup.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  const handleDelete = async (backup: PlatformBackup) => {
    if (!window.confirm(`Delete backup "${backup.name}"? This cannot be undone.`)) return;
    try {
      setError(null);
      await deleteBackup(backup.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Backups",
        value: summary ? String(summary.total_backups) : "—",
        sub: summary ? `${summary.completed_backups} completed` : "",
        color: "from-slate-700 to-slate-900",
      },
      {
        label: "Last Backup Date",
        value: summary?.last_backup_date ? formatDate(summary.last_backup_date) : "Never",
        sub: "Most recent completed backup",
        color: "from-blue-600 to-blue-800",
      },
      {
        label: "Last Backup Size",
        value: summary ? formatBytes(summary.last_backup_size) : "—",
        sub: "Latest archive size",
        color: "from-violet-600 to-violet-800",
      },
      {
        label: "Storage Used",
        value: summary ? formatBytes(summary.storage_used_bytes) : "—",
        sub: "Total backup storage",
        color: "from-emerald-600 to-emerald-800",
      },
    ],
    [summary],
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
          System Management
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Backup &amp; Export</h1>
        <p className="text-slate-500 mt-2 max-w-3xl">
          Create secure backups of the entire Kudya platform — database records and uploaded files.
          Backups are stored privately and can only be downloaded by super administrators.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl bg-gradient-to-br ${card.color} text-white p-5 shadow-lg`}
          >
            <p className="text-sm opacity-90">{card.label}</p>
            <p className="text-2xl font-bold mt-1 break-words">{card.value}</p>
            {card.sub && <p className="text-xs opacity-75 mt-2">{card.sub}</p>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Create Backup</h2>
        <p className="text-sm text-slate-500 mb-5">
          Large backups run in the background so the platform stays responsive.
        </p>
        <div className="flex flex-wrap gap-3">
          {(["full", "database", "files"] as BackupType[]).map((type) => (
            <button
              key={type}
              type="button"
              disabled={creating !== null}
              onClick={() => handleCreate(type)}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow transition disabled:opacity-60 bg-slate-800 hover:bg-slate-900"
            >
              {creating === type ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              {type === "full" && "Create Full Backup"}
              {type === "database" && "Backup Database Only"}
              {type === "files" && "Backup Files Only"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Backup History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            <input
              type="search"
              placeholder="Search by name or creator..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.backup_type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, backup_type: e.target.value as BackupType | "" }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All types</option>
              <option value="full">Full Backup</option>
              <option value="database">Database Only</option>
              <option value="files">Files Only</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value as BackupStatus | "" }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters((prev) => ({ ...prev, date_from: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters((prev) => ({ ...prev, date_to: e.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : backups.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No backups found. Create your first backup above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-6 py-3 font-semibold">Backup Name</th>
                  <th className="px-6 py-3 font-semibold">Date Created</th>
                  <th className="px-6 py-3 font-semibold">Created By</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Size</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-medium text-slate-900">{backup.name}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(backup.created_at)}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {backup.created_by_name || backup.created_by_email || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{TYPE_LABELS[backup.backup_type]}</td>
                    <td className="px-6 py-4 text-slate-600">{backup.file_size_human || "—"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[backup.status]}`}
                      >
                        {backup.status === "processing" && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                        )}
                        {backup.status_label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={backup.status !== "completed"}
                          onClick={() => handleDownload(backup)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          disabled={backup.status === "processing"}
                          onClick={() => handleDelete(backup)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                      {backup.status === "failed" && backup.error_message && (
                        <p className="text-xs text-red-500 mt-1 max-w-xs text-right">{backup.error_message}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-6">
        Each backup archive contains a structured <code className="text-slate-600">database/data.json</code>,
        a <code className="text-slate-600">media/</code> folder, and a <code className="text-slate-600">metadata.json</code> file
        for future restore operations. All backup actions are recorded in the platform audit log.
      </p>
    </div>
  );
}
