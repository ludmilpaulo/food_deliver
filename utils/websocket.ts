import { baseAPI } from '@/services/types';

/** HTTP API base → WebSocket base (ws/wss). */
export function getWebSocketBaseUrl(): string {
  const api = baseAPI.replace(/\/$/, '');
  if (api.startsWith('https://')) {
    return api.replace(/^https/, 'wss');
  }
  return api.replace(/^http/, 'ws');
}

export function adminDriverLiveWsUrl(token: string): string {
  return `${getWebSocketBaseUrl()}/ws/admin/drivers/live-location/?token=${encodeURIComponent(token)}`;
}
