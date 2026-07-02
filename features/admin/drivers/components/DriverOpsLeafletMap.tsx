'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { LiveMapDriver } from '@/features/admin/drivers/types';

const DEFAULT_CENTER: [number, number] = [-8.8399876, 13.2894368];

function FitMapBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, 4);
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

type Props = {
  drivers: LiveMapDriver[];
  className?: string;
};

export default function DriverOpsLeafletMap({ drivers, className }: Props) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  const points = useMemo(
    () => drivers.map((d) => [d.latitude, d.longitude] as [number, number]),
    [drivers],
  );

  return (
    <div className={`${className} relative overflow-hidden rounded-2xl ring-1 ring-slate-100`}>
      <MapContainer center={points[0] ?? DEFAULT_CENTER} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitMapBounds points={points} />
        {drivers.map((d) => (
          <Marker key={d.id} position={[d.latitude, d.longitude]}>
            <Popup>
              <strong>{d.name}</strong>
              <br />
              {d.service_type} · {d.plate_number}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
