"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  MdSearch,
  MdBed,
  MdBathtub,
  MdSquareFoot,
  MdHome,
  MdTune,
  MdFavoriteBorder,
  MdChevronLeft,
  MdChevronRight,
  MdMyLocation,
  MdPlace,
} from "react-icons/md";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { baseAPI } from "@/services/types";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";
import { formatCurrency, getCurrencyForCountry } from "@/utils/currency";
import { useUserRegion } from "@/hooks/useUserRegion";
import { useTranslation } from "@/hooks/useTranslation";
import PlatformServiceGate from "@/components/platform/PlatformServiceGate";
import {
  fetchCities,
  fetchCountries,
  fetchRegions,
  resolveLocation,
  type LocationCity,
  type LocationCountry,
  type LocationRegion,
  type ResolvedLocation,
} from "@/lib/locationsApi";
import { formatDistanceKm } from "@/lib/propertyDirections";

type Purpose = "rent" | "stay" | "sale" | "";
type ListingType = "rent_daily" | "rent_monthly" | "buy" | "";
type DiscoveryMode = "nearby" | "search";
type LocationPermission = "unknown" | "granted" | "denied" | "unavailable";

type Amenity = { key: string; name: string; icon: string };

type PropertyLocationCountry = {
  id?: number | null;
  name?: string;
  iso_code?: string;
  flag_url?: string;
  flag_icon?: string;
};

type Property = {
  id: number;
  title: string;
  city: string;
  suburb?: string;
  listing_type: string;
  listing_type_display?: string;
  purpose?: string;
  purpose_display?: string;
  property_type?: string;
  property_type_display?: string;
  price: string;
  currency: string;
  price_label?: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  image_urls: string[];
  furnished?: boolean;
  parking?: boolean;
  distance_km?: number | null;
  country_code?: string;
  location?: {
    country?: PropertyLocationCountry;
    city?: { name?: string };
    district?: { name?: string };
  };
};

type Paginated = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Property[];
};

type UserCoords = { latitude: number; longitude: number };

const PROPERTY_TYPES = [
  { value: "", labelKey: "anyType" },
  { value: "apartment", labelKey: "ptype_apartment" },
  { value: "house", labelKey: "ptype_house" },
  { value: "villa", labelKey: "ptype_villa" },
  { value: "townhouse", labelKey: "ptype_townhouse" },
  { value: "studio", labelKey: "ptype_studio" },
  { value: "room", labelKey: "ptype_room" },
  { value: "office", labelKey: "ptype_office" },
  { value: "commercial", labelKey: "ptype_commercial" },
  { value: "land", labelKey: "ptype_land" },
] as const;

function unwrapResults(data: unknown): { items: Property[]; count: number } {
  if (Array.isArray(data)) {
    return { items: data as Property[], count: data.length };
  }
  if (data && typeof data === "object" && "results" in data) {
    const page = data as Paginated;
    return {
      items: Array.isArray(page.results) ? page.results : [],
      count: typeof page.count === "number" ? page.count : 0,
    };
  }
  return { items: [], count: 0 };
}

function flagForProperty(prop: Property): { url?: string; icon?: string } {
  const country = prop.location?.country;
  return {
    url: country?.flag_url || undefined,
    icon: country?.flag_icon || undefined,
  };
}

