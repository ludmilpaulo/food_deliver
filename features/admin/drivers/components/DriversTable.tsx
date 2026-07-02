'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MdCheckCircle,
  MdBlock,
  MdLocationOn,
  MdChat,
  MdPhone,
  MdVisibility,
  MdDescription,
} from 'react-icons/md';

import type { DriverOpsRow } from '@/features/admin/drivers/types';
import {
  useApproveDriverMutation,
  useRejectDriverMutation,
  useSuspendDriverMutation,
} from '@/redux/slices/adminDriversOperationsApi';

import DriverVehicleModal from '@/features/admin/drivers/components/DriverVehicleModal';

const VEHICLE_STATUS_STYLES: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-800',
  pending_review: 'bg-amber-100 text-amber-800',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-red-100 text-red-800',
  expired_documents: 'bg-orange-100 text-orange-800',
};

const STATUS_STYLES: Record<string, string> = {
  online: 'bg-emerald-100 text-emerald-800',
  offline: 'bg-slate-100 text-slate-600',
  on_job: 'bg-blue-100 text-blue-800',
  pending_verification: 'bg-amber-100 text-amber-800',
  approved: 'bg-teal-100 text-teal-800',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-red-100 text-red-800',
  expired_documents: 'bg-orange-100 text-orange-800',
};

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

type DriversTableProps = {
  rows: DriverOpsRow[];
  loading?: boolean;
  error?: boolean;
  count: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  canApprove?: boolean;
  canSuspend?: boolean;
  canConfigureVehicle?: boolean;
  onRetry?: () => void;
};

