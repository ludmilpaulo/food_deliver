'use client';

import React from 'react';
import Link from 'next/link';

import type {
  ExpiringDocumentItem,
  IncidentItem,
  LiveInsights,
  PayoutSummary,
  PendingVerificationItem,
  TopDriverItem,
} from '@/features/admin/drivers/types';
import { adminPanelUrl } from '@/configs/adminNav';
import { useTranslation } from '@/hooks/useTranslation';

function PanelCard({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100 sm:rounded-2xl sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {footer}
      </div>
      {children}
    </div>
  );
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return iso;
  }
}

const RISK_STYLES = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-emerald-100 text-emerald-800',
};

type OperationsPanelProps = {
  insights?: LiveInsights;
  pending?: PendingVerificationItem[];
  expiring?: ExpiringDocumentItem[];
  incidents?: IncidentItem[];
  topDrivers?: TopDriverItem[];
  payout?: PayoutSummary;
  loading?: boolean;
  showInsights?: boolean;
  showPending?: boolean;
  showExpiring?: boolean;
  showIncidents?: boolean;
  showTopDrivers?: boolean;
  showPayouts?: boolean;
};

export default function OperationsPanel({
  insights,
  pending,
  expiring,
  incidents,
  topDrivers,
  payout,
  loading,
  showInsights = true,
  showPending = true,
  showExpiring = true,
  showIncidents = true,
  showTopDrivers = true,
  showPayouts = true,
}: OperationsPanelProps) {
  const { t } = useTranslation();

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
    ))}</div>;
  }

  return (
    <div className="space-y-4">
      {showInsights && insights && (
        <PanelCard title={t('liveInsights', 'Live Insights')}>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>{t('gpsActive', 'GPS Active')}</span><strong>{insights.gps_active}</strong></li>
            <li className="flex justify-between"><span>{t('offlineDrivers', 'Offline Drivers')}</span><strong>{insights.offline_drivers}</strong></li>
            <li className="flex justify-between"><span>{t('highDemandZones', 'High Demand Zones')}</span><strong>{insights.high_demand_zones}</strong></li>
            <li className="flex justify-between"><span>{t('emergencyAlerts', 'Emergency Alerts')}</span><strong className="text-red-600">{insights.emergency_alerts}</strong></li>
          </ul>
          <a
            href="#live-driver-map"
            className="mt-3 block w-full rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
          >
            {t('viewLiveTracking', 'View Live Tracking')}
          </a>
        </PanelCard>
      )}

      {showPending && (
        <PanelCard
          title={t('pendingVerifications', 'Pending Verifications')}
          footer={
            <Link href={adminPanelUrl('driverVerification')} className="text-xs text-blue-600 hover:underline">
              {t('viewAll', 'View all')}
            </Link>
          }
        >
          {(pending ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">No pending verifications.</p>
          ) : (
            <ul className="space-y-3">
              {(pending ?? []).slice(0, 5).map((item) => (
                <li key={item.driver_id} className="text-sm">
                  <p className="font-medium text-slate-800">{item.full_name}</p>
                  <p className="text-xs text-slate-500">
                    {item.service_type} · {item.country}
                  </p>
                  {item.missing_documents.length > 0 && (
                    <p className="text-xs text-amber-700">Missing: {item.missing_documents.join(', ')}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
      )}

      {showExpiring && (
      <PanelCard title="Expiring Documents">
        {(expiring ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No documents expiring soon.</p>
        ) : (
          <ul className="space-y-2">
            {(expiring ?? []).slice(0, 5).map((item, idx) => (
              <li key={`${item.driver_id}-${idx}`} className="flex items-start justify-between gap-2 text-sm">
                <div>
                  <p className="font-medium">{item.full_name}</p>
                  <p className="text-xs text-slate-500">{item.document_type.replace(/_/g, ' ')}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${RISK_STYLES[item.risk]}`}>
                  {item.days_remaining}d
                </span>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>
      )}

      {showIncidents && (
      <PanelCard title="Incident Reports">
        {(incidents ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No recent incidents.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {(incidents ?? []).slice(0, 5).map((inc) => (
              <li key={inc.id}>
                <p className="font-medium">{inc.incident_type}</p>
                <p className="text-xs text-slate-500">{inc.location} · {timeAgo(inc.created_at)}</p>
                <span className="text-xs capitalize text-red-600">{inc.severity}</span>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>
      )}

      {showTopDrivers && (
      <PanelCard title="Top Performing Drivers">
        {(topDrivers ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No performance data yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {(topDrivers ?? []).map((d) => (
              <li key={d.driver_id} className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {d.rank}
                </span>
                <div>
                  <p className="font-medium">{d.full_name}</p>
                  <p className="text-xs text-slate-500">
                    {d.city}, {d.country} · ★ {d.rating.toFixed(2)} · {d.completed_jobs} jobs
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>
      )}

      {showPayouts && (
      <PanelCard title="Earnings & Payout Summary">
        {payout ? (
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Gross Earnings</span><strong>${payout.gross_earnings.toLocaleString()}</strong></li>
            <li className="flex justify-between"><span>Net Earnings</span><strong>${payout.net_earnings.toLocaleString()}</strong></li>
            <li className="flex justify-between"><span>Payouts Made</span><strong>${payout.payouts_made.toLocaleString()}</strong></li>
            <li className="flex justify-between"><span>Pending Payouts</span><strong className="text-amber-600">${payout.pending_payouts.toLocaleString()}</strong></li>
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No payout data.</p>
        )}
      </PanelCard>
      )}
    </div>
  );
}
