'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { AdminLiveDriver } from '@/features/admin/api/adminOrdersApi';

const DEFAULT_CENTER: [number, number] = [-8.8399876, 13.2894368];

function formatLocationTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function FitMapBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, 12);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48] });
  }, [map, points]);

  return null;
}

type DriverLiveMapProps = {
  drivers: AdminLiveDriver[];
  className?: string;
};

export default function DriverLiveMap({ drivers, className = 'h-[420px] w-full' }: DriverLiveMapProps) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  const located = useMemo(
    () =>
      drivers.filter(
        (d): d is AdminLiveDriver & { latitude: number; longitude: number } =>
          typeof d.latitude === 'number' && typeof d.longitude === 'number',
      ),
    [drivers],
  );

  const points = useMemo(
    () => located.map((d) => [d.latitude, d.longitude] as [number, number]),
    [located],
  );

  const center = points[0] ?? DEFAULT_CENTER;

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitMapBounds points={points} />
        {located.map((driver) => (
          <Marker key={driver.id} position={[driver.latitude, driver.longitude]}>
            <Popup>
              <div className="min-w-[160px] text-sm">
                <p className="font-semibold text-slate-900">{driver.name}</p>
                {driver.phone ? <p>{driver.phone}</p> : null}
                {driver.plate ? <p>{driver.plate}</p> : null}
                {driver.city_name || driver.country_name ? (
                  <p>
                    {[driver.city_name, driver.country_name].filter(Boolean).join(', ')}
                  </p>
                ) : null}
                <p className="text-xs text-slate-500">{formatLocationTime(driver.last_location_update)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