export default function DriversTable({
  rows,
  loading,
  error,
  count,
  page,
  pageSize,
  onPageChange,
  canApprove = false,
  canSuspend = false,
  canConfigureVehicle = false,
  onRetry,
}: DriversTableProps) {
  const [approveDriver] = useApproveDriverMutation();
  const [rejectDriver] = useRejectDriverMutation();
  const [suspendDriver] = useSuspendDriverMutation();
  const [actionError, setActionError] = useState<string | null>(null);
  const [vehicleModal, setVehicleModal] = useState<DriverOpsRow | null>(null);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  async function handleApprove(id: number) {
    setActionError(null);
    try {
      await approveDriver(id).unwrap();
    } catch {
      setActionError('Action failed. Check permissions and try again.');
    }
  }

  async function handleReject(id: number) {
    const reason = window.prompt('Rejection reason:');
    if (!reason?.trim()) return;
    setActionError(null);
    try {
      await rejectDriver({ id, reason: reason.trim() }).unwrap();
    } catch {
      setActionError('Reject failed.');
    }
  }

  async function handleSuspend(id: number) {
    const reason = window.prompt('Suspension reason:');
    if (!reason?.trim()) return;
    setActionError(null);
    try {
      await suspendDriver({ id, reason: reason.trim() }).unwrap();
    } catch {
      setActionError('Suspend failed.');
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-700 ring-1 ring-red-100">
        <p>Failed to load drivers. Sign in as a platform admin if your session expired.</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (loading && rows.length === 0) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (!loading && rows.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100 sm:rounded-2xl sm:p-10">
        No drivers found for the selected filters.
      </div>
    );
  }

  return (
    <>
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden sm:rounded-2xl">
      {actionError && (
        <div className="bg-red-50 px-3 py-2 text-xs text-red-700 sm:px-4 sm:text-sm">{actionError}</div>
      )}

      {/* Mobile card list */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="p-3">
            <div className="flex items-start gap-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-200">
                {row.avatar_url ? (
                  <Image src={row.avatar_url} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-500">
                    {row.full_name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{row.full_name}</p>
                    <p className="text-xs text-slate-400">{row.id}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[row.status] ?? STATUS_STYLES.offline}`}>
                    {row.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                    {row.vehicle_type_label || row.vehicle_type || '—'}
                  </span>
                  <span className="text-[10px] text-slate-500">{row.service_usages_label || '—'}</span>
                  {row.taxi_category_label && (
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] text-purple-700">
                      {row.taxi_category_label}
                    </span>
                  )}
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600">
                  <div><dt className="inline text-slate-400">Phone: </dt><dd className="inline">{row.phone || '—'}</dd></div>
                  <div><dt className="inline text-slate-400">Plate: </dt><dd className="inline">{row.plate_number || '—'}</dd></div>
                  <div><dt className="inline text-slate-400">Rating: </dt><dd className="inline">★ {row.rating.toFixed(2)}</dd></div>
                  <div><dt className="inline text-slate-400">Jobs: </dt><dd className="inline">{row.completed_jobs}</dd></div>
                </dl>
                <div className="mt-2 flex flex-wrap items-center gap-1 text-slate-500">
                  {canConfigureVehicle && (
                    <button
                      type="button"
                      title="Configure vehicle"
                      onClick={() => setVehicleModal(row)}
                      className="rounded p-1.5 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <MdDescription />
                    </button>
                  )}
                  {row.phone && (
                    <a href={`tel:${row.phone}`} title="Call" className="rounded p-1.5 hover:bg-slate-100 hover:text-blue-600">
                      <MdPhone />
                    </a>
                  )}
                  <button type="button" title="Track live" className="rounded p-1.5 hover:bg-slate-100 hover:text-blue-600">
                    <MdLocationOn />
                  </button>
                  {canApprove && row.status === 'pending_verification' && (
                    <button
                      type="button"
                      title="Approve"
                      onClick={() => void handleApprove(row.driver_id)}
                      className="rounded p-1.5 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <MdCheckCircle />
                    </button>
                  )}
                  {canSuspend && (
                    <button
                      type="button"
                      title="Suspend"
                      onClick={() => void handleSuspend(row.driver_id)}
                      className="rounded p-1.5 hover:bg-red-50 hover:text-red-600"
                    >
                      <MdBlock />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Service usage</th>
              <th className="px-4 py-3">Taxi</th>
              <th className="px-4 py-3">Vehicle status</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Plate</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-200">
                      {row.avatar_url ? (
                        <Image src={row.avatar_url} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-500">
                          {row.full_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{row.full_name}</p>
                      <p className="text-xs text-slate-400">{row.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{row.vehicle_type_label || row.vehicle_type || '—'}</td>
                <td className="px-4 py-3 text-xs">{row.service_usages_label || '—'}</td>
                <td className="px-4 py-3">{row.taxi_category_label || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${VEHICLE_STATUS_STYLES[row.vehicle_status ?? 'pending_review'] ?? VEHICLE_STATUS_STYLES.pending_review}`}>
                    {(row.vehicle_status ?? 'pending_review').replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">{row.country || '—'}</td>
                <td className="px-4 py-3">{row.city || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.phone || '—'}</td>
                <td className="px-4 py-3">{row.plate_number || '—'}</td>
                <td className="px-4 py-3">★ {row.rating.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[row.status] ?? STATUS_STYLES.offline}`}>
                    {row.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-slate-500">
                    {canConfigureVehicle && (
                      <button
                        type="button"
                        title="Configure vehicle"
                        onClick={() => setVehicleModal(row)}
                        className="rounded p-1 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <MdDescription />
                      </button>
                    )}
                    <button type="button" title="Track live" className="rounded p-1 hover:bg-slate-100 hover:text-blue-600">
                      <MdLocationOn />
                    </button>
                    {row.phone && (
                      <a href={`tel:${row.phone}`} title="Call" className="rounded p-1 hover:bg-slate-100 hover:text-blue-600">
                        <MdPhone />
                      </a>
                    )}
                    {canApprove && row.status === 'pending_verification' && (
                      <button
                        type="button"
                        title="Approve"
                        onClick={() => void handleApprove(row.driver_id)}
                        className="rounded p-1 hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <MdCheckCircle />
                      </button>
                    )}
                    {canSuspend && (
                      <button
                        type="button"
                        title="Suspend"
                        onClick={() => void handleSuspend(row.driver_id)}
                        className="rounded p-1 hover:bg-red-50 hover:text-red-600"
                      >
                        <MdBlock />
                      </button>
                    )}
                    {canApprove && row.status === 'pending_verification' && (
                      <button
                        type="button"
                        title="Reject"
                        onClick={() => void handleReject(row.driver_id)}
                        className="rounded px-1 text-xs text-red-600 hover:underline"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2 border-t border-slate-100 px-3 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3 sm:text-sm">
        <span className="text-center sm:text-left">
          {count.toLocaleString()} drivers · page {page} of {totalPages}
        </span>
        <div className="flex justify-center gap-2 sm:justify-end">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="min-w-[88px] rounded-lg border px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="min-w-[88px] rounded-lg border px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
    {vehicleModal && (
      <DriverVehicleModal
        open
        driverId={vehicleModal.driver_id}
        driverName={vehicleModal.full_name}
        countryId={vehicleModal.country_id ?? undefined}
        canEdit={canConfigureVehicle}
        onClose={() => setVehicleModal(null)}
      />
    )}
    </>
  );
}
