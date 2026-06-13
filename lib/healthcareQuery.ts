import type { DoctorFilters } from '@/types/healthcare';

export function buildHealthcareQuery(filters: DoctorFilters): string {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.append('search', filters.search.trim());
  }
  if (filters.country) {
    params.append('country', filters.country);
  }
  if (filters.city) {
    params.append('city', filters.city);
  }
  const specialty = filters.specialty_slug ?? filters.specialty;
  if (specialty) {
    params.append('specialty_slug', specialty);
  }
  if (filters.consultation_type) {
    params.append('consultation_type', filters.consultation_type);
  }
  const rating = filters.rating_min ?? filters.min_rating;
  if (rating !== undefined && rating > 0) {
    params.append('min_rating', String(rating));
  }
  if (filters.price_min !== undefined && filters.price_min > 0) {
    params.append('min_price', String(filters.price_min));
  }
  if (filters.price_max !== undefined && filters.price_max > 0) {
    params.append('max_price', String(filters.price_max));
  }
  if (filters.verified) {
    params.append('verified', 'true');
  }
  if (filters.available_today) {
    params.append('available_today', 'true');
  }
  if (filters.language?.trim()) {
    params.append('language', filters.language.trim());
  }
  if (filters.years_experience_min !== undefined && filters.years_experience_min > 0) {
    params.append('years_experience_min', String(filters.years_experience_min));
  }

  return params.toString();
}
