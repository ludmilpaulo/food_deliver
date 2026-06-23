import v1Client from '@/shared/lib/api/v1Client';

export async function trackEvent(
  eventType: string,
  payload?: Record<string, unknown>,
  module?: string,
): Promise<void> {
  await v1Client.post('/analytics/track/', {
    event_type: eventType,
    module: module ?? '',
    payload: payload ?? {},
  });
}

export async function fetchAnalyticsDashboard(): Promise<Record<string, unknown>> {
  const { data } = await v1Client.get<Record<string, unknown>>('/analytics/dashboard/');
  return data;
}
