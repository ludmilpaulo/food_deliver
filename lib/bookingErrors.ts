type ApiErrorBody = Record<string, unknown>;

function flattenFieldErrors(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') {
    return prefix ? [`${prefix}: ${value}`] : [value];
  }
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === 'string');
    return first ? flattenFieldErrors(first, prefix) : [];
  }
  if (value && typeof value === 'object') {
    const messages: string[] = [];
    for (const [key, nested] of Object.entries(value as ApiErrorBody)) {
      const label = prefix ? `${prefix}.${key}` : key;
      messages.push(...flattenFieldErrors(nested, label));
    }
    return messages;
  }
  return [];
}

export function extractBookingError(error: unknown): string | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const status = 'status' in error ? (error as { status?: number }).status : undefined;
  if (status === 401) {
    return 'Please sign in to book an appointment.';
  }
  if (typeof status === 'number' && status >= 500) {
    return 'The booking service is temporarily unavailable. Please try again in a moment.';
  }

  if (!('data' in error)) {
    return null;
  }

  const data = (error as { data?: ApiErrorBody }).data;
  if (!data) return null;

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  const messages = flattenFieldErrors(data);
  return messages.length ? messages.join(' ') : null;
}
