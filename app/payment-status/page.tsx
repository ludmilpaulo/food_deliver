"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import api from "@/services/api";
import { useTranslation } from "@/hooks/useTranslation";
import { readPendingPayment } from "@/lib/pendingPayment";
import type { PaymentStatus as PaymentStatusCode } from "@/types/payments";

type PaymentStatus = {
  id: number;
  kudya_reference: string;
  status: PaymentStatusCode;
  raw_provider_status: string;
  amount: string;
  currency: string;
  rejection_reason?: string;
  service_type?: string;
  object_id?: number | null;
};

const ORDER_SERVICE_TYPES = new Set(["order", "food", "marketplace", "grocery", "groceries"]);

type Phase = "waiting" | "paid" | "refunded" | "failed";

const PAID = new Set(["paid", "completed"]);
const REFUNDED = new Set(["refunded", "partially_refunded"]);
const FAILED = new Set(["failed", "cancelled", "expired", "rejected"]);
const VERIFY_COOLDOWN_MS = 10000;

function phaseOf(status: string): Phase {
  if (PAID.has(status)) return "paid";
  if (REFUNDED.has(status)) return "refunded";
  if (FAILED.has(status)) return "failed";
  return "waiting";
}

function detailOf(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    if (detail) return detail;
  }
  return fallback;
}

const PHASE_STYLES: Record<Phase, string> = {
  waiting: "border-amber-200 bg-amber-50 text-amber-900",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-900",
  refunded: "border-sky-200 bg-sky-50 text-sky-900",
  failed: "border-red-200 bg-red-50 text-red-900",
};

