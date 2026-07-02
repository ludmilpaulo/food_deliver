import { useEffect, useState } from "react";
import { loadGoogleMapsScript } from "@/lib/loadGoogleMapsScript";

type Options = {
  apiKey?: string;
  libraries?: string;
  enabled?: boolean;
};

export function useGoogleMapsScript(options: Options = {}) {
  const { apiKey, libraries, enabled = true } = options;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      return;
    }
    let cancelled = false;
    loadGoogleMapsScript({ apiKey, libraries })
      .then(() => {
        if (!cancelled) {
          setReady(true);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setReady(false);
          setError(err instanceof Error ? err : new Error("Failed to load Google Maps"));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, libraries, enabled]);

  return { ready, error };
}
