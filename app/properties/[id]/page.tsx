"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MdArrowBack,
  MdHome,
  MdBed,
  MdBathtub,
  MdSquareFoot,
  MdLocalParking,
  MdCheck,
  MdFavorite,
  MdFavoriteBorder,
  MdPlace,
  MdDirections,
} from "react-icons/md";
import { baseAPI } from "@/services/types";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { formatCurrency, getCurrencyForCountry } from "@/utils/currency";
import { useUserRegion } from "@/hooks/useUserRegion";
import { useTranslation } from "@/hooks/useTranslation";
import { clearAuthToken, readAuthToken } from "@/lib/authToken";
import PropertyEnquiryPanel from "@/components/properties/PropertyEnquiryPanel";
import StayBookingPanel from "@/components/properties/StayBookingPanel";
import PropertyMapEmbed from "@/components/properties/PropertyMapEmbed";
import PlatformServiceGate from "@/components/platform/PlatformServiceGate";
import {
  getDirectionsUrl,
  getPropertyMapCoords,
  toMapCoords,
} from "@/lib/propertyDirections";

type AmenityDetail = { key: string; name: string; icon: string };

type StaySettingsSummary = {
  price_per_night?: string;
  weekend_price?: string | null;
  cleaning_fee?: string;
  min_nights?: number;
  max_nights?: number;
  max_guests?: number;
  hold_minutes?: number;
};

type PropertyLocation = {
  country?: {
    id?: number | null;
    name?: string;
    iso_code?: string;
    flag_url?: string;
    flag_icon?: string;
  };
  region?: { name?: string };
  city?: { name?: string };
  district?: { name?: string };
  latitude?: number | null;
  longitude?: number | null;
  approximate_latitude?: number | null;
  approximate_longitude?: number | null;
  show_exact_address?: boolean;
};

type Property = {
  id: number;
  title: string;
  description: string;
  address: string;
  public_address?: string;
  city: string;
  suburb?: string;
  listing_type: string;
  listing_type_display?: string;
  purpose?: string;
  purpose_display?: string;
  booking_mode?: string;
  property_type?: string;
  property_type_display?: string;
  price: string;
  currency: string;
  price_label?: string;
  bedrooms: number;
  bathrooms: number;
  parking_spaces?: number;
  area_sqm: number | null;
  furnished?: boolean;
  parking?: boolean;
  amenities: string[];
  amenity_details?: AmenityDetail[];
  image_urls: string[];
  is_favorited?: boolean;
  owner_name?: string;
  pet_policy?: string;
  lease_term?: string;
  deposit?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  can_get_directions?: boolean;
  location?: PropertyLocation;
  stay_settings_summary?: StaySettingsSummary | null;
  allowed_lease_months?: number[];
};

