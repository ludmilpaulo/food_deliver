import { baseAPI } from "@/services/api";
import { readAuthToken } from "@/lib/authToken";

export type LocationCountry = {
  id: number;
  name: string;
  iso_alpha_2: string;
  flag_url: string;
  flag_icon: string;
};

export type LocationRegion = {
  id: number;
  name: string;
  country_id: number;
};

export type LocationCity = {
  id: number;
  name: string;
  country_id: number;
  region_id: number | null;
  latitude: number | null;
  longitude: number | null;
};

export type LocationDistrict = {
  id: number;
  name: string;
  city_id: number;
};

export type GeocodeNamedRef = {
  id: number | null;
  name: string;
  iso_alpha_2?: string;
  iso_code?: string;
  flag_url?: string;
  flag_icon?: string;
};

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  formatted_address: string;
  street: string;
  postal_code: string;
  country: GeocodeNamedRef;
  region: GeocodeNamedRef;
  city: GeocodeNamedRef;
  district: GeocodeNamedRef;
  provider?: string;
  accuracy?: string;
};

export type PropertyLocationSource = "gps" | "address_search" | "map_pin" | "manual" | "";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asNamedRef(value: unknown): GeocodeNamedRef {
  const row = asRecord(value);
  return {
    id: typeof row.id === "number" ? row.id : null,
    name: typeof row.name === "string" ? row.name : "",
    iso_alpha_2: typeof row.iso_alpha_2 === "string" ? row.iso_alpha_2 : undefined,
    iso_code: typeof row.iso_code === "string" ? row.iso_code : undefined,
    flag_url: typeof row.flag_url === "string" ? row.flag_url : undefined,
    flag_icon: typeof row.flag_icon === "string" ? row.flag_icon : undefined,
  };
}

function mapGeocodeResult(raw: unknown): GeocodeResult {
  const row = asRecord(raw);
  return {
    latitude: typeof row.latitude === "number" ? row.latitude : Number(row.latitude) || 0,
    longitude: typeof row.longitude === "number" ? row.longitude : Number(row.longitude) || 0,
    formatted_address: typeof row.formatted_address === "string" ? row.formatted_address : "",
    street: typeof row.street === "string" ? row.street : "",
    postal_code: typeof row.postal_code === "string" ? row.postal_code : "",
    country: asNamedRef(row.country),
    region: asNamedRef(row.region),
    city: asNamedRef(row.city),
    district: asNamedRef(row.district),
    provider: typeof row.provider === "string" ? row.provider : undefined,
    accuracy: typeof row.accuracy === "string" ? row.accuracy : undefined,
  };
}

async function locationsFetch(path: string, init: RequestInit = {}, auth = false): Promise<unknown> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type") && init.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = readAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const language = localStorage.getItem("language") || "en";
  headers.set("Accept-Language", language);
  const response = await fetch(`${baseAPI}/api/locations${path}`, { ...init, headers });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { detail?: string; error?: string };
      message = body.detail || body.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return response.json();
}

export type ResolvedLocation = {
  country: GeocodeNamedRef;
  region: GeocodeNamedRef;
  city: GeocodeNamedRef;
  distance_km?: number;
};

export async function fetchCountries(): Promise<LocationCountry[]> {
  const data = await locationsFetch("/countries/");
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const row = asRecord(item);
    return {
      id: Number(row.id) || 0,
      name: typeof row.name === "string" ? row.name : "",
      iso_alpha_2: typeof row.iso_alpha_2 === "string" ? row.iso_alpha_2 : "",
      flag_url: typeof row.flag_url === "string" ? row.flag_url : "",
      flag_icon: typeof row.flag_icon === "string" ? row.flag_icon : "",
    };
  });
}

/** Map GPS to nearest catalog city / region for "Near you" headers. */
export async function resolveLocation(latitude: number, longitude: number): Promise<ResolvedLocation> {
  const data = await locationsFetch(
    `/resolve/?lat=${encodeURIComponent(String(latitude))}&lng=${encodeURIComponent(String(longitude))}`,
  );
  const row = asRecord(data);
  return {
    country: asNamedRef(row.country),
    region: asNamedRef(row.region),
    city: asNamedRef(row.city),
    distance_km:
      typeof row.distance_km === "number"
        ? row.distance_km
        : row.distance_km != null
          ? Number(row.distance_km) || undefined
          : undefined,
  };
}

export async function fetchRegions(countryId: number): Promise<LocationRegion[]> {
  const data = await locationsFetch(`/countries/${countryId}/regions/`);
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const row = asRecord(item);
    return {
      id: Number(row.id) || 0,
      name: typeof row.name === "string" ? row.name : "",
      country_id: Number(row.country_id) || countryId,
    };
  });
}

export async function fetchCities(regionId: number): Promise<LocationCity[]> {
  const data = await locationsFetch(`/regions/${regionId}/cities/`);
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const row = asRecord(item);
    return {
      id: Number(row.id) || 0,
      name: typeof row.name === "string" ? row.name : "",
      country_id: Number(row.country_id) || 0,
      region_id: typeof row.region_id === "number" ? row.region_id : null,
      latitude: typeof row.latitude === "number" ? row.latitude : null,
      longitude: typeof row.longitude === "number" ? row.longitude : null,
    };
  });
}

export async function fetchDistricts(cityId: number): Promise<LocationDistrict[]> {
  const data = await locationsFetch(`/cities/${cityId}/districts/`);
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const row = asRecord(item);
    return {
      id: Number(row.id) || 0,
      name: typeof row.name === "string" ? row.name : "",
      city_id: Number(row.city_id) || cityId,
    };
  });
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult> {
  const data = await locationsFetch(
    "/reverse/",
    {
      method: "POST",
      body: JSON.stringify({ latitude, longitude }),
    },
    true,
  );
  return mapGeocodeResult(data);
}

export async function forwardGeocode(query: string, countryId?: number | null): Promise<GeocodeResult[]> {
  const body: { query: string; country?: number } = { query };
  if (countryId) body.country = countryId;
  const data = await locationsFetch(
    "/forward/",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    true,
  );
  if (!Array.isArray(data)) return [];
  return data.map(mapGeocodeResult);
}
