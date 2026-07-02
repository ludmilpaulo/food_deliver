'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { adminDriverLiveWsUrl } from '@/utils/websocket';

export type AdminDriverLocationEvent = {
  event: 'driver_location_updated';
  driver_id: number;
  latitude: number;
  longitude: number;
  status: string;
  battery_percentage: number | null;
  last_location_at: string | null;
};

function readAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('auth_token') || 'null') as string | null;
  } catch {
    return null;
  }
}

export function useAdminDriverLiveWebSocket(enabled: boolean) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<AdminDriverLocationEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const disconnect = useCallback(() => {
    if (retryRef.current) {
      clearTimeout(retryRef.current);
      retryRef.current = null;
    }
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }

    const token = readAuthToken();
    if (!token) return;

    let cancelled = false;

    function connect() {
      if (cancelled) return;
      const ws = new WebSocket(adminDriverLiveWsUrl(token!));
      wsRef.current = ws;

      ws.onopen = () => {
        if (!cancelled) setConnected(true);
      };

      ws.onclose = () => {
        setConnected(false);
        if (!cancelled) {
          retryRef.current = setTimeout(connect, 4000);
        }
      };

      ws.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data as string) as AdminDriverLocationEvent & { type?: string };
          if (data.event === 'driver_location_updated' || data.type === 'driver_location_updated') {
            setLastEvent({
              event: 'driver_location_updated',
              driver_id: data.driver_id,
              latitude: Number(data.latitude),
              longitude: Number(data.longitude),
              status: data.status,
              battery_percentage: data.battery_percentage ?? null,
              last_location_at: data.last_location_at ?? null,
            });
          }
        } catch {
          /* ignore malformed frames */
        }
      };
    }

    connect();

    return () => {
      cancelled = true;
      disconnect();
    };
  }, [enabled, disconnect]);

  return { connected, lastEvent };
}
