'use client';

import { useEffect, useRef, useState } from 'react';
import { readAuthToken } from '@/lib/authToken';
import { orderWsUrl } from '@/utils/websocket';

type OrderSocketEvent = { type: 'connected' | 'order.status' | 'chat.message' | 'driver.location'; [key: string]: unknown };

const FALLBACK_POLL_MS = 15_000;
const MAX_BACKOFF_MS = 30_000;

/**
 * Live order updates over ws/orders/<id>/ (the server checks the JWT and order ownership).
 * While the socket is down, ``onStatus`` is polled every 15s so tracking never freezes.
 */
export function useOrderTracking(
  orderId: number | null,
  handlers: { onStatus: () => void; onChat?: () => void },
  enabled = true,
) {
  const [live, setLive] = useState(false);
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!orderId || !enabled || typeof window === 'undefined') return;
    let socket: WebSocket | null = null;
    let closed = false;
    let retry = 0;
    let reconnectTimer: number | undefined;

    const connect = () => {
      const token = readAuthToken();
      if (!token || typeof WebSocket === 'undefined') return;
      socket = new WebSocket(orderWsUrl(orderId, token));
      socket.onopen = () => {
        retry = 0;
        setLive(true);
      };
      socket.onmessage = (message) => {
        let event: OrderSocketEvent;
        try {
          event = JSON.parse(String(message.data)) as OrderSocketEvent;
        } catch {
          return;
        }
        if (event.type === 'order.status' || event.type === 'driver.location') handlersRef.current.onStatus();
        if (event.type === 'chat.message') handlersRef.current.onChat?.();
      };
      socket.onclose = () => {
        setLive(false);
        if (closed) return;
        retry += 1;
        reconnectTimer = window.setTimeout(connect, Math.min(MAX_BACKOFF_MS, 1000 * 2 ** retry));
      };
    };

    connect();
    const poll = window.setInterval(() => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        handlersRef.current.onStatus();
        handlersRef.current.onChat?.();
      }
    }, FALLBACK_POLL_MS);

    return () => {
      closed = true;
      window.clearInterval(poll);
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [orderId, enabled]);

  return { live };
}
