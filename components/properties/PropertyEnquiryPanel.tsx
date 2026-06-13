"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { baseAPI } from "@/services/types";
import { readAuthToken } from "@/lib/authToken";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  propertyId: number;
  listingType: string;
  propertyTitle: string;
};

const LISTING_LABELS: Record<string, string> = {
  rent_daily: "Rent per Day",
  rent_monthly: "Rent per Month",
  buy: "For Sale",
};

function enquiryTypeForListing(listingType: string): string {
  if (listingType === "buy") return "offer";
  return "rental_application";
}

function defaultMessage(listingType: string, title: string): string {
  if (listingType === "buy") {
    return `Hello, I am interested in purchasing "${title}". Please share next steps for viewing and making an offer.`;
  }
  if (listingType === "rent_monthly") {
    return `Hello, I would like to apply to rent "${title}" on a monthly basis. Please let me know availability and required documents.`;
  }
  return `Hello, I would like to rent "${title}" and check available dates. Please confirm pricing and booking steps.`;
}

export default function PropertyEnquiryPanel({ propertyId, listingType, propertyTitle }: Props) {
  const { t } = useTranslation();
  const [message, setMessage] = useState(() => defaultMessage(listingType, propertyTitle));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const actionLabel = useMemo(() => {
    if (listingType === "buy") return t("makeOffer", "Make an offer");
    if (listingType === "rent_monthly") return t("applyToRent", "Apply to rent");
    return t("requestToRent", "Request to rent");
  }, [listingType, t]);

  const loginNext = `/properties/${propertyId}`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const token = readAuthToken();
    if (!token) {
      setError(t("loginToEnquire", "Please sign in to send your request."));
      return;
    }
    if (message.trim().length < 10) {
      setError(t("enquiryMessageTooShort", "Please add a short message (at least 10 characters)."));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${baseAPI}/properties/${propertyId}/enquiry/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enquiry_type: enquiryTypeForListing(listingType),
          message: message.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(data.detail || data.message || t("enquiryFailed", "Could not send enquiry.")));
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("enquiryFailed", "Could not send enquiry."));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-xl font-bold text-emerald-900">{t("enquirySent", "Request sent")}</h2>
        <p className="mt-2 text-sm text-emerald-800">
          {t(
            "enquirySentHint",
            "The property owner will review your request and contact you through Kudya.",
          )}
        </p>
        <Link
          href="/properties"
          className="mt-4 inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
        >
          {t("backToSearch", "Back to search")}
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-teal-100 bg-teal-50/60 p-6">
      <h2 className="text-xl font-bold text-teal-900">
        {listingType === "buy"
          ? t("interestedInBuying", "Interested in buying?")
          : t("interestedInRenting", "Interested in renting?")}
      </h2>
      <p className="mt-1 text-sm text-teal-700">
        {LISTING_LABELS[listingType] ?? listingType} · {propertyTitle}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label className="block text-sm">
          <span className="font-medium text-teal-900">{t("yourMessage", "Your message")}</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </label>

        {error && (
          <p className="text-sm text-rose-700">
            {error}{" "}
            {!readAuthToken() && (
              <Link href={`/LoginScreenUser?next=${encodeURIComponent(loginNext)}`} className="font-semibold underline">
                {t("login", "Login")}
              </Link>
            )}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {submitting ? t("loading") : actionLabel}
          </button>
          {!readAuthToken() && (
            <Link
              href={`/LoginScreenUser?next=${encodeURIComponent(loginNext)}`}
              className="rounded-xl border border-teal-300 px-5 py-2.5 text-sm font-semibold text-teal-800 hover:bg-white"
            >
              {t("login", "Login")}
            </Link>
          )}
        </div>
      </form>
    </section>
  );
}
