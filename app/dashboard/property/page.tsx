"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { baseAPI } from "@/services/api";
import { readAuthToken } from "@/lib/authToken";
import type { PropertyDashboardTab, PropertyListing, PartnerStayBooking, PropertyAvailabilityDay, PropertyBlockedDate } from "@/types/property";
import { usePropertyTranslation } from "@/hooks/usePropertyTranslation";
import {
  useGetPropertyDashboardQuery,
  useGetPropertyEnquiriesQuery,
  useGetPropertyListingsQuery,
  useUpdatePropertyEnquiryStatusMutation,
  useUpdatePropertyListingMutation,
} from "@/redux/slices/propertyApi";
import PropertyAnalyticsCharts from "@/components/property/PropertyAnalyticsCharts";
import PropertyAddWizard from "@/components/property/PropertyAddWizard";
import PartnerApplicationReview from "@/components/property/PartnerApplicationReview";
import type { AnalyticsDays } from "@/components/analytics/AnalyticsDaysFilter";
import withPartnerAuth from "@/components/PartnerRouteGuard";
import {
  getListingUiStatus,
  listingPurpose,
  STATUS_BADGE_STYLES,
  STATUS_DOT_STYLES,
  type PropertyUiStatus,
} from "@/lib/propertyUi";

type StatusTab = "all" | PropertyUiStatus;
type PurposeFilter = "all" | "rent" | "stay" | "sale";
type EnquiryTab = "all" | "new" | "responded" | "closed";
type ApplicationTab = "all" | "new" | "reviewing" | "approved" | "rejected";

type PropertyApplication = {
  id: number;
  property_title: string;
  property_city: string;
  status: string;
  proposed_rent: string | null;
  currency: string;
  submitted_at: string | null;
  created_at: string;
};

function applicationTab(status: string): Exclude<ApplicationTab, "all"> {
  if (status === "submitted") return "new";
  if (status === "rejected") return "rejected";
  if (status === "lease_executed" || status === "active") return "approved";
  return "reviewing";
}

function greetingKey(hour: number): "goodMorning" | "goodAfternoon" | "goodEvening" {
  if (hour < 12) return "goodMorning";
  if (hour < 18) return "goodAfternoon";
  return "goodEvening";
}

