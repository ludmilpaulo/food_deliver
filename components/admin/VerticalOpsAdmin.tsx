'use client';

import { useEffect, useState } from 'react';
import { baseAPI } from '@/services/types';
import { readAuthToken } from '@/lib/authToken';
import { adminUi } from '@/lib/adminUi';

type RentalVehicle = { id: number; make: string; model: string; plate_number?: string; is_approved?: boolean };
type RentalBooking = { id: number; booking_number?: string; status?: string };
type Delivery = { id: number; delivery_number?: string; status?: string };
type StayBooking = { id: number; booking_code?: string; status?: string };

async function adminFetch(path: string): Promise<unknown> {
  const token = readAuthToken();
  const response = await fetch(`${baseAPI}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

function unwrap<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'results' in data) {
    const results = (data as { results?: T[] }).results;
    return Array.isArray(results) ? results : [];
  }
  return [];
}

export default function VerticalOpsAdmin() {
  const [vehicles, setVehicles] = useState<RentalVehicle[]>([]);
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stays, setStays] = useState<StayBooking[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const [v, b, d, s] = await Promise.all([
        adminFetch('/api/rentals/admin/vehicles/'),
        adminFetch('/api/rentals/admin/bookings/'),
        adminFetch('/api/deliveries/'),
        adminFetch('/api/properties/admin/stay-bookings/'),
      ]);
      setVehicles(unwrap<RentalVehicle>(v));
      setRentalBookings(unwrap<RentalBooking>(b));
      setDeliveries(unwrap<Delivery>(d));
      setStays(unwrap<StayBooking>(s));
    } catch {
      setError('Unable to load operational queues.');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const approveVehicle = async (id: number) => {
    const token = readAuthToken();
    await fetch(`${baseAPI}/api/rentals/admin/vehicles/${id}/approve/`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    void load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={adminUi.sectionTitle}>Stay, rental, and package ops</h2>
        <p className={adminUi.sectionSub}>Staff lists from existing Django querysets. Approve rental vehicles here.</p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className={adminUi.panelSurface}>
        <h3 className="font-semibold">Rental vehicles</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id} className="flex items-center justify-between gap-3">
              <span>
                {vehicle.make} {vehicle.model} {vehicle.plate_number ? `· ${vehicle.plate_number}` : ''}{' '}
                {vehicle.is_approved ? '(approved)' : '(pending)'}
              </span>
              {!vehicle.is_approved ? (
                <button type="button" className={adminUi.btnGhost} onClick={() => void approveVehicle(vehicle.id)}>
                  Approve
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className={adminUi.panelSurface}>
        <h3 className="font-semibold">Rental bookings</h3>
        <ul className="mt-3 space-y-1 text-sm">
          {rentalBookings.map((row) => (
            <li key={row.id}>
              {row.booking_number || row.id} · {row.status}
            </li>
          ))}
        </ul>
      </section>

      <section className={adminUi.panelSurface}>
        <h3 className="font-semibold">Package deliveries</h3>
        <ul className="mt-3 space-y-1 text-sm">
          {deliveries.map((row) => (
            <li key={row.id}>
              {row.delivery_number || row.id} · {row.status}
            </li>
          ))}
        </ul>
      </section>

      <section className={adminUi.panelSurface}>
        <h3 className="font-semibold">Stay bookings</h3>
        <ul className="mt-3 space-y-1 text-sm">
          {stays.map((row) => (
            <li key={row.id}>
              {row.booking_code || row.id} · {row.status}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
