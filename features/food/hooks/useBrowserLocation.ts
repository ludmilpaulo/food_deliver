'use client';

import { useCallback, useEffect, useState } from 'react';

export type Coordinates = { latitude: number; longitude: number };

const STORAGE_KEY = 'kudya_food_location';

function readStored(): Coordinates | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Coordinates>;
    if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
      return { latitude: parsed.latitude, longitude: parsed.longitude };
    }
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

/** Customer's delivery coordinates: remembered choice first, browser geolocation on request. */
export function useBrowserLocation() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<'idle' | 'locating' | 'denied' | 'unavailable'>('idle');

  useEffect(() => {
    setCoords(readStored());
  }, []);

  const remember = useCallback((next: Coordinates | null) => {
    setCoords(next);
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        remember({
          latitude: Math.round(position.coords.latitude * 1e6) / 1e6,
          longitude: Math.round(position.coords.longitude * 1e6) / 1e6,
        });
        setStatus('idle');
      },
      (error) => setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 300_000 },
    );
  }, [remember]);

  return { coords, status, locate, setCoords: remember };
}