function StatusBadge({
  status,
  label,
}: {
  status: PropertyUiStatus;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_BADGE_STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_STYLES[status]}`} />
      {label}
    </span>
  );
}

function PropertyDashboardPage() {
  const router = useRouter();
  const {
    pt,
    listingTypeLabel,
    enquiryStatusLabel,
    enquiryTypeLabel,
  } = usePropertyTranslation();

  const [activeTab, setActiveTab] = useState<PropertyDashboardTab>("overview");
  const [days, setDays] = useState<AnalyticsDays>(7);
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [purpose, setPurpose] = useState<PurposeFilter>("all");
  const [search, setSearch] = useState("");
  const [enquiryTab, setEnquiryTab] = useState<EnquiryTab>("all");
  const [applicationTabFilter, setApplicationTabFilter] = useState<ApplicationTab>("all");
  const [applications, setApplications] = useState<PropertyApplication[]>([]);
  const [applicationsError, setApplicationsError] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [stayStats, setStayStats] = useState({ today: 0, upcoming: 0, thisMonth: 0 });
  const [stayBookings, setStayBookings] = useState<PartnerStayBooking[]>([]);
  const [stayBookingsLoading, setStayBookingsLoading] = useState(false);
  const [stayBookingsError, setStayBookingsError] = useState(false);
  const [availabilityListingId, setAvailabilityListingId] = useState<number | null>(null);
  const [availabilityDays, setAvailabilityDays] = useState<PropertyAvailabilityDay[]>([]);
  const [blockedDates, setBlockedDates] = useState<PropertyBlockedDate[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [blockStart, setBlockStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [blockEnd, setBlockEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [blockReason, setBlockReason] = useState("");
  const [blockBusy, setBlockBusy] = useState(false);

  const { data: stats, isLoading, isError, refetch } = useGetPropertyDashboardQuery(
    { days },
    { pollingInterval: 60000 },
  );
  const { data: listings = [] } = useGetPropertyListingsQuery(undefined, {
    skip:
      activeTab !== "listings" &&
      activeTab !== "overview" &&
      activeTab !== "add" &&
      activeTab !== "availability",
  });
  const { data: enquiries = [] } = useGetPropertyEnquiriesQuery(undefined, {
    skip: activeTab !== "enquiries" && activeTab !== "overview",
  });
  const [updateListing] = useUpdatePropertyListingMutation();
  const [updateEnquiryStatus] = useUpdatePropertyEnquiryStatusMutation();

  const stayListings = useMemo(
    () => listings.filter((item) => listingPurpose(item) === "stay"),
    [listings],
  );

  useEffect(() => {
    if (activeTab !== "applications") return;
    let active = true;
    const loadApplications = async () => {
      setApplicationsLoading(true);
      setApplicationsError(false);
      try {
        const token = readAuthToken();
        const response = await fetch(`${baseAPI}/api/properties/me/applications/`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Accept-Language": localStorage.getItem("language") || "en",
          },
        });
        if (!response.ok) throw new Error("Failed to load applications");
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid applications response");
        if (active) setApplications(data.filter((item): item is PropertyApplication => typeof item === "object" && item !== null));
      } catch {
        if (active) setApplicationsError(true);
      } finally {
        if (active) setApplicationsLoading(false);
      }
    };
    void loadApplications();
    return () => {
      active = false;
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "stayBookings") return;
    let active = true;
    const loadStayBookings = async () => {
      setStayBookingsLoading(true);
      setStayBookingsError(false);
      try {
        const token = readAuthToken();
        const response = await fetch(`${baseAPI}/api/properties/me/stay-bookings/`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Accept-Language": localStorage.getItem("language") || "en",
          },
        });
        if (!response.ok) throw new Error("Failed to load stay bookings");
        const data: unknown = await response.json();
        if (!data || typeof data !== "object") throw new Error("Invalid stay bookings response");
        const row = data as Record<string, unknown>;
        const statsRaw = (row.stats ?? {}) as Record<string, unknown>;
        const resultsRaw = Array.isArray(row.results) ? row.results : [];
        if (!active) return;
        setStayStats({
          today: typeof statsRaw.today === "number" ? statsRaw.today : 0,
          upcoming: typeof statsRaw.upcoming === "number" ? statsRaw.upcoming : 0,
          thisMonth: typeof statsRaw.this_month === "number" ? statsRaw.this_month : 0,
        });
        setStayBookings(
          resultsRaw
            .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
            .map((item) => ({
              id: Number(item.id) || 0,
              propertyId: Number(item.property_id) || 0,
              propertyTitle: String(item.property_title ?? ""),
              propertyCity: String(item.property_city ?? ""),
              bookingCode: String(item.booking_code ?? ""),
              checkIn: String(item.check_in ?? ""),
              checkOut: String(item.check_out ?? ""),
              nights: Number(item.nights) || 0,
              adults: Number(item.adults) || 0,
              children: Number(item.children) || 0,
              infants: Number(item.infants) || 0,
              status: String(item.status ?? ""),
              currency: String(item.currency ?? "AOA"),
              totalAmount: String(item.total_amount ?? "0"),
              guestName: String(item.guest_name ?? ""),
              guestNotes: String(item.guest_notes ?? ""),
              createdAt: String(item.created_at ?? ""),
            })),
        );
      } catch {
        if (active) setStayBookingsError(true);
      } finally {
        if (active) setStayBookingsLoading(false);
      }
    };
    void loadStayBookings();
    return () => {
      active = false;
    };
  }, [activeTab]);

  const loadAvailability = async (listingId: number) => {
    setAvailabilityLoading(true);
    setAvailabilityError(false);
    try {
      const token = readAuthToken();
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Accept-Language": localStorage.getItem("language") || "en",
        Accept: "application/json",
      };
      const from = new Date().toISOString().slice(0, 10);
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + 61);
      const to = toDate.toISOString().slice(0, 10);
      const [availRes, blockRes] = await Promise.all([
        fetch(`${baseAPI}/api/properties/${listingId}/availability/?from=${from}&to=${to}`, { headers }),
        fetch(`${baseAPI}/api/properties/me/listings/${listingId}/blocked-dates/`, { headers }),
      ]);
      if (!availRes.ok) throw new Error("availability failed");
      const availData: unknown = await availRes.json();
      const availRow = (availData ?? {}) as Record<string, unknown>;
      const daysRaw = Array.isArray(availRow.days) ? availRow.days : [];
      setAvailabilityDays(
        daysRaw
          .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
          .map((item) => ({
            date: String(item.date ?? ""),
            status: String(item.status ?? "available"),
            price: item.price == null || item.price === "" ? null : String(item.price),
            currency: String(item.currency ?? "AOA"),
          })),
      );
      if (blockRes.ok) {
        const blockData: unknown = await blockRes.json();
        const blocks = Array.isArray(blockData) ? blockData : [];
        setBlockedDates(
          blocks
            .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
            .map((item) => ({
              id: Number(item.id) || 0,
              startDate: String(item.start_date ?? ""),
              endDate: String(item.end_date ?? ""),
              reason: String(item.reason ?? ""),
              notes: String(item.notes ?? ""),
              createdAt: String(item.created_at ?? ""),
            })),
        );
      } else {
        setBlockedDates([]);
      }
    } catch {
      setAvailabilityError(true);
      setAvailabilityDays([]);
      setBlockedDates([]);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "availability") return;
    if (availabilityListingId == null && stayListings.length > 0) {
      setAvailabilityListingId(stayListings[0].id);
      return;
    }
    if (availabilityListingId != null) {
      void loadAvailability(availabilityListingId);
    }
  }, [activeTab, availabilityListingId, stayListings]);

  const statusLabel = (status: PropertyUiStatus) => {
    const map: Record<PropertyUiStatus, string> = {
      active: pt("statusActive"),
      pending: pt("statusPendingReview"),
      draft: pt("statusDraft"),
      inactive: pt("statusInactive"),
      rejected: pt("statusChangesRequired"),
      suspended: pt("statusSuspended"),
    };
    return map[status];
  };

  const counts = useMemo(() => {
    const base = {
      all: listings.length,
      active: 0,
      pending: 0,
      draft: 0,
      inactive: 0,
      rejected: 0,
      suspended: 0,
    };
    for (const item of listings) {
      base[getListingUiStatus(item)] += 1;
    }
    return base;
  }, [listings]);

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings.filter((item) => {
      const status = getListingUiStatus(item);
      if (statusTab === "pending") {
        if (status !== "pending" && status !== "rejected") return false;
      } else if (statusTab === "inactive") {
        if (status !== "inactive" && status !== "suspended") return false;
      } else if (statusTab !== "all" && status !== statusTab) {
        return false;
      }
      if (purpose !== "all" && listingPurpose(item) !== purpose) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.suburb.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q)
      );
    });
  }, [listings, statusTab, purpose, search]);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      if (enquiryTab === "all") return true;
      if (enquiryTab === "new") return item.status === "pending";
      if (enquiryTab === "responded") return item.status === "responded" || item.status === "scheduled";
      return item.status === "closed" || item.status === "rejected" || item.status === "approved";
    });
  }, [enquiries, enquiryTab]);

  const applicationCounts = useMemo(() => {
    const result: Record<ApplicationTab, number> = { all: applications.length, new: 0, reviewing: 0, approved: 0, rejected: 0 };
    applications.forEach((application) => {
      result[applicationTab(application.status)] += 1;
    });
    return result;
  }, [applications]);
  const filteredApplications = useMemo(
    () => applications.filter((application) => applicationTabFilter === "all" || applicationTab(application.status) === applicationTabFilter),
    [applications, applicationTabFilter],
  );

  const activePct = useMemo(() => {
    if (!stats?.totalListings) return "0%";
    return `${Math.round((stats.activeListings / stats.totalListings) * 100)}%`;
  }, [stats]);

  const toggleAvailability = async (item: PropertyListing) => {
    await updateListing({ id: item.id, patch: { isAvailable: !item.isAvailable } });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] text-slate-500">
        {pt("loadingDashboard")}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-slate-700">{pt("dashboardLoadError")}</p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              {pt("tryAgain")}
            </button>
            <button
              type="button"
              onClick={() => router.push("/LoginScreenUser?next=/dashboard/property")}
              className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
            >
              {pt("signIn")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const navTabs: { key: PropertyDashboardTab; label: string }[] = [
    { key: "overview", label: pt("overview") },
    { key: "listings", label: pt("properties") },
    { key: "enquiries", label: pt("enquiries") },
    { key: "applications", label: pt("applications") },
    { key: "stayBookings", label: pt("stayBookings") },
    { key: "availability", label: pt("availability") },
    { key: "add", label: pt("addProperty") },
  ];

  const dayStatusColor = (status: string) => {
    if (status === "available") return "bg-emerald-500";
    if (status === "blocked") return "bg-slate-400";
    if (status === "booked") return "bg-teal-700";
    if (status === "pending") return "bg-amber-500";
    return "bg-slate-300";
  };

  const submitBlockDates = async () => {
    if (availabilityListingId == null) return;
    if (!blockStart || !blockEnd || blockEnd < blockStart) {
      setSuccessMsg(pt("stayBlockInvalidRange"));
      return;
    }
    setBlockBusy(true);
    try {
      const token = readAuthToken();
      const response = await fetch(
        `${baseAPI}/api/properties/me/listings/${availabilityListingId}/blocked-dates/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            start_date: blockStart,
            end_date: blockEnd,
            reason: blockReason.trim(),
          }),
        },
      );
      if (!response.ok) {
        const err: unknown = await response.json().catch(() => ({}));
        const detail =
          err && typeof err === "object" && "detail" in err
            ? String((err as { detail: unknown }).detail)
            : pt("stayBlockFailed");
        throw new Error(detail);
      }
      setBlockReason("");
      setSuccessMsg(pt("stayBlockCreated"));
      await loadAvailability(availabilityListingId);
    } catch (err) {
      setSuccessMsg(err instanceof Error ? err.message : pt("stayBlockFailed"));
    } finally {
      setBlockBusy(false);
    }
  };

  const removeBlockedDate = async (blockId: number) => {
    if (availabilityListingId == null) return;
    setBlockBusy(true);
    try {
      const token = readAuthToken();
      const response = await fetch(
        `${baseAPI}/api/properties/me/listings/${availabilityListingId}/blocked-dates/${blockId}/`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (!response.ok && response.status !== 204) throw new Error(pt("stayBlockFailed"));
      await loadAvailability(availabilityListingId);
    } catch (err) {
      setSuccessMsg(err instanceof Error ? err.message : pt("stayBlockFailed"));
    } finally {
      setBlockBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6f8]">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <section className="rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600 p-6 text-white shadow-lg md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-teal-100">{pt(greetingKey(hour))}</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{stats.businessName}</h1>
              <p className="mt-2 max-w-xl text-sm text-teal-100">
                {pt("dashboardGreetingSubtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("add")}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-amber-300"
            >
              <span className="text-lg leading-none">+</span>
              {pt("addProperty")}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {navTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "bg-white text-teal-800"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {(stats.pendingListings > 0 || stats.pendingEnquiries > 0) && activeTab === "overview" ? (
          <button
            type="button"
            onClick={() =>
              setActiveTab(stats.pendingEnquiries > 0 ? "enquiries" : "listings")
            }
            className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm font-semibold text-amber-900"
          >
            <span>âš </span>
            <span className="flex-1">{pt("attentionBanner")}</span>
            <span className="text-amber-700">{pt("viewPending")} →</span>
          </button>
        ) : null}

        {successMsg ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {successMsg}
          </div>
        ) : null}

        {(activeTab === "overview" || activeTab === "listings") && (
          <section>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              {pt("propertyOverview")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: pt("totalProperties"),
                  value: stats.totalListings,
                  hint: pt("ofListings"),
                  onClick: () => setActiveTab("listings"),
                },
                {
                  label: pt("activeProperties"),
                  value: stats.activeListings,
                  hint: `${activePct} ${pt("ofListings")}`,
                  onClick: () => {
                    setActiveTab("listings");
                    setStatusTab("active");
                  },
                },
                {
                  label: pt("pendingReview"),
                  value: stats.pendingListings,
                  hint: pt("needsAttention"),
                  onClick: () => {
                    setActiveTab("listings");
                    setStatusTab("pending");
                  },
                },
                {
                  label: pt("enquiries"),
                  value: stats.totalEnquiries,
                  hint: `${stats.pendingEnquiries} ${pt("pending").toLowerCase()}`,
                  onClick: () => setActiveTab("enquiries"),
                },
              ].map((card) => (
                <button
                  key={card.label}
                  type="button"
                  onClick={card.onClick}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{card.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === "overview" && (
          <>
            <PropertyAnalyticsCharts analytics={stats.analytics} days={days} onDaysChange={setDays} />
            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">{pt("recentEnquiries")}</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("enquiries")}
                    className="text-sm font-semibold text-teal-700"
                  >
                    {pt("enquiries")} →
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {stats.recentEnquiries.length === 0 ? (
                    <p className="text-sm text-slate-500">{pt("emptyEnquiriesSubtitle")}</p>
                  ) : (
                    stats.recentEnquiries.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab("enquiries")}
                        className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-slate-800">{item.propertyTitle}</p>
                          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            {enquiryStatusLabel(item.status)}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.message}</p>
                      </button>
                    ))
                  )}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">{pt("quickActions")}</h2>
                <div className="mt-4 grid gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("add")}
                    className="rounded-xl bg-teal-700 px-4 py-3 text-left text-sm font-bold text-white"
                  >
                    + {pt("addProperty")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("listings")}
                    className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-left text-sm font-semibold text-teal-900"
                  >
                    {pt("manageListings")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("enquiries")}
                    className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-left text-sm font-semibold text-teal-900"
                  >
                    {pt("reviewEnquiries")}
                  </button>
                </div>
              </article>
            </section>
          </>
        )}

        {activeTab === "add" && (
          <PropertyAddWizard
            onCancel={() => setActiveTab("listings")}
            onDone={() => {
              setSuccessMsg(pt("listingSubmitted"));
              setActiveTab("listings");
            }}
          />
        )}

        {activeTab === "listings" && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{pt("properties")}</h2>
                <p className="mt-1 text-sm text-slate-500">{pt("managePropertiesSubtitle")}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("add")}
                className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-900"
              >
                + {pt("addProperty")}
              </button>
            </div>

            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={pt("searchProperties")}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-4 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", pt("tabAll"), counts.all],
                  ["active", pt("tabActive"), counts.active],
                  ["pending", pt("tabPending"), counts.pending + counts.rejected],
                  ["draft", pt("tabDraft"), counts.draft],
                  ["inactive", pt("tabInactive"), counts.inactive + counts.suspended],
                ] as const
              ).map(([key, label, count]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusTab(key)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                    statusTab === key
                      ? "bg-teal-700 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                {pt("filterPurpose")}
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["all", pt("purposeAll")],
                    ["rent", pt("purposeRent")],
                    ["stay", pt("purposeStay")],
                    ["sale", pt("purposeSale")],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPurpose(key)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                      purpose === key
                        ? "bg-teal-50 text-teal-800 ring-1 ring-teal-600"
                        : "bg-white text-slate-600 ring-1 ring-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {listings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="text-4xl">ðŸ </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">{pt("emptyPropertiesTitle")}</h3>
                <p className="mt-2 text-sm text-slate-500">{pt("emptyPropertiesSubtitle")}</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className="mt-6 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white"
                >
                  + {pt("addProperty")}
                </button>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                <p className="text-slate-600">{pt("noMatchFilters")}</p>
                <button
                  type="button"
                  className="mt-3 text-sm font-semibold text-teal-700"
                  onClick={() => {
                    setStatusTab("all");
                    setPurpose("all");
                    setSearch("");
                  }}
                >
                  {pt("clearFilters")}
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredListings.map((item) => {
                  const status = getListingUiStatus(item);
                  const purposeKey = listingPurpose(item);
                  const purposeLabel =
                    purposeKey === "sale"
                      ? pt("purposeSale")
                      : purposeKey === "stay"
                        ? pt("purposeStay")
                        : pt("purposeRent");
                  const location = [item.suburb, item.city].filter(Boolean).join(", ");
                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] bg-slate-100">
                        {item.images[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.images[0].url}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-4xl text-slate-300">
                            ðŸ 
                          </div>
                        )}
                        <div className="absolute left-3 top-3 flex w-[calc(100%-1.5rem)] items-start justify-between gap-2">
                          <span className="rounded-md bg-slate-900/85 px-2 py-1 text-[11px] font-bold uppercase text-white">
                            {purposeLabel}
                          </span>
                          <StatusBadge status={status} label={statusLabel(status)} />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="truncate text-lg font-bold text-slate-900">{item.title}</h3>
                        <p className="mt-1 truncate text-sm text-slate-500">ðŸ“ {location || item.city}</p>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                          {item.bedrooms > 0 && <span>ðŸ› {item.bedrooms}</span>}
                          {item.bathrooms > 0 && <span>ðŸš¿ {item.bathrooms}</span>}
                          <span className="text-slate-400">{listingTypeLabel(item.listingType)}</span>
                        </div>
                        <p className="mt-3 text-xl font-extrabold text-teal-700">
                          {item.currency} {item.price}
                          <span className="ml-1 text-xs font-medium text-slate-500">
                            {item.listingType === "rent_daily"
                              ? `/ ${pt("perDayShort")}`
                              : item.listingType === "rent_monthly"
                                ? `/ ${pt("perMonthShort")}`
                                : ""}
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          ðŸ’¬ {item.enquiryCount} {pt("enquiries").toLowerCase()}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {purposeKey === "stay" && (
                            <button
                              type="button"
                              onClick={() => {
                                setAvailabilityListingId(item.id);
                                setActiveTab("availability");
                              }}
                              className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800"
                            >
                              {pt("manageStayAvailability")}
                            </button>
                          )}
                          {(status === "active" || status === "inactive") && (
                            <button
                              type="button"
                              onClick={() => void toggleAvailability(item)}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                            >
                              {item.isAvailable ? pt("pauseListing") : pt("activateListing")}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "enquiries" && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">{pt("enquiriesInbox")}</h2>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", pt("enquiryTabAll")],
                  ["new", pt("enquiryTabNew")],
                  ["responded", pt("enquiryTabResponded")],
                  ["closed", pt("enquiryTabClosed")],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setEnquiryTab(key)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                    enquiryTab === key
                      ? "bg-teal-700 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {filteredEnquiries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="text-4xl">ðŸ’¬</div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">{pt("emptyEnquiriesTitle")}</h3>
                <p className="mt-2 text-sm text-slate-500">{pt("emptyEnquiriesSubtitle")}</p>
              </div>
            ) : (
              filteredEnquiries.map((item) => {
                const isNew = item.status === "pending";
                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{item.propertyTitle}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {enquiryTypeLabel(item.enquiryType)} ·{" "}
                          {item.createdAt.slice(0, 16).replace("T", " ")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          isNew ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isNew ? pt("enquiryTabNew") : enquiryStatusLabel(item.status)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.message}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void updateEnquiryStatus({ id: item.id, status: "responded" })}
                        className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white"
                      >
                        {pt("markResponded")}
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateEnquiryStatus({ id: item.id, status: "scheduled" })}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        {pt("markScheduled")}
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateEnquiryStatus({ id: item.id, status: "closed" })}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        {pt("markClosed")}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        )}

        {activeTab === "applications" && (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{pt("applications")}</h2>
              <p className="mt-1 text-sm text-slate-500">{pt("applicationsSubtitle")}</p>
            </div>
            {selectedApplicationId ? (
              <PartnerApplicationReview
                applicationId={selectedApplicationId}
                onClose={() => setSelectedApplicationId(null)}
                onUpdated={() => {
                  setActiveTab("applications");
                  void (async () => {
                    setApplicationsLoading(true);
                    try {
                      const parsed = readAuthToken();
                      if (!parsed) return;
                      const response = await fetch(`${baseAPI}/api/properties/me/applications/`, {
                        headers: { Accept: "application/json", Authorization: `Bearer ${parsed}` },
                      });
                      const data: unknown = await response.json();
                      if (Array.isArray(data)) {
                        setApplications(
                          data.filter((item): item is PropertyApplication => typeof item === "object" && item !== null),
                        );
                      }
                    } finally {
                      setApplicationsLoading(false);
                    }
                  })();
                }}
              />
            ) : null}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["new", "New"],
                  ["reviewing", "Reviewing"],
                  ["approved", "Approved"],
                  ["rejected", "Rejected"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setApplicationTabFilter(key)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                    applicationTabFilter === key
                      ? "bg-teal-700 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {label} ({applicationCounts[key]})
                </button>
              ))}
            </div>
            {applicationsLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
                {pt("loadingDashboard")}
              </div>
            ) : applicationsError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
                {pt("applicationLoadError")}
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <h3 className="text-xl font-bold text-slate-900">{pt("applications")}</h3>
                <p className="mt-2 text-sm text-slate-500">{pt("applicationsSubtitle")}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredApplications.map((application) => (
                  <button
                    key={application.id}
                    type="button"
                    onClick={() => setSelectedApplicationId(application.id)}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{application.property_title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {application.property_city} ·{" "}
                          {(application.submitted_at ?? application.created_at).slice(0, 10)}
                        </p>
                      </div>
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold capitalize text-teal-800">
                        {application.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-teal-700">
                      {application.proposed_rent
                        ? `${application.currency} ${application.proposed_rent}`
                        : "—"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "stayBookings" && (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{pt("stayBookings")}</h2>
              <p className="mt-1 text-sm text-slate-500">{pt("stayBookingsSubtitle")}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["today", pt("stayBookingsToday"), stayStats.today],
                  ["upcoming", pt("stayBookingsUpcoming"), stayStats.upcoming],
                  ["thisMonth", pt("stayBookingsThisMonth"), stayStats.thisMonth],
                ] as const
              ).map(([key, label, value]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-teal-800">{value}</p>
                </div>
              ))}
            </div>
            {stayBookingsLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
                {pt("loadingDashboard")}
              </div>
            ) : stayBookingsError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
                {pt("stayBookingsLoadError")}
              </div>
            ) : stayBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <h3 className="text-xl font-bold text-slate-900">{pt("emptyStayBookingsTitle")}</h3>
                <p className="mt-2 text-sm text-slate-500">{pt("emptyStayBookingsSubtitle")}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {stayBookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{booking.propertyTitle}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {booking.guestName || "—"} · {booking.bookingCode}
                        </p>
                      </div>
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold capitalize text-teal-800">
                        {booking.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      {booking.checkIn} → {booking.checkOut} · {booking.nights} {pt("stayNights")}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {booking.adults} {pt("stayAdults")}
                      {booking.children > 0
                        ? ` · ${booking.children} ${pt("stayChildren")}`
                        : ""}
                    </p>
                    <p className="mt-3 text-sm font-bold text-teal-700">
                      {booking.currency} {booking.totalAmount}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "availability" && (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{pt("availability")}</h2>
              <p className="mt-1 text-sm text-slate-500">{pt("availabilitySubtitle")}</p>
            </div>
            {stayListings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <h3 className="text-xl font-bold text-slate-900">{pt("noStayListingsTitle")}</h3>
                <p className="mt-2 text-sm text-slate-500">{pt("noStayListingsSubtitle")}</p>
              </div>
            ) : (
              <>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-600">{pt("selectStayListing")}</p>
                  <div className="flex flex-wrap gap-2">
                    {stayListings.map((listing) => (
                      <button
                        key={listing.id}
                        type="button"
                        onClick={() => setAvailabilityListingId(listing.id)}
                        className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                          availabilityListingId === listing.id
                            ? "bg-teal-700 text-white"
                            : "bg-white text-slate-600 ring-1 ring-slate-200"
                        }`}
                      >
                        {listing.title}
                      </button>
                    ))}
                  </div>
                </div>
                {availabilityLoading ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
                    {pt("loadingDashboard")}
                  </div>
                ) : availabilityError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
                    {pt("availabilityLoadError")}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {pt("stayStatusAvailable")}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        {pt("stayStatusBlocked")}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-teal-700" />
                        {pt("stayStatusBooked")}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        {pt("stayStatusPending")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availabilityDays.map((day) => (
                        <div
                          key={day.date}
                          className="w-[3.15rem] rounded-xl border border-slate-200 bg-white p-2 text-center"
                          title={`${day.date} · ${day.status}`}
                        >
                          <p className="text-[11px] font-bold text-slate-700">{day.date.slice(8)}</p>
                          <span
                            className={`mx-auto mt-1 block h-2 w-2 rounded-full ${dayStatusColor(day.status)}`}
                          />
                          <p className="mt-1 truncate text-[10px] text-slate-400">
                            {day.status === "available" && day.price
                              ? day.price
                              : day.status.slice(0, 1).toUpperCase()}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="font-bold text-slate-900">{pt("blockDates")}</h3>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <input
                          type="date"
                          value={blockStart}
                          onChange={(e) => setBlockStart(e.target.value)}
                          className="rounded-xl border border-slate-200 px-3 py-2.5"
                        />
                        <input
                          type="date"
                          value={blockEnd}
                          onChange={(e) => setBlockEnd(e.target.value)}
                          className="rounded-xl border border-slate-200 px-3 py-2.5"
                        />
                        <input
                          type="text"
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          placeholder={pt("blockReason")}
                          className="rounded-xl border border-slate-200 px-3 py-2.5"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={blockBusy}
                        onClick={() => void submitBlockDates()}
                        className="mt-3 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:opacity-60"
                      >
                        {pt("blockDates")}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900">{pt("blockedDatesList")}</h3>
                      {blockedDates.length === 0 ? (
                        <p className="text-sm text-slate-500">{pt("noBlockedDates")}</p>
                      ) : (
                        blockedDates.map((block) => (
                          <div
                            key={block.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {block.startDate} → {block.endDate}
                              </p>
                              {block.reason ? (
                                <p className="text-xs text-slate-500">{block.reason}</p>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              disabled={blockBusy}
                              onClick={() => void removeBlockedDate(block.id)}
                              className="text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-60"
                            >
                              {pt("unblockDates")}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default withPartnerAuth(PropertyDashboardPage);
