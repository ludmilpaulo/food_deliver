"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/configs/i18n";
import { baseAPI } from "@/services/types";
import useLoadScript from "@/hooks/useLoadScript";

type ActiveDelivery = {
  id: number;
  request_number: string;
  pickup_address: string;
  delivery_address: string;
  status: string;
  driver_name?: string;
  driver_phone?: string;
  driver_location?: { latitude: number; longitude: number } | null;
  path?: Array<{ latitude: number; longitude: number; recorded_at?: string }>;
};

declare global {
  interface Window { google: any }
}

export default function TrackDelivery() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<ActiveDelivery[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Google Maps JS (replace with your API key if needed)
  useLoadScript(
    `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&libraries=places`,
    () => {}
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseAPI}/drivers/api/deliveries/?status=in_transit`, {
          credentials: "include",
        });
        if (!mounted) return;
        if (!res.ok) throw new Error("Failed to load deliveries");
        const list = await res.json();
        const normalized: ActiveDelivery[] = (list || []).map((d: any) => ({
          id: d.id,
          request_number: d.request_number,
          pickup_address: d.pickup_address,
          delivery_address: d.delivery_address,
          status: d.status,
          driver_name: d.driver_name,
          driver_phone: d.driver_phone,
          driver_location: d.driver_location
            ? { latitude: Number(d.driver_location.latitude), longitude: Number(d.driver_location.longitude) }
            : null,
        }));
        setDeliveries(normalized);
        if (normalized[0]?.driver_location && window.google && mapRef.current) {
          const { latitude, longitude } = normalized[0].driver_location;
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: latitude, lng: longitude },
            zoom: 14,
          });
          markerRef.current = new window.google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: mapInstance.current,
            title: normalized[0].driver_name || "Driver",
          });
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load deliveries");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Poll for live location updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const active = deliveries[0];
        if (!active) return;
        const res = await fetch(`${baseAPI}/drivers/api/deliveries/${active.id}/track/`, { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        const latest = data?.driver_location;
        if (latest && markerRef.current && mapInstance.current) {
          const lat = Number(latest.latitude);
          const lng = Number(latest.longitude);
          markerRef.current.setPosition({ lat, lng });
          mapInstance.current.setCenter({ lat, lng });
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [deliveries]);

  if (loading) return <div>{t("loading")}</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (deliveries.length === 0) return <div className="text-gray-600">No active deliveries</div>;

  const d = deliveries[0];
  return (
    <div className="space-y-3">
      <div className="border rounded-xl p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="font-semibold">#{d.request_number}</div>
          <div className="text-sm capitalize">{d.status.replaceAll("_", " ")}</div>
        </div>
        <div className="text-sm text-gray-600 mt-1">{d.pickup_address} → {d.delivery_address}</div>
        <div className="text-sm text-gray-600 mt-1">{d.driver_name} {d.driver_phone ? `· ${d.driver_phone}` : ""}</div>
      </div>
      <div ref={mapRef} className="w-full h-80 rounded-xl overflow-hidden border" />
    </div>
  );
}


