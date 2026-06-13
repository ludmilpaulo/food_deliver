const FAVORITES_KEY = 'kudya_doctor_favorites';

export function getFavoriteDoctorIds(): number[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toggleDoctorFavorite(doctorId: number): boolean {
  const ids = getFavoriteDoctorIds();
  const exists = ids.includes(doctorId);
  const next = exists ? ids.filter((id) => id !== doctorId) : [...ids, doctorId];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return !exists;
}
