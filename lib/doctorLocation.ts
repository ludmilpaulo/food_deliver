import type { HealthcareDoctor } from '@/types/healthcare';

export function formatDoctorAddress(doctor: Pick<HealthcareDoctor, 'clinicName' | 'cityName' | 'countryName'>): string {
  return [doctor.clinicName, doctor.cityName, doctor.countryName].filter(Boolean).join(', ');
}

export function formatDoctorLocationLine(
  doctor: Pick<HealthcareDoctor, 'cityName' | 'countryName' | 'yearsExperience'>,
): string {
  const location = [doctor.cityName, doctor.countryName].filter(Boolean).join(', ');
  const exp = `${doctor.yearsExperience}y exp`;
  return location ? `${location} · ${exp}` : exp;
}

export function getMapEmbedUrl(doctor: HealthcareDoctor): string {
  const query = encodeURIComponent(formatDoctorAddress(doctor));
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

export function getGoogleMapsLink(doctor: HealthcareDoctor): string {
  const query = encodeURIComponent(formatDoctorAddress(doctor));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function getDirectionsLink(doctor: HealthcareDoctor): string {
  const destination = encodeURIComponent(formatDoctorAddress(doctor));
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}