function PropertiesPageContent() {
  const { t } = useTranslation();
  const { region: regionCode } = useUserRegion();
  const currencyCode = getCurrencyForCountry(regionCode) as "AOA" | "USD" | "EUR";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlCountry = searchParams.get("country") || "";
  const urlRegion = searchParams.get("region") || "";
  const urlCity = searchParams.get("city") || "";
  const urlMode = searchParams.get("mode");
  const urlPurpose = searchParams.get("purpose");

  const [purpose, setPurpose] = useState<Purpose>(
    urlPurpose === "stay" || urlPurpose === "sale" || urlPurpose === "rent"
      ? urlPurpose
      : "rent",
  );
  const [listingType, setListingType] = useState<ListingType>("");
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [cityText, setCityText] = useState("");
  const [countryCode, setCountryCode] = useState(urlCountry);
  const [regionId, setRegionId] = useState(urlRegion);
  const [cityId, setCityId] = useState(urlCity);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [furnished, setFurnished] = useState(false);
  const [parking, setParking] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>(
    urlMode === "search" || urlCountry || urlRegion || urlCity ? "search" : "nearby",
  );
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState<LocationPermission>("unknown");
  const [nearYou, setNearYou] = useState<ResolvedLocation | null>(null);
  const [locating, setLocating] = useState(false);

  const [countries, setCountries] = useState<LocationCountry[]>([]);
  const [regions, setRegions] = useState<LocationRegion[]>([]);
  const [cities, setCities] = useState<LocationCity[]>([]);

  useEffect(() => {
    fetch(`${baseAPI}/properties/amenities/`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAmenities(Array.isArray(data) ? data : []))
      .catch(() => setAmenities([]));
  }, []);

  useEffect(() => {
    void fetchCountries()
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    const selected = countries.find(
      (c) => c.iso_alpha_2.toUpperCase() === countryCode.toUpperCase() || String(c.id) === countryCode,
    );
    if (!selected) {
      setRegions([]);
      return;
    }
    void fetchRegions(selected.id)
      .then(setRegions)
      .catch(() => setRegions([]));
  }, [countries, countryCode]);

  useEffect(() => {
    if (!regionId || !/^\d+$/.test(regionId)) {
      setCities([]);
      return;
    }
    void fetchCities(Number(regionId))
      .then(setCities)
      .catch(() => setCities([]));
  }, [regionId]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (countryCode) params.set("country", countryCode);
    if (regionId) params.set("region", regionId);
    if (cityId) params.set("city", cityId);
    if (discoveryMode === "search") params.set("mode", "search");
    const qs = params.toString();
    const current = searchParams.toString();
    if (qs === current) return;
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [countryCode, regionId, cityId, discoveryMode, pathname, router, searchParams]);

  const requestLocation = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationPermission("unavailable");
      setCoords(null);
      return null;
    }
    setLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 12000,
          maximumAge: 60_000,
        });
      });
      const next = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCoords(next);
      setLocationPermission("granted");
      try {
        const resolved = await resolveLocation(next.latitude, next.longitude);
        setNearYou(resolved);
      } catch {
        setNearYou(null);
      }
      return next;
    } catch {
      setCoords(null);
      setLocationPermission("denied");
      setNearYou(null);
      return null;
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    if (discoveryMode !== "nearby") return;
    void requestLocation();
  }, [discoveryMode, requestLocation]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (purpose) params.set("purpose", purpose);
    if (listingType) params.set("listing_type", listingType);
    if (search) params.set("search", search);
    if (countryCode) params.set("country", countryCode);
    if (regionId) params.set("region", regionId);
    if (cityId) {
      params.set("city", cityId);
    } else if (cityText) {
      params.set("city", cityText);
    }
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (bathrooms) params.set("bathrooms", bathrooms);
    if (propertyType) params.set("property_type", propertyType);
    if (furnished) params.set("furnished", "true");
    if (parking) params.set("parking", "true");
    if (selectedAmenities.length) params.set("amenities", selectedAmenities.join(","));
    if (ordering) params.set("ordering", ordering);
    if (coords && discoveryMode === "search") {
      params.set("latitude", String(coords.latitude));
      params.set("longitude", String(coords.longitude));
      if (ordering === "distance") params.set("ordering", "distance");
    }
    params.set("page", String(page));
    params.set("page_size", "12");
    return params.toString();
  }, [
    purpose,
    listingType,
    search,
    countryCode,
    regionId,
    cityId,
    cityText,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    propertyType,
    furnished,
    parking,
    selectedAmenities,
    ordering,
    page,
    coords,
    discoveryMode,
  ]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const run = async () => {
      try {
        let url = `${baseAPI}/api/properties/search/?${queryString}`;
        if (discoveryMode === "nearby" && coords) {
          const nearby = new URLSearchParams();
          nearby.set("latitude", String(coords.latitude));
          nearby.set("longitude", String(coords.longitude));
          if (purpose) nearby.set("purpose", purpose);
          nearby.set("page", String(page));
          nearby.set("page_size", "12");
          url = `${baseAPI}/api/properties/nearby/?${nearby.toString()}`;
        } else if (discoveryMode === "nearby" && locationPermission === "unknown") {
          return;
        } else if (discoveryMode === "nearby" && !coords) {
          if (!cancelled) {
            setProperties([]);
            setTotal(0);
          }
          return;
        }

        const res = await fetch(url);
        const data: unknown = await res.json().catch(() => null);
        if (cancelled) return;
        const { items, count } = unwrapResults(data);
        setProperties(items);
        setTotal(count);
      } catch {
        if (!cancelled) {
          setProperties([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [queryString, discoveryMode, coords, locationPermission, purpose, page]);

  const toggleAmenity = useCallback((key: string) => {
    setPage(1);
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const clearFilters = () => {
    setListingType("");
    setCityText("");
    setCountryCode("");
    setRegionId("");
    setCityId("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setBathrooms("");
    setPropertyType("");
    setFurnished(false);
    setParking(false);
    setSelectedAmenities([]);
    setOrdering("-created_at");
    setPage(1);
  };

  const switchToSearch = () => {
    setDiscoveryMode("search");
    setPage(1);
  };

  const switchToNearby = async () => {
    setDiscoveryMode("nearby");
    setPage(1);
    await requestLocation();
  };

  const totalPages = Math.max(1, Math.ceil(total / 12));
  const nearYouLabel = nearYou
    ? [nearYou.city?.name, nearYou.region?.name, nearYou.country?.name].filter(Boolean).join(", ")
    : "";

  const FiltersPanel = (
    <aside className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {t("country", "Country")}
        </p>
        <select
          value={countryCode}
          onChange={(e) => {
            setCountryCode(e.target.value);
            setRegionId("");
            setCityId("");
            setDiscoveryMode("search");
            setPage(1);
          }}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          <option value="">{t("anyCountry", "Any country")}</option>
          {countries.map((c) => (
            <option key={c.id} value={c.iso_alpha_2 || String(c.id)}>
              {c.flag_icon ? `${c.flag_icon} ` : ""}
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {t("region", "Region")}
        </p>
        <select
          value={regionId}
          disabled={!countryCode || regions.length === 0}
          onChange={(e) => {
            setRegionId(e.target.value);
            setCityId("");
            setDiscoveryMode("search");
            setPage(1);
          }}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 disabled:opacity-50"
        >
          <option value="">{t("anyRegion", "Any region")}</option>
          {regions.map((r) => (
            <option key={r.id} value={String(r.id)}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {t("city", "City")}
        </p>
        <select
          value={cityId}
          disabled={!regionId || cities.length === 0}
          onChange={(e) => {
            setCityId(e.target.value);
            setCityText("");
            setDiscoveryMode("search");
            setPage(1);
          }}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 disabled:opacity-50 mb-2"
        >
          <option value="">{t("anyCity", "Any city")}</option>
          {cities.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder={t("cityExample", "e.g. Luanda")}
          value={cityText}
          onChange={(e) => {
            setCityText(e.target.value);
            setCityId("");
            setDiscoveryMode("search");
            setPage(1);
          }}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {t("propertyType", "Property type")}
        </p>
        <select
          value={propertyType}
          onChange={(e) => {
            setPropertyType(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        >
          {PROPERTY_TYPES.map((opt) => (
            <option key={opt.value || "any"} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {purpose === "rent" && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            {t("rentPeriod", "Rent period")}
          </p>
          <div className="flex flex-col gap-2">
            {(
              [
                { value: "", labelKey: "any" },
                { value: "rent_monthly", labelKey: "monthly" },
                { value: "rent_daily", labelKey: "daily" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value || "any-period"}
                type="button"
                onClick={() => {
                  setListingType(opt.value as ListingType);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  listingType === opt.value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            {t("beds", "Beds")}
          </p>
          <select
            value={bedrooms}
            onChange={(e) => {
              setBedrooms(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="">{t("any", "Any")}</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {n}+
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            {t("baths", "Baths")}
          </p>
          <select
            value={bathrooms}
            onChange={(e) => {
              setBathrooms(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="">{t("any", "Any")}</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={String(n)}>
                {n}+
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {t("priceRange", "Price range")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={t("min", "Min")}
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          />
          <input
            type="number"
            placeholder={t("max", "Max")}
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={furnished}
            onChange={(e) => {
              setFurnished(e.target.checked);
              setPage(1);
            }}
            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          {t("furnished", "Furnished")}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={parking}
            onChange={(e) => {
              setParking(e.target.checked);
              setPage(1);
            }}
            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          {t("parking", "Parking")}
        </label>
      </div>

      {amenities.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            {t("amenities", "Amenities")}
          </p>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => {
              const active = selectedAmenities.includes(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggleAmenity(a.key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={clearFilters}
        className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        {t("clearFilters", "Clear filters")}
      </button>
    </aside>
  );

  const showLocationFallback =
    discoveryMode === "nearby" &&
    (locationPermission === "denied" || locationPermission === "unavailable") &&
    !coords;

  return (
    <main className="min-h-screen bg-[#f4f6f8]">
      <div className="border-b border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                <HiOutlineBuildingOffice2 size={16} />
                {t("kudyaPropertiesBrand", "Kudya Properties")}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {t("findYourNextHome", "Find your next home")}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                {t(
                  "propertiesMarketplaceSubtitle",
                  "Browse verified rentals and homes for sale across Angola. Looking for a short stay? Visit Stay.",
                )}
              </p>
              {discoveryMode === "nearby" && nearYouLabel ? (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-amber-100">
                  {nearYou?.country?.flag_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={nearYou.country.flag_url}
                      alt=""
                      className="h-3.5 w-5 rounded-sm object-cover"
                    />
                  ) : nearYou?.country?.flag_icon ? (
                    <span aria-hidden>{nearYou.country.flag_icon}</span>
                  ) : (
                    <MdPlace size={16} />
                  )}
                  {t("nearYou", "Near you")}: {nearYouLabel}
                </p>
              ) : null}
            </div>
            <Link
              href="/stay"
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/10"
            >
              {t("exploreStay", "Explore Stay →")}
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void switchToNearby()}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                discoveryMode === "nearby"
                  ? "bg-amber-500 text-slate-950"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              <MdMyLocation size={18} />
              {locating ? t("locating", "Locating…") : t("nearby", "Nearby")}
            </button>
            <button
              type="button"
              onClick={switchToSearch}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                discoveryMode === "search"
                  ? "bg-amber-500 text-slate-950"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              {t("searchManually", "Search manually")}
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-xl bg-white/10 p-1 backdrop-blur">
              {(
                [
                  { value: "rent" as Purpose, label: t("forRent", "For Rent") },
                  { value: "stay" as Purpose, label: t("stay", "Stay") },
                  { value: "sale" as Purpose, label: t("forSale", "For Sale") },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setPurpose(tab.value);
                    setListingType("");
                    setPage(1);
                  }}
                  className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                    purpose === tab.value
                      ? "bg-amber-500 text-slate-950 shadow"
                      : "text-slate-200 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form
              className="flex flex-1 gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(searchDraft.trim());
                setDiscoveryMode("search");
                setPage(1);
              }}
            >
              <div className="relative flex-1">
                <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                <input
                  type="search"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  placeholder={t("searchPropertiesPlaceholder", "Search by title, city, suburb...")}
                  className="w-full rounded-xl border-0 bg-white py-3 pl-11 pr-4 text-slate-900 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
              >
                {t("search", "Search")}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {showLocationFallback ? (
          <div className="mb-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-6 py-10 text-center">
            <MdMyLocation size={40} className="mx-auto text-amber-600" />
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {t("locationNeeded", "Enable location to see homes near you")}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {locationPermission === "unavailable"
                ? t("locationUnavailable", "Location is not available in this browser.")
                : t(
                    "locationPermissionDenied",
                    "Location permission was denied. Enable it in your browser, or search by country and city.",
                  )}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => void switchToNearby()}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {t("enableLocation", "Enable location")}
              </button>
              <button
                type="button"
                onClick={switchToSearch}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800"
              >
                {t("searchManually", "Search manually")}
              </button>
            </div>
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {loading || locating
              ? t("loadingProperties", "Loading properties...")
              : total === 1
                ? t("onePropertyFound", "1 property")
                : t("propertiesFound", "{{count}} properties").replace(
                    "{{count}}",
                    String(total),
                  )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 lg:hidden"
              onClick={() => setFiltersOpen((o) => !o)}
            >
              <MdTune size={18} />
              {t("filters", "Filters")}
            </button>
            <select
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value="-created_at">{t("newest", "Newest")}</option>
              <option value="price">{t("priceLowHigh", "Price: low to high")}</option>
              <option value="-price">{t("priceHighLow", "Price: high to low")}</option>
              <option value="-bedrooms">{t("mostBeds", "Most bedrooms")}</option>
              {coords ? (
                <option value="distance">{t("nearest", "Nearest")}</option>
              ) : null}
            </select>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${filtersOpen ? "block" : "hidden"} lg:block`}>
            {FiltersPanel}
          </div>

          <div>
            {showLocationFallback ? null : loading || (discoveryMode === "nearby" && locating && !coords) ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200/70" />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <MdHome size={56} className="mx-auto text-slate-300" />
                <p className="mt-4 text-lg font-medium text-slate-800">
                  {t("noPropertiesFound", "No properties match your filters")}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {t("tryAdjustingFilters", "Try adjusting filters or search another city.")}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  {t("resetSearch", "Reset search")}
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {properties.map((prop) => {
                    const cover = resolveMediaUrl(prop.image_urls?.[0]);
                    const location = [
                      prop.location?.district?.name || prop.suburb,
                      prop.location?.city?.name || prop.city,
                    ]
                      .filter(Boolean)
                      .join(", ");
                    const flag = flagForProperty(prop);
                    const distanceLabel = formatDistanceKm(prop.distance_km);
                    return (
                      <Link
                        key={prop.id}
                        href={`/properties/${prop.id}`}
                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                          {prop.image_urls?.[0] ? (
                            <Image
                              src={cover}
                              alt={prop.title}
                              fill
                              className="object-cover transition duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <MdHome size={48} className="text-slate-300" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-3 pt-10">
                            <p className="text-lg font-semibold text-white">
                              {formatCurrency(parseFloat(prop.price), currencyCode)}
                              <span className="ml-1 text-xs font-normal text-slate-200">
                                {prop.purpose === "stay" || prop.listing_type === "rent_daily"
                                  ? t("perNightShort", "/ night")
                                  : prop.purpose === "rent" || prop.listing_type === "rent_monthly"
                                    ? t("perMonthShort", "/ month")
                                    : ""}
                              </span>
                            </p>
                          </div>
                          <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-800 shadow">
                            {prop.purpose === "stay"
                              ? t("stay", "Stay")
                              : prop.listing_type === "buy" || prop.purpose === "sale"
                                ? t("forSale", "For Sale")
                                : t("forRent", "For Rent")}
                          </span>
                          <span className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-slate-500 shadow">
                            <MdFavoriteBorder size={16} />
                          </span>
                          {distanceLabel ? (
                            <span className="absolute bottom-14 right-3 rounded-md bg-slate-900/85 px-2 py-1 text-[11px] font-semibold text-white">
                              {distanceLabel}
                            </span>
                          ) : null}
                        </div>
                        <div className="p-4">
                          <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-slate-700">
                            {prop.title}
                          </h3>
                          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
                            {flag.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={flag.url} alt="" className="h-3 w-5 shrink-0 rounded-sm object-cover" />
                            ) : flag.icon ? (
                              <span className="shrink-0" aria-hidden>
                                {flag.icon}
                              </span>
                            ) : null}
                            <span className="truncate">{location}</span>
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
                            {prop.bedrooms > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <MdBed size={14} /> {prop.bedrooms}
                              </span>
                            )}
                            {prop.bathrooms > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <MdBathtub size={14} /> {prop.bathrooms}
                              </span>
                            )}
                            {prop.area_sqm ? (
                              <span className="inline-flex items-center gap-1">
                                <MdSquareFoot size={14} /> {prop.area_sqm} m²
                              </span>
                            ) : null}
                            {prop.property_type ? (
                              <span className="ml-auto text-slate-400">
                                {t(`ptype_${prop.property_type}`, prop.property_type_display || prop.property_type)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-40"
                    >
                      <MdChevronLeft size={18} /> {t("prev", "Prev")}
                    </button>
                    <span className="text-sm text-slate-600">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-40"
                    >
                      {t("next", "Next")} <MdChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PropertiesPage() {
  return (
    <PlatformServiceGate slug="property">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] text-slate-600">
            Loading…
          </div>
        }
      >
        <PropertiesPageContent />
      </Suspense>
    </PlatformServiceGate>
  );
}