function StatusBody() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const [reference, setReference] = useState(params.get("reference") || "");
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState("");
  const [signedOut, setSignedOut] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundBusy, setRefundBusy] = useState(false);
  const [refundMessage, setRefundMessage] = useState("");

  useEffect(() => {
    if (!reference) setReference(readPendingPayment());
  }, [reference]);

  const phase = payment ? phaseOf(payment.status) : "waiting";

  const verify = useCallback(async () => {
    if (!reference) return;
    setChecking(true);
    setCooldown(true);
    window.setTimeout(() => setCooldown(false), VERIFY_COOLDOWN_MS);
    try {
      const { data } = await api.post<PaymentStatus>("/api/payments/verify/", { reference });
      setPayment(data);
      setError("");
    } catch {
      /* lookup polling keeps showing the stored state */
    } finally {
      setChecking(false);
    }
  }, [reference]);

  useEffect(() => {
    if (reference) void verify();
  }, [reference, verify]);

  useEffect(() => {
    if (!reference || phase !== "waiting") return;
    let stopped = false;
    const pull = () => {
      api
        .get<PaymentStatus>("/api/payments/lookup/", { params: { reference } })
        .then((response) => {
          if (!stopped) {
            setPayment(response.data);
            setError("");
          }
        })
        .catch((err) => {
          if (stopped) return;
          const status = axios.isAxiosError(err) ? err.response?.status : undefined;
          if (status === 401 || status === 404) {
            setSignedOut(status === 401);
            setError(status === 404 ? t("paymentNotFound", "We could not find this payment on your account.") : "");
            stopped = true;
            window.clearInterval(timer);
            return;
          }
          setError(detailOf(err, t("paymentLookupFailed", "Payment status is unavailable.")));
        });
    };
    pull();
    const timer = window.setInterval(pull, 4000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [reference, phase, t]);

  const downloadReceipt = async () => {
    if (!payment) return;
    setDownloading(true);
    try {
      const { data } = await api.get<Blob>(`/api/payments/${payment.id}/receipt/`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${payment.kudya_reference}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(t("receiptUnavailable", "The receipt is not available yet."));
    } finally {
      setDownloading(false);
    }
  };

  const requestRefund = async () => {
    if (!payment) return;
    setRefundBusy(true);
    setRefundMessage("");
    try {
      const { data } = await api.post<{ kudya_reference: string }>(
        `/api/payments/${payment.id}/refund-request/`,
        { reason: refundReason.trim() || undefined },
      );
      setRefundOpen(false);
      setRefundReason("");
      setRefundMessage(
        `${t("refundRequested", "Refund requested. Kudya will review it before any money is returned.")} (${data.kudya_reference})`,
      );
    } catch (err) {
      setRefundMessage(detailOf(err, t("refundRequestFailed", "The refund request could not be sent.")));
    } finally {
      setRefundBusy(false);
    }
  };

  const authorizedOnly = payment?.raw_provider_status?.toUpperCase() === "AUTHORIZED" && phase === "waiting";
  const headline: Record<Phase, string> = {
    waiting: t("paymentWaiting", "Waiting for confirmation"),
    paid: t("paymentConfirmed", "Payment confirmed"),
    refunded: t("paymentRefunded", "Payment refunded"),
    failed: t("paymentNotCompleted", "Payment not completed"),
  };
  const explanation: Record<Phase, string> = {
    waiting: authorizedOnly
      ? t("paymentAuthorizedHint", "Your bank authorised the payment, but it has not been charged yet. This page updates automatically.")
      : t("paymentReturnHint", "Returning from the payment page does not confirm payment. Kudya confirms it directly with the provider."),
    paid: t("paymentConfirmedHint", "Kudya verified this payment with the provider."),
    refunded: t("paymentRefundedHint", "The refund was confirmed by the provider."),
    failed: t("paymentFailedHint", "No money was taken for this attempt. You can try again from your order or wallet."),
  };

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold">{t("paymentStatus", "Payment status")}</h1>
      {!reference ? (
        <p className="mt-6 text-sm text-slate-600">{t("missingReference", "Missing payment reference.")}</p>
      ) : null}
      {signedOut ? (
        <p className="mt-6 text-sm text-slate-700" role="status">
          {t("signInToViewPayment", "Sign in to see the status of this payment.")}{" "}
          <Link href="/LoginScreenUser" className="font-medium underline">
            {t("paymentSignIn", "Sign in")}
          </Link>
        </p>
      ) : null}
      {reference && !payment && !error && !signedOut ? (
        <p className="mt-6 text-sm text-slate-600" role="status">
          {t("loading", "Loading…")}
        </p>
      ) : null}
      {error ? (
        <p className="mt-6 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {payment ? (
        <section className={`mt-6 rounded-xl border p-4 ${PHASE_STYLES[phase]}`} aria-live="polite">
          <h2 className="text-lg font-semibold">{headline[phase]}</h2>
          <p className="mt-1 text-sm">{explanation[phase]}</p>
          {phase === "failed" && payment.rejection_reason ? (
            <p className="mt-1 text-sm">{payment.rejection_reason}</p>
          ) : null}
        </section>
      ) : null}
      {payment ? (
        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{t("reference", "Reference")}</dt>
            <dd className="break-all text-right font-mono">{payment.kudya_reference}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{t("amount", "Amount")}</dt>
            <dd>
              {payment.amount} {payment.currency}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{t("providerStatus", "Provider status")}</dt>
            <dd>{payment.raw_provider_status || "—"}</dd>
          </div>
        </dl>
      ) : null}
      {payment ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {phase === "waiting" ? (
            <button
              type="button"
              onClick={() => void verify()}
              disabled={checking || cooldown}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {checking ? t("checking", "Checking…") : t("checkAgain", "Check again")}
            </button>
          ) : null}
          {phase === "paid" || phase === "refunded" ? (
            <button
              type="button"
              onClick={() => void downloadReceipt()}
              disabled={downloading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {t("downloadReceipt", "Download receipt")}
            </button>
          ) : null}
          {phase === "paid" && !refundOpen ? (
            <button
              type="button"
              onClick={() => setRefundOpen(true)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
            >
              {t("requestRefund", "Request a refund")}
            </button>
          ) : null}
          {payment.object_id && ORDER_SERVICE_TYPES.has(payment.service_type ?? "") ? (
            <Link
              href={`/account/orders/${payment.object_id}${phase === "paid" ? "?confirmed=1" : ""}`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
            >
              {t("foodViewOrder", "View order")}
            </Link>
          ) : null}
          <Link href="/orders" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium">
            {t("viewOrders", "View orders")}
          </Link>
        </div>
      ) : null}
      {refundOpen ? (
        <div className="mt-4 space-y-3 rounded-xl border border-slate-200 p-4">
          <label htmlFor="refund-reason" className="block text-sm font-medium">
            {t("refundReason", "Reason for the refund")}
          </label>
          <textarea
            id="refund-reason"
            value={refundReason}
            maxLength={500}
            rows={3}
            onChange={(event) => setRefundReason(event.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void requestRefund()}
              disabled={refundBusy}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {t("sendRefundRequest", "Send request")}
            </button>
            <button type="button" onClick={() => setRefundOpen(false)} className="px-4 py-2 text-sm">
              {t("cancel", "Cancel")}
            </button>
          </div>
        </div>
      ) : null}
      {refundMessage ? (
        <p className="mt-4 text-sm text-slate-700" role="status">
          {refundMessage}
        </p>
      ) : null}
    </main>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<main className="p-8">…</main>}>
      <StatusBody />
    </Suspense>
  );
}
