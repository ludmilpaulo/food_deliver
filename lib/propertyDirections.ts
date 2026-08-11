/** Open external maps with coordinate destinations only (no free-text geocoding). */

export type MapCoords = {
  latitude: number;
  longitude: number;
};

export function hasValidCoords(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): boolean {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

export function toMapCoords(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): MapCoords | null {
  if (!hasValidCoords(latitude, longitude)) return null;
  return { latitude: latitude as number, longitude: longitude as number };
}

export function getPropertyMapCoords(location: {
  latitude?: number | null;
  longitude?: number | null;
  approximate_latitude?: number | null;
  approximate_longitude?: number | null;
} | null | undefined): MapCoords | null {
  if (!location) return null;
  return (
    toMapCoords(location.latitude, location.longitude) ||
    toMapCoords(location.approximate_latitude, location.approximate_longitude)
  );
}

/** Google Maps directions URL using lat,lng only. */
export function getDirectionsUrl(coords: MapCoords): string {
  const destination = `${coords.latitude},${coords.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/** Google Maps place/search URL using lat,lng only. */
export function getMapsSearchUrl(coords: MapCoords): string {
  const query = `${coords.latitude},${coords.longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** OSM embed (no API key) for approximate or exact pin display. */
export function getMapEmbedUrl(coords: MapCoords, zoom = 14): string {
  const { latitude, longitude } = coords;
  const delta = 0.02 / Math.max(zoom / 14, 0.5);
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

export function formatDistanceKm(distanceKm: number | null | undefined): string | null {
  if (distanceKm == null || !Number.isFinite(distanceKm)) return null;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km`;
}
