"use client";

import { useEffect, useMemo, useState } from "react";
import { baseAPI } from "@/services/api";
import { usePropertyTranslation } from "@/hooks/usePropertyTranslation";
import { useCreatePropertyListingMutation } from "@/redux/slices/propertyApi";
import {
  listingTypeFromPurpose,
} from "@/lib/propertyUi";
import type { PropertyListingType, PropertyLocationSource } from "@/types/property";
import PropertyLocationPicker from "@/components/property/PropertyLocationPicker";

const STEPS = ["purpose", "type", "details", "location", "pricing", "photos", "review"] as const;
const DRAFT_KEY = "kudya.web.property.listingDraft.v1";

type AmenityOption = { key: string; name: string };
type Purpose = "rent" | "stay" | "sale";

type Draft = {
  step: number;
  purpose: Purpose | "";
  listingType: PropertyListingType | "";
  propertyType: string;
  title: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpaces: string;
  furnished: boolean;
  city: string;
  suburb: string;
  address: string;
  countryId: number | null;
  provinceId: number | null;
  cityRefId: number | null;
  districtId: number | null;
  latitude: number | null;
  longitude: number | null;
  street: string;
  formattedAddress: string;
  showExactAddress: boolean;
  locationSource: PropertyLocationSource;
  locationConfirmed: boolean;
  price: string;
  currency: string;
  deposit: string;
  weekendPrice: string;
  cleaningFee: string;
  minNights: string;
  maxGuests: string;
  leaseMonths: number[];
  amenities: string[];
};

const emptyDraft = (): Draft => ({
  step: 0,
  purpose: "",
  listingType: "",
  propertyType: "",
  title: "",
  description: "",
  bedrooms: "0",
  bathrooms: "0",
  parkingSpaces: "0",
  furnished: false,
  city: "",
  suburb: "",
  address: "",
  countryId: null,
  provinceId: null,
  cityRefId: null,
  districtId: null,
  latitude: null,
  longitude: null,
  street: "",
  formattedAddress: "",
  showExactAddress: false,
  locationSource: "",
  locationConfirmed: false,
  price: "",
  currency: "AOA",
  deposit: "",
  weekendPrice: "",
  cleaningFee: "",
  minNights: "2",
  maxGuests: "4",
  leaseMonths: [6, 12],
  amenities: [],
});

const FALLBACK_TYPES = [
  "apartment",
  "house",
  "villa",
  "townhouse",
  "room",
  "studio",
  "office",
  "commercial",
  "land",
  "hotel",
  "guest_house",
  "lodge",
  "other",
];

const FALLBACK_AMENITIES: AmenityOption[] = [
  { key: "wifi", name: "Wi‑Fi" },
  { key: "parking", name: "Parking" },
  { key: "pool", name: "Swimming Pool" },
  { key: "security", name: "24/7 Security" },
  { key: "generator", name: "Generator" },
  { key: "air_conditioning", name: "Air Conditioning" },
  { key: "furnished", name: "Furnished" },
  { key: "balcony", name: "Balcony" },
  { key: "elevator", name: "Elevator" },
  { key: "gym", name: "Gym" },
  { key: "garden", name: "Garden" },
  { key: "water_tank", name: "Water Tank" },
];

type Props = {
  onDone: () => void;
  onCancel: () => void;
};

