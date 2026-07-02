/** Shared Google Maps API key for web maps (Street View, satellite, etc.). */
export function getGoogleMapsApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY?.trim() ||
    ''
  );
}

export function hasGoogleMapsApiKey(): boolean {
  return getGoogleMapsApiKey().length > 0;
}
