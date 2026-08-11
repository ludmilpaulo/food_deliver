"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  fetchCities,
  fetchCountries,
  fetchDistricts,
  fetchRegions,
  forwardGeocode,
  reverseGeocode,
  type GeocodeResult,
  type LocationCity,
  type LocationCountry,
  type LocationDistrict,
  type LocationRegion,
  type PropertyLocationSource,
} from "@/lib/locationsApi";

export type PropertyLocationValue = {
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
  city: string;
  suburb: string;
  address: string;
};

type Props = {
  value: PropertyLocationValue;
  onChange: (next: PropertyLocationValue) => void;
};

const LocationMap = dynamic(() => import("./PropertyLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
      Loading map…
    </div>
  ),
});

function legacyFromNames(parts: {
  street: string;
  formattedAddress: string;
  cityName: string;
  districtName: string;
}): Pick<PropertyLocationValue, "city" | "suburb" | "address"> {
  const address =
    parts.street ||
    parts.formattedAddress ||
    [parts.districtName, parts.cityName].filter(Boolean).join(", ");
  return {
    city: parts.cityName,
    suburb: parts.districtName,
    address,
  };
}

export default function PropertyLocationPicker({ value, onChange }: Props) {
  const [countries, setCountries] = useState<LocationCountry[]>([]);
  const [regions, setRegions] = useState<LocationRegion[]>([]);
  const [cities, setCities] = useState<LocationCity[]>([]);
  const [districts, setDistricts] = useState<LocationDistrict[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<GeocodeResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [pendingFound, setPendingFound] = useState(false);

  useEffect(() => {
    void fetchCountries()
      .then(setCountries)
      .catch(() => setError("Could not load countries."));
  }, []);

  useEffect(() => {
    if (!value.countryId) {
      setRegions([]);
      return;
    }
    setLoadingCatalog(true);
    void fetchRegions(value.countryId)
      .then(setRegions)
      .catch(() => setRegions([]))
      .finally(() => setLoadingCatalog(false));
  }, [value.countryId]);

  useEffect(() => {
    if (!value.provinceId) {
      setCities([]);
      return;
    }
    setLoadingCatalog(true);
    void fetchCities(value.provinceId)
      .then(setCities)
      .catch(() => setCities([]))
      .finally(() => setLoadingCatalog(false));
  }, [value.provinceId]);

  useEffect(() => {
    if (!value.cityRefId) {
      setDistricts([]);
      return;
    }
    void fetchDistricts(value.cityRefId)
      .then(setDistricts)
      .catch(() => setDistricts([]));
  }, [value.cityRefId]);

  const countryName = useMemo(
    () => countries.find((c) => c.id === value.countryId)?.name ?? "",
    [countries, value.countryId],
  );
  const provinceName = useMemo(
    () => regions.find((r) => r.id === value.provinceId)?.name ?? "",
    [regions, value.provinceId],
  );
  const cityName = useMemo(
    () => cities.find((c) => c.id === value.cityRefId)?.name ?? value.city,
    [cities, value.cityRefId, value.city],
  );
  const districtName = useMemo(
    () => districts.find((d) => d.id === value.districtId)?.name ?? value.suburb,
    [districts, value.districtId, value.suburb],
  );

  const applyGeocode = useCallback(
    (result: GeocodeResult, source: PropertyLocationSource, confirmed = false) => {
      const nextCity = result.city.name || cityName;
      const nextDistrict = result.district.name || districtName;
      const legacy = legacyFromNames({
        street: result.street,
        formattedAddress: result.formatted_address,
        cityName: nextCity,
        districtName: nextDistrict,
      });
      setPendingFound(!confirmed);
      onChange({
        ...value,
        countryId: result.country.id ?? value.countryId,
        provinceId: result.region.id ?? value.provinceId,
        cityRefId: result.city.id ?? value.cityRefId,
        districtId: result.district.id ?? value.districtId,
        latitude: result.latitude,
        longitude: result.longitude,
        street: result.street || value.street,
        formattedAddress: result.formatted_address || value.formattedAddress,
        locationSource: source,
        locationConfirmed: confirmed,
        ...legacy,
      });
    },
    [cityName, districtName, onChange, value],
  );

  const reverseAt = useCallback(
    async (latitude: number, longitude: number, source: PropertyLocationSource) => {
      setBusy(true);
      setError(null);
      try {
        const result = await reverseGeocode(latitude, longitude);
        applyGeocode(result, source, false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Reverse geocode failed.");
        onChange({
          ...value,
          latitude,
          longitude,
          locationSource: source,
          locationConfirmed: false,
        });
        setPendingFound(true);
      } finally {
        setBusy(false);
      }
    },
    [applyGeocode, onChange, value],
  );

  const requestCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setBusy(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void reverseAt(position.coords.latitude, position.coords.longitude, "gps").finally(() =>
          setBusy(false),
        );
      },
      (geoError) => {
        setBusy(false);
        setError(geoError.message || "Could not get current location.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const searchAddress = async () => {
    const query = searchQuery.trim();
    if (query.length < 3) {
      setError("Enter at least 3 characters to search.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const results = await forwardGeocode(query, value.countryId);
      setCandidates(results);
      if (!results.length) setError("No addresses found.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Address search failed.");
    } finally {
      setBusy(false);
    }
  };

  const selectCountry = (countryId: number) => {
    onChange({
      ...value,
      countryId,
      provinceId: null,
      cityRefId: null,
      districtId: null,
      locationConfirmed: false,
      city: "",
      suburb: "",
    });
    setCandidates([]);
    setPendingFound(false);
  };

  const selectProvince = (provinceId: number) => {
    onChange({
      ...value,
      provinceId,
      cityRefId: null,
      districtId: null,
      locationConfirmed: false,
      city: "",
      suburb: "",
    });
    setPendingFound(false);
  };

  const selectCity = (city: LocationCity) => {
    const legacy = legacyFromNames({
      street: value.street,
      formattedAddress: value.formattedAddress,
      cityName: city.name,
      districtName: "",
    });
    const next: PropertyLocationValue = {
      ...value,
      cityRefId: city.id,
      districtId: null,
      locationConfirmed: false,
      ...legacy,
      suburb: "",
    };
    // City centroid is enough to submit for approval; GPS/map can refine later.
    if (city.latitude != null && city.longitude != null) {
      next.latitude = city.latitude;
      next.longitude = city.longitude;
      next.locationSource = value.locationSource || "manual";
      next.locationConfirmed = true;
      next.formattedAddress =
        value.formattedAddress ||
        [city.name, provinceName, countryName].filter(Boolean).join(", ");
      next.address = next.address || next.formattedAddress;
      setPendingFound(false);
    } else {
      setPendingFound(false);
      setError("This city has no map center yet. Use Current Location or Pick on Map.");
    }
    onChange(next);
  };

  const selectDistrict = (district: LocationDistrict) => {
    const legacy = legacyFromNames({
      street: value.street,
      formattedAddress: value.formattedAddress,
      cityName,
      districtName: district.name,
    });
    onChange({
      ...value,
      districtId: district.id,
      ...legacy,
      locationConfirmed:
        value.latitude != null && value.longitude != null
          ? value.locationConfirmed || true
          : false,
    });
  };

  const confirmLocation = () => {
    if (value.latitude == null || value.longitude == null) return;
    setPendingFound(false);
    onChange({ ...value, locationConfirmed: true });
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Country</p>
        <div className="flex flex-wrap gap-2">
          {countries.map((country) => {
            const active = value.countryId === country.id;
            return (
              <button
                key={country.id}
                type="button"
                onClick={() => selectCountry(country.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  active
                    ? "border-teal-700 bg-teal-700 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {country.flag_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={country.flag_url} alt="" className="h-3 w-5 rounded-sm object-cover" />
                ) : country.flag_icon ? (
                  <span>{country.flag_icon}</span>
                ) : null}
                {country.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Province / Region
        </p>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => {
            const active = value.provinceId === region.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => selectProvince(region.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {region.name}
              </button>
            );
          })}
          {!regions.length && value.countryId ? (
            <span className="text-xs text-slate-500">
              {loadingCatalog ? "Loading…" : "No regions found"}
            </span>
          ) : null}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">City</p>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => {
            const active = value.cityRefId === city.id;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => selectCity(city)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>
      </div>

      {districts.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            District (optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {districts.map((district) => {
              const active = value.districtId === district.id;
              return (
                <button
                  key={district.id}
                  type="button"
                  onClick={() => selectDistrict(district)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                    active
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {district.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <input
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
        placeholder="Street / building"
        value={value.street}
        onChange={(e) => {
          const street = e.target.value;
          const legacy = legacyFromNames({
            street,
            formattedAddress: value.formattedAddress,
            cityName,
            districtName,
          });
          onChange({ ...value, street, ...legacy, locationConfirmed: false });
        }}
      />

      <div className="flex gap-2">
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
          placeholder="Search place or address"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void searchAddress();
            }
          }}
        />
        <button
          type="button"
          onClick={() => void searchAddress()}
          className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white"
        >
          Search
        </button>
      </div>

      {candidates.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {candidates.map((item, index) => (
            <button
              key={`${item.latitude}-${item.longitude}-${index}`}
              type="button"
              className="block w-full border-b border-slate-100 px-3 py-2.5 text-left text-sm text-slate-700 last:border-0 hover:bg-slate-50"
              onClick={() => {
                applyGeocode(item, "address_search", false);
                setCandidates([]);
                setSearchQuery(item.formatted_address || searchQuery);
              }}
            >
              {item.formatted_address ||
                [item.street, item.city.name, item.region.name, item.country.name]
                  .filter(Boolean)
                  .join(", ")}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void requestCurrentLocation()}
          className="rounded-xl border border-teal-700 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800"
        >
          Use Current Location
        </button>
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="rounded-xl border border-teal-700 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800"
        >
          Pick on Map
        </button>
      </div>

      {busy ? <p className="text-sm text-slate-500">Working…</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {(pendingFound || value.locationConfirmed) && value.latitude != null ? (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
          <p className="font-bold text-teal-800">
            {value.locationConfirmed ? "Location confirmed" : "Location Found"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {value.formattedAddress ||
              [value.street, districtName, cityName, provinceName, countryName]
                .filter(Boolean)
                .join(", ")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {value.latitude.toFixed(5)}, {value.longitude?.toFixed(5)}
          </p>
          <div className="mt-3 flex gap-2">
            {!value.locationConfirmed ? (
              <button
                type="button"
                onClick={confirmLocation}
                className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white"
              >
                Confirm
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                onChange({ ...value, locationConfirmed: false });
                setMapOpen(true);
              }}
              className="rounded-xl border border-teal-700 px-4 py-2 text-sm font-bold text-teal-800"
            >
              Adjust
            </button>
          </div>
        </div>
      ) : null}

      <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <span className="text-sm font-semibold text-slate-700">Show exact address publicly</span>
        <input
          type="checkbox"
          checked={value.showExactAddress}
          onChange={(e) => onChange({ ...value, showExactAddress: e.target.checked })}
          className="h-4 w-4 accent-teal-700"
        />
      </label>

      {mapOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h3 className="font-bold text-slate-900">Pick on Map</h3>
              <button
                type="button"
                onClick={() => setMapOpen(false)}
                className="text-sm font-semibold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <div className="h-80 w-full">
              <LocationMap
                latitude={value.latitude}
                longitude={value.longitude}
                onPick={(latitude, longitude) => {
                  void reverseAt(latitude, longitude, "map_pin");
                }}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setMapOpen(false);
                  setPendingFound(true);
                }}
                className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