export default function PropertyAddWizard({ onDone, onCancel }: Props) {
  const { pt, propertyTypeLabel, amenityLabel, purposeLabel } = usePropertyTranslation();
  const [createListing, { isLoading }] = useCreatePropertyListingMutation();
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(FALLBACK_TYPES);
  const [amenities, setAmenities] = useState<AmenityOption[]>(FALLBACK_AMENITIES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Draft;
        setDraft({
          ...emptyDraft(),
          ...parsed,
          leaseMonths: parsed.leaseMonths?.length ? parsed.leaseMonths : [6, 12],
          weekendPrice: parsed.weekendPrice ?? "",
          cleaningFee: parsed.cleaningFee ?? "",
          minNights: parsed.minNights ?? "2",
          maxGuests: parsed.maxGuests ?? "4",
        });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1000);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draft, hydrated]);

  useEffect(() => {
    void fetch(`${baseAPI}/api/properties/property-types/`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) => {
        if (!Array.isArray(data)) return;
        const values = data
          .map((row) =>
            row && typeof row === "object" && "value" in row
              ? String((row as { value: unknown }).value)
              : "",
          )
          .filter(Boolean);
        if (values.length) setPropertyTypes(values);
      })
      .catch(() => undefined);

    void fetch(`${baseAPI}/api/properties/amenities/`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) => {
        if (!Array.isArray(data) || !data.length) return;
        const next = data
          .map((row) => {
            if (!row || typeof row !== "object") return null;
            const item = row as { key?: unknown; name?: unknown };
            if (typeof item.key !== "string") return null;
            return {
              key: item.key,
              name: typeof item.name === "string" ? item.name : item.key,
            };
          })
          .filter((row): row is AmenityOption => Boolean(row));
        if (next.length) setAmenities(next);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);

  const step = Math.min(Math.max(draft.step, 0), STEPS.length - 1);
  const stepKey = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const stepTitle = useMemo(() => {
    const map: Record<(typeof STEPS)[number], string> = {
      purpose: pt("wizardPurposeTitle"),
      type: pt("wizardTypeTitle"),
      details: pt("wizardDetailsTitle"),
      location: pt("wizardLocationTitle"),
      pricing: pt("wizardPricingTitle"),
      photos: pt("wizardPhotosTitle"),
      review: pt("wizardReviewTitle"),
    };
    return map[stepKey];
  }, [pt, stepKey]);

  const patch = (partial: Partial<Draft>) => setDraft((prev) => ({ ...prev, ...partial }));

  const locationReady = Boolean(
    draft.countryId &&
      draft.provinceId &&
      draft.cityRefId &&
      draft.latitude != null &&
      draft.longitude != null,
  );

  const canContinue = () => {
    switch (stepKey) {
      case "purpose":
        return Boolean(draft.purpose);
      case "type":
        return Boolean(draft.propertyType);
      case "details":
        return draft.title.trim().length >= 3;
      case "location":
        return locationReady;
      case "pricing":
        return Boolean(draft.price.trim());
      case "review":
        return locationReady && Boolean(draft.price.trim() && draft.title.trim());
      default:
        return true;
    }
  };

  const goNext = () => {
    if (!canContinue()) {
      setError(
        stepKey === "location"
          ? "Select country, region, and city (or pin a map location) before continuing."
          : pt("fillAllFields"),
      );
      return;
    }
    setError(null);
    patch({
      step: Math.min(step + 1, STEPS.length - 1),
      ...(stepKey === "location" && !draft.locationConfirmed
        ? { locationConfirmed: true }
        : {}),
    });
  };

  const submit = async () => {
    setError(null);
    if (
      !draft.purpose ||
      !draft.propertyType ||
      !draft.title.trim() ||
      !draft.price.trim() ||
      !draft.countryId ||
      !draft.provinceId ||
      !draft.cityRefId ||
      draft.latitude == null ||
      draft.longitude == null
    ) {
      setError(
        "Complete the location step (country, region, city + map pin) before submitting for approval.",
      );
      return;
    }
    try {
      const price = draft.price.trim().replace(",", "");
      const deposit = draft.deposit.trim().replace(",", "");
      await createListing({
        title: draft.title.trim(),
        description: draft.description.trim(),
        city: draft.city.trim() || "Unknown",
        suburb: draft.suburb.trim(),
        address:
          draft.address.trim() ||
          draft.street.trim() ||
          draft.formattedAddress.trim() ||
          draft.city.trim() ||
          "Address pending",
        street: draft.street.trim(),
        formattedAddress: draft.formattedAddress.trim(),
        country: draft.countryId,
        province: draft.provinceId,
        cityRef: draft.cityRefId,
        district: draft.districtId,
        latitude: draft.latitude,
        longitude: draft.longitude,
        showExactAddress: draft.showExactAddress,
        locationSource: draft.locationSource || "manual",
        price,
        listingType: draft.listingType || listingTypeFromPurpose(draft.purpose),
        propertyType: draft.propertyType,
        bedrooms: Number(draft.bedrooms) || 0,
        bathrooms: Number(draft.bathrooms) || 0,
        parkingSpaces: Number(draft.parkingSpaces) || 0,
        furnished: draft.furnished,
        parking: Number(draft.parkingSpaces) > 0,
        amenities: draft.amenities,
        currency: draft.currency || "AOA",
        isAvailable: true,
        images: photos,
        purpose: draft.purpose || undefined,
        deposit: deposit || undefined,
        ...(draft.purpose === "rent"
          ? {
              monthlyRent: price,
              allowedLeaseMonths:
                draft.leaseMonths.length > 0 ? draft.leaseMonths : [6, 12],
            }
          : {}),
        ...(draft.purpose === "stay"
          ? {
              pricePerNight: price,
              weekendPrice: draft.weekendPrice.trim().replace(",", "") || undefined,
              cleaningFee: draft.cleaningFee.trim().replace(",", "") || undefined,
              minNights: Number(draft.minNights) || 1,
              maxGuests: Number(draft.maxGuests) || 1,
            }
          : {}),
      }).unwrap();
      localStorage.removeItem(DRAFT_KEY);
      setDraft(emptyDraft());
      setPhotos([]);
      onDone();
    } catch (err) {
      const detail =
        err && typeof err === "object" && "data" in err
          ? JSON.stringify((err as { data: unknown }).data)
          : pt("listingFailed");
      setError(detail);
    }
  };

  if (!hydrated) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-500">{pt("loadingDashboard")}</div>;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {pt("wizardStepOf")
              .replace("{{current}}", String(step + 1))
              .replace("{{total}}", String(STEPS.length))}
          </p>
          <h2 className="text-lg font-bold text-slate-900">{stepTitle}</h2>
        </div>
        <div className="flex items-center gap-3">
          {savedFlash ? (
            <span className="text-xs font-semibold text-emerald-600">{pt("savedAutomatically")}</span>
          ) : null}
          <button type="button" onClick={onCancel} className="text-sm font-semibold text-slate-500 hover:text-slate-800">
            {pt("cancel")}
          </button>
        </div>
      </div>
      <div className="h-1 bg-slate-100">
        <div className="h-1 bg-teal-700 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-4 p-5 md:p-6">
        {stepKey === "purpose" && (
          <>
            <p className="text-sm text-slate-500">{pt("wizardPurposeSubtitle")}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { key: "rent" as const, label: pt("purposeRent"), emoji: "🏠" },
                  { key: "stay" as const, label: pt("purposeStay"), emoji: "🏨" },
                  { key: "sale" as const, label: pt("purposeSale"), emoji: "💰" },
                ] as const
              ).map((option) => {
                const active = draft.purpose === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() =>
                      patch({
                        purpose: option.key,
                        listingType: listingTypeFromPurpose(option.key),
                      })
                    }
                    className={`rounded-2xl border-2 p-5 text-left transition ${
                      active
                        ? "border-teal-700 bg-teal-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="text-2xl">{option.emoji}</div>
                    <div className={`mt-2 font-bold ${active ? "text-teal-800" : "text-slate-800"}`}>
                      {option.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {stepKey === "type" && (
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map((type) => {
              const active = draft.propertyType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => patch({ propertyType: type })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                    active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {propertyTypeLabel(type)}
                </button>
              );
            })}
          </div>
        )}

        {stepKey === "details" && (
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-xl border border-slate-200 px-3 py-2.5 md:col-span-2"
              placeholder={pt("listingTitle")}
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
            <textarea
              className="rounded-xl border border-slate-200 px-3 py-2.5 md:col-span-2"
              rows={4}
              placeholder={pt("listingDescription")}
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2.5"
              placeholder={pt("bedroomsLabel")}
              value={draft.bedrooms}
              onChange={(e) => patch({ bedrooms: e.target.value })}
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2.5"
              placeholder={pt("bathroomsLabel")}
              value={draft.bathrooms}
              onChange={(e) => patch({ bathrooms: e.target.value })}
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2.5"
              placeholder={pt("parkingSpaces")}
              value={draft.parkingSpaces}
              onChange={(e) => patch({ parkingSpaces: e.target.value })}
            />
            <button
              type="button"
              onClick={() => patch({ furnished: !draft.furnished })}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                draft.furnished
                  ? "border-teal-700 bg-teal-700 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {pt("furnished")}
            </button>
          </div>
        )}

        {stepKey === "location" && (
          <PropertyLocationPicker
            value={{
              countryId: draft.countryId,
              provinceId: draft.provinceId,
              cityRefId: draft.cityRefId,
              districtId: draft.districtId,
              latitude: draft.latitude,
              longitude: draft.longitude,
              street: draft.street,
              formattedAddress: draft.formattedAddress,
              showExactAddress: draft.showExactAddress,
              locationSource: draft.locationSource,
              locationConfirmed: draft.locationConfirmed,
              city: draft.city,
              suburb: draft.suburb,
              address: draft.address,
            }}
            onChange={(next) => patch(next)}
          />
        )}

        {stepKey === "pricing" && (
          <div className="grid gap-3 md:grid-cols-3">
            <input
              className="rounded-xl border border-slate-200 px-3 py-2.5 md:col-span-2"
              placeholder={
                draft.purpose === "stay"
                  ? pt("nightlyPriceLabel")
                  : draft.purpose === "rent"
                    ? pt("monthlyRentLabel")
                    : pt("listingPrice")
              }
              value={draft.price}
              onChange={(e) => patch({ price: e.target.value })}
            />
            <input
              className="rounded-xl border border-slate-200 px-3 py-2.5"
              placeholder={pt("currencyLabel")}
              value={draft.currency}
              maxLength={3}
              onChange={(e) => patch({ currency: e.target.value.toUpperCase() })}
            />
            {draft.purpose !== "stay" ? (
              <input
                className="rounded-xl border border-slate-200 px-3 py-2.5 md:col-span-3"
                placeholder={pt("depositLabel")}
                value={draft.deposit}
                onChange={(e) => patch({ deposit: e.target.value })}
              />
            ) : null}
            {draft.purpose === "stay" ? (
              <>
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2.5"
                  placeholder={pt("weekendPriceLabel")}
                  value={draft.weekendPrice}
                  onChange={(e) => patch({ weekendPrice: e.target.value })}
                />
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2.5"
                  placeholder={pt("cleaningFeeLabel")}
                  value={draft.cleaningFee}
                  onChange={(e) => patch({ cleaningFee: e.target.value })}
                />
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2.5"
                  placeholder={pt("minNightsLabel")}
                  value={draft.minNights}
                  onChange={(e) => patch({ minNights: e.target.value })}
                />
                <input
                  className="rounded-xl border border-slate-200 px-3 py-2.5 md:col-span-2"
                  placeholder={pt("maxGuestsLabel")}
                  value={draft.maxGuests}
                  onChange={(e) => patch({ maxGuests: e.target.value })}
                />
              </>
            ) : null}
            {draft.purpose === "rent" ? (
              <div className="md:col-span-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {pt("allowedLeaseMonthsLabel")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[6, 12].map((months) => {
                    const active = draft.leaseMonths.includes(months);
                    return (
                      <button
                        key={months}
                        type="button"
                        onClick={() =>
                          patch({
                            leaseMonths: active
                              ? draft.leaseMonths.filter((item) => item !== months)
                              : [...draft.leaseMonths, months].sort((a, b) => a - b),
                          })
                        }
                        className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                          active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {pt("monthsChip").replace("{{n}}", String(months))}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {stepKey === "photos" && (
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-600 bg-teal-50 px-6 py-10 text-center">
              <span className="font-bold text-teal-800">{pt("addPhotos")}</span>
              <span className="mt-1 text-xs text-slate-500">{pt("mediaHint")}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 12))}
              />
            </label>
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {photoPreviews.map((url, index) => (
                  <div key={url} className="relative overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-28 w-full object-cover" />
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
                        {pt("coverPhoto")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                {pt("amenities")}
              </p>
              <div className="flex flex-wrap gap-2">
                {amenities.map((item) => {
                  const active = draft.amenities.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        patch({
                          amenities: active
                            ? draft.amenities.filter((key) => key !== item.key)
                            : [...draft.amenities, item.key],
                        })
                      }
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                        active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {amenityLabel(item.key)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {stepKey === "review" && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">{pt("reviewSummary")}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{draft.title || "—"}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {purposeLabel(draft.purpose)} · {propertyTypeLabel(draft.propertyType)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {draft.formattedAddress ||
                [draft.street, draft.suburb, draft.city].filter(Boolean).join(", ")}
            </p>
            <p className="mt-3 text-2xl font-bold text-teal-700">
              {draft.currency} {draft.price}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {draft.bedrooms} {pt("bedroomsLabel").toLowerCase()} · {draft.bathrooms}{" "}
              {pt("bathroomsLabel").toLowerCase()} · {photos.length} {pt("photoCount")}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
        <button
          type="button"
          onClick={() => {
            if (step === 0) onCancel();
            else patch({ step: step - 1 });
          }}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          {pt("backStep")}
        </button>
        {stepKey === "review" ? (
          <button
            type="button"
            disabled={isLoading || !canContinue()}
            onClick={() => void submit()}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {isLoading ? "…" : pt("submitForApproval")}
          </button>
        ) : (
          <button
            type="button"
            disabled={!canContinue()}
            onClick={() => {
              if (!canContinue()) {
                setError(pt("fillAllFields"));
                return;
              }
              setError(null);
              patch({ step: step + 1 });
            }}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {pt("nextStep")}
          </button>
        )}
      </div>
    </div>
  );
}
