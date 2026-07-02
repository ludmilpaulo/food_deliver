import { useEffect, useState } from "react";
import { loadGoogleMapsScript } from "@/lib/loadGoogleMapsScript";

/**
 * @deprecated Use useGoogleMapsScript instead — this wrapper dedupes script injection.
 */
const useLoadScript = (url: string, callback: () => void) => {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const parsed = new URL(url);
    const key = parsed.searchParams.get("key") ?? undefined;
    const libraries = parsed.searchParams.get("libraries") ?? undefined;

    loadGoogleMapsScript({ apiKey: key, libraries })
      .then(() => {
        if (!cancelled) {
          callback();
          setDone(true);
        }
      })
      .catch(() => {
        if (!cancelled) setDone(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- legacy API; callback intentionally not a dependency
  }, [url]);

  return done;
};

export default useLoadScript;