function PropertyDetailContent() {
  const params = useParams();
  const id = params?.id;
  const { region: regionCode } = useUserRegion();
  const { t } = useTranslation();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const applyProperty = (data: Property) => {
      const urls =
        Array.isArray(data.image_urls) && data.image_urls.length > 0
          ? data.image_urls
          : [];
      setProperty({ ...data, image_urls: urls });
      setFavorited(Boolean(data.is_favorited));
      setActiveImage(0);
    };

    const load = async () => {
      setLoading(true);
      const headers: HeadersInit = { Accept: "application/json" };
      const token = readAuthToken();
      if (token) headers.Authorization = `Bearer ${token}`;

      try {
        let res = await fetch(`${baseAPI}/properties/${id}/`, { headers });
        // Expired JWT still fails AllowAny endpoints when Authorization is sent.
        if (res.status === 401 && token) {
          clearAuthToken();
          res = await fetch(`${baseAPI}/properties/${id}/`, {
            headers: { Accept: "application/json" },
          });
        }
        if (!res.ok) {
          if (!cancelled) setProperty(null);
          return;
        }
        const data = (await res.json()) as Property;
        if (!cancelled) applyProperty(data);
      } catch {
        if (!cancelled) setProperty(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const currencyCode = getCurrencyForCountry(regionCode) as "AOA" | "USD" | "EUR";

  const amenityList = useMemo(() => {
    if (!property) return [];
    if (property.amenity_details?.length) return property.amenity_details;
    return (property.amenities || []).map((key) => ({
      key,
      name: key.replace(/_/g, " "),
      icon: "check",
    }));
  }, [property]);

  const toggleFavorite = async () => {
    if (!property) return;
    const token = readAuthToken();
    if (!token) {
      window.location.href = `/LoginScreenUser?next=/properties/${property.id}`;
      return;
    }
    setFavBusy(true);
    try {
      const res = await fetch(`${baseAPI}/properties/${property.id}/favorite/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setFavorited(Boolean(data.favorited));
    } finally {
      setFavBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] text-slate-600">
        {t("loading", "Loading...")}
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f6f8]">
        <p className="text-slate-700">{t("propertyNotFound", "Property not found")}</p>
        <Link href="/properties" className="text-amber-600 hover:underline">
          {t("backToSearch", "Back to search")}
        </Link>
      </div>
    );
  }

  const images = property.image_urls || [];
  const cover = images[activeImage] ? resolveMediaUrl(images[activeImage]) : null;
  const location =
    property.public_address ||
    [
      property.location?.district?.name || property.suburb,
      property.location?.city?.name || property.city,
      property.location?.country?.name,
    ]
      .filter(Boolean)
      .join(", ") ||
    property.city;
  const mapCoords =
    getPropertyMapCoords(property.location) ||
    toMapCoords(property.latitude, property.longitude);
  const exactCoords =
    toMapCoords(property.location?.latitude, property.location?.longitude) ||
    toMapCoords(property.latitude, property.longitude);
  const canGetDirections = Boolean(property.can_get_directions && exactCoords);
  const isApproximateMap = Boolean(mapCoords && !exactCoords);
  const flagUrl = property.location?.country?.flag_url;
  const flagIcon = property.location?.country?.flag_icon;
  const purpose =
    property.purpose ||
    (property.listing_type === "buy"
      ? "sale"
      : property.listing_type === "rent_daily"
        ? "stay"
        : "rent");
  const purposeBadge =
    purpose === "stay"
      ? t("stay", "Stay")
      : purpose === "sale"
        ? t("forSale", "For Sale")
        : t("forRent", "For Rent");
  const priceSuffix =
    purpose === "stay" || property.listing_type === "rent_daily"
      ? t("perNight", "per night")
      : purpose === "rent" || property.listing_type === "rent_monthly"
        ? t("perMonth", "per month")
        : "";

  return (
    <main className="min-h-screen bg-[#f4f6f8]">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <MdArrowBack size={18} /> {t("backToSearch", "Back to search")}
          </Link>
          <button
            type="button"
            disabled={favBusy}
            onClick={toggleFavorite}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {favorited ? <MdFavorite className="text-rose-500" size={18} /> : <MdFavoriteBorder size={18} />}
            {favorited ? t("saved", "Saved") : t("save", "Save")}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[16/9] bg-slate-100 sm:aspect-[21/9]">
            {cover ? (
              <Image src={cover} alt={property.title} fill className="object-cover" priority sizes="100vw" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <MdHome size={96} className="text-slate-300" />
              </div>
            )}
            <span className="absolute left-4 top-4 rounded-md bg-slate-900/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
              {purposeBadge}
            </span>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto border-t border-slate-100 p-3">
              {images.map((url, idx) => (
                <button
                  key={`${url}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                    idx === activeImage ? "border-amber-500" : "border-transparent"
                  }`}
                >
                  <Image src={resolveMediaUrl(url)} alt="" fill className="object-cover" sizes="96px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <header>
              <p className="text-sm font-medium text-amber-700">
                {property.property_type
                  ? t(`ptype_${property.property_type}`, property.property_type_display || property.property_type)
                  : t("property", "Property")}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                {property.title}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-slate-600">
                {flagUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={flagUrl} alt="" className="h-3.5 w-5 rounded-sm object-cover" />
                ) : flagIcon ? (
                  <span aria-hidden>{flagIcon}</span>
                ) : (
                  <MdPlace size={18} className="text-slate-400" />
                )}
                {location}
              </p>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {formatCurrency(parseFloat(property.price), currencyCode)}
                {priceSuffix ? (
                  <span className="ml-2 text-base font-normal text-slate-500">{priceSuffix}</span>
                ) : null}
              </p>
            </header>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                property.bedrooms > 0 && {
                  icon: <MdBed size={22} />,
                  label: `${property.bedrooms} ${t("bedrooms", "bedrooms")}`,
                },
                property.bathrooms > 0 && {
                  icon: <MdBathtub size={22} />,
                  label: `${property.bathrooms} ${t("bathrooms", "bathrooms")}`,
                },
                property.area_sqm && {
                  icon: <MdSquareFoot size={22} />,
                  label: `${property.area_sqm} m²`,
                },
                (property.parking || (property.parking_spaces ?? 0) > 0) && {
                  icon: <MdLocalParking size={22} />,
                  label:
                    (property.parking_spaces ?? 0) > 0
                      ? `${property.parking_spaces} ${t("parkingSpaces", "parking")}`
                      : t("parking", "Parking"),
                },
              ]
                .filter(Boolean)
                .map((item, i) => {
                  const row = item as { icon: React.ReactNode; label: string };
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                    >
                      <span className="text-slate-400">{row.icon}</span>
                      {row.label}
                    </div>
                  );
                })}
            </div>

            {property.description && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900">
                  {t("description", "Description")}
                </h2>
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-slate-600">
                  {property.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
                </p>
              </section>
            )}

            {amenityList.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900">
                  {t("amenities", "Amenities")}
                </h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {amenityList.map((a) => (
                    <li
                      key={a.key}
                      className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200"
                    >
                      <MdCheck className="text-amber-600" size={18} />
                      {a.name}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {mapCoords ? (
              <section>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t("location", "Location")}
                  </h2>
                  {canGetDirections && exactCoords ? (
                    <a
                      href={getDirectionsUrl(exactCoords)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <MdDirections size={18} />
                      {t("getDirections", "Get Directions")}
                    </a>
                  ) : null}
                </div>
                <PropertyMapEmbed
                  coords={mapCoords}
                  approximate={isApproximateMap}
                  approximateLabel={t(
                    "approximateAreaNote",
                    "Approximate area — exact address is hidden until a viewing is confirmed.",
                  )}
                  title={property.title}
                />
              </section>
            ) : null}

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {t("details", "Details")}
              </h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                {property.furnished != null && (
                  <>
                    <dt className="text-slate-500">{t("furnished", "Furnished")}</dt>
                    <dd className="font-medium text-slate-800">
                      {property.furnished ? t("yes", "Yes") : t("no", "No")}
                    </dd>
                  </>
                )}
                {property.lease_term && (
                  <>
                    <dt className="text-slate-500">{t("leaseTerm", "Lease term")}</dt>
                    <dd className="font-medium text-slate-800">{property.lease_term}</dd>
                  </>
                )}
                {property.deposit && (
                  <>
                    <dt className="text-slate-500">{t("deposit", "Deposit")}</dt>
                    <dd className="font-medium text-slate-800">
                      {formatCurrency(parseFloat(String(property.deposit)), currencyCode)}
                    </dd>
                  </>
                )}
                {property.pet_policy && (
                  <>
                    <dt className="text-slate-500">{t("petPolicy", "Pet policy")}</dt>
                    <dd className="font-medium text-slate-800">{property.pet_policy}</dd>
                  </>
                )}
                {property.owner_name && (
                  <>
                    <dt className="text-slate-500">{t("listedBy", "Listed by")}</dt>
                    <dd className="font-medium text-slate-800">{property.owner_name}</dd>
                  </>
                )}
              </dl>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {purpose === "stay" ? (
                <StayBookingPanel
                  propertyId={property.id}
                  propertyTitle={property.title}
                  currency={property.currency}
                  staySettings={property.stay_settings_summary}
                />
              ) : (
                <PropertyEnquiryPanel
                  propertyId={property.id}
                  listingType={property.listing_type}
                  propertyTitle={property.title}
                  allowedLeaseMonths={
                    purpose === "rent" ? property.allowed_lease_months : undefined
                  }
                />
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function PropertyDetailPage() {
  return (
    <PlatformServiceGate slug="property">
      <PropertyDetailContent />
    </PlatformServiceGate>
  );
}
