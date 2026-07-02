type LoadGoogleMapsOptions = {
  apiKey?: string;
  libraries?: string;
};

type GoogleMapsWindow = Window & {
  google?: {
    maps?: unknown;
  };
};

let loadPromise: Promise<void> | null = null;

function mapsWindow(): GoogleMapsWindow {
  return window as GoogleMapsWindow;
}

function buildScriptUrl(options: LoadGoogleMapsOptions): string {
  const key = options.apiKey ?? process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
  const params = new URLSearchParams({ key });
  if (options.libraries) {
    params.set("libraries", options.libraries);
  }
  return `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
}

function waitForExistingScript(script: HTMLScriptElement): Promise<void> {
  if (mapsWindow().google?.maps) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Failed to load Google Maps")), { once: true });
  });
}

/** Load the Google Maps JavaScript API once per page (shared across components). */
export function loadGoogleMapsScript(options: LoadGoogleMapsOptions = {}): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (mapsWindow().google?.maps) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>('script[src*="maps.googleapis.com/maps/api/js"]');
  if (existing) {
    return waitForExistingScript(existing);
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = buildScriptUrl(options);
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loadPromise = null;
        reject(new Error("Failed to load Google Maps"));
      };
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}
