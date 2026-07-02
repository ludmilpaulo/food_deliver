'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { DemandLevel, LiveMapCluster, LiveMapDriver } from '@/features/admin/drivers/types';
import DriverOpsLeafletMap from '@/features/admin/drivers/components/DriverOpsLeafletMap';
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript';
import { getGoogleMapsApiKey, hasGoogleMapsApiKey } from '@/lib/googleMapsKey';

const DEFAULT_CENTER = { lat: -8.8399876, lng: 13.2894368 };

const DEMAND_COLORS: Record<DemandLevel | 'offline', string> = {
  low: '#3b82f6',
  normal: '#22c55e',
  medium: '#f97316',
  high: '#ef4444',
  offline: '#94a3b8',
};

const ZOOM_PRESETS: Array<{ label: string; zoom: number | 'fit' }> = [
  { label: '2', zoom: 2 },
  { label: '3', zoom: 3 },
  { label: '4', zoom: 4 },
  { label: '5', zoom: 5 },
  { label: 'D', zoom: 'fit' },
];

type GoogleMapsApi = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleMapInstance;
    Marker: new (opts: Record<string, unknown>) => GoogleMarker;
    InfoWindow: new (opts?: Record<string, unknown>) => GoogleInfoWindow;
    LatLngBounds: new () => GoogleLatLngBounds;
    MapTypeId: { ROADMAP: string; SATELLITE: string; HYBRID: string; TERRAIN: string };
    MapTypeControlStyle: { HORIZONTAL_BAR: number };
    SymbolPath: { CIRCLE: number };
    StreetViewPanorama: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleStreetView;
    StreetViewService: new () => GoogleStreetViewService;
    StreetViewStatus: { OK: string };
    Size: new (w: number, h: number) => unknown;
    Point: new (x: number, y: number) => unknown;
    event: {
      clearInstanceListeners: (instance: unknown) => void;
      trigger: (instance: unknown, event: string) => void;
      addListenerOnce: (instance: unknown, event: string, handler: () => void) => void;
    };
  };
};

type GoogleMapInstance = {
  setCenter: (c: { lat: number; lng: number }) => void;
  setZoom: (z: number) => void;
  getZoom: () => number | undefined;
  fitBounds: (b: GoogleLatLngBounds, opts?: { padding?: number }) => void;
  getStreetView?: () => GoogleStreetView;
  panTo: (c: { lat: number; lng: number }) => void;
};

type GoogleMarker = {
  setMap: (map: GoogleMapInstance | null) => void;
  addListener: (event: string, handler: () => void) => void;
  getPosition: () => { lat: () => number; lng: () => number } | null;
};

type GoogleInfoWindow = {
  setContent: (html: string) => void;
  open: (opts: { map: GoogleMapInstance; anchor?: GoogleMarker }) => void;
  close: () => void;
};

type GoogleLatLngBounds = {
  extend: (p: { lat: number; lng: number }) => void;
};

type GoogleStreetView = {
  setPosition: (p: { lat: number; lng: number }) => void;
  setPov: (pov: { heading: number; pitch: number }) => void;
  setVisible: (visible: boolean) => void;
};

type GoogleStreetViewService = {
  getPanorama: (
    opts: { location: { lat: number; lng: number }; radius: number },
    cb: (data: { location?: { latLng: { lat: () => number; lng: () => number } } } | null, status: string) => void,
  ) => void;
};

function googleMaps(): GoogleMapsApi | undefined {
  return (window as unknown as Window & { google?: GoogleMapsApi }).google;
}

function markerColor(driver: LiveMapDriver): string {
  if (driver.status === 'offline') return DEMAND_COLORS.offline;
  if (driver.service_type === 'medical' || driver.service_type === 'store_delivery') {
    return '#a855f7';
  }
  return DEMAND_COLORS[driver.demand_level] ?? DEMAND_COLORS.normal;
}

function parseCoord(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeDriver(driver: LiveMapDriver): LiveMapDriver | null {
  const latitude = parseCoord(driver.latitude);
  const longitude = parseCoord(driver.longitude);
  if (latitude == null || longitude == null) return null;
  if (latitude === 0 && longitude === 0) return null;
  return { ...driver, latitude, longitude };
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function maxDriverSpreadKm(drivers: LiveMapDriver[]): number {
  let max = 0;
  for (let i = 0; i < drivers.length; i += 1) {
    for (let j = i + 1; j < drivers.length; j += 1) {
      max = Math.max(
        max,
        haversineKm(
          drivers[i].latitude,
          drivers[i].longitude,
          drivers[j].latitude,
          drivers[j].longitude,
        ),
      );
    }
  }
  return max;
}

function driversNear(center: { lat: number; lng: number }, drivers: LiveMapDriver[], radiusKm: number): LiveMapDriver[] {
  return drivers.filter(
    (d) => haversineKm(center.lat, center.lng, d.latitude, d.longitude) <= radiusKm,
  );
}

function fitMapToDrivers(
  g: GoogleMapsApi,
  map: GoogleMapInstance,
  drivers: LiveMapDriver[],
  mode: 'smart' | 'all' = 'smart',
): void {
  if (drivers.length === 0) {
    map.setCenter(DEFAULT_CENTER);
    map.setZoom(4);
    return;
  }
  if (drivers.length === 1) {
    map.setCenter({ lat: drivers[0].latitude, lng: drivers[0].longitude });
    map.setZoom(14);
    return;
  }

  const spreadKm = maxDriverSpreadKm(drivers);
  const focusDrivers =
    mode === 'all' || spreadKm <= 500
      ? drivers
      : driversNear(DEFAULT_CENTER, drivers, 1200).length > 0
        ? driversNear(DEFAULT_CENTER, drivers, 1200)
        : drivers;

  const bounds = new g.maps.LatLngBounds();
  focusDrivers.forEach((d) => bounds.extend({ lat: d.latitude, lng: d.longitude }));
  map.fitBounds(bounds, { padding: 64 });
  g.maps.event.addListenerOnce(map, 'idle', () => {
    const zoom = map.getZoom();
    if (zoom == null) return;
    if (mode === 'all' && zoom < 2) map.setZoom(2);
    if (zoom > 14) map.setZoom(14);
    if (mode === 'smart' && spreadKm > 500 && zoom < 5) map.setZoom(5);
  });
}

type DriverOpsMapProps = {
  drivers: LiveMapDriver[];
  clusters: LiveMapCluster[];
  loading?: boolean;
  className?: string;
};

export default function DriverOpsMap({
  drivers,
  clusters: _clusters,
  loading,
  className = 'h-[min(50vh,320px)] w-full sm:h-[min(55vh,400px)] md:h-[420px] lg:h-[480px]',
}: DriverOpsMapProps) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const streetDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const infoRef = useRef<GoogleInfoWindow | null>(null);
  const streetPanoramaRef = useRef<GoogleStreetView | null>(null);
  const [streetViewOpen, setStreetViewOpen] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapInstanceReady, setMapInstanceReady] = useState(false);

  const apiKey = getGoogleMapsApiKey();
  const { ready: mapsReady, error: mapsScriptError } = useGoogleMapsScript({
    apiKey,
    libraries: 'places',
    enabled: hasGoogleMapsApiKey(),
  });

  const locatedDrivers = useMemo(
    () =>
      drivers
        .map(normalizeDriver)
        .filter((d): d is LiveMapDriver => d != null),
    [drivers],
  );

  const fitAllDrivers = useCallback(
    (mode: 'smart' | 'all' = 'smart') => {
      const g = googleMaps();
      const map = mapRef.current;
      if (!g || !map) return;
      fitMapToDrivers(g, map, locatedDrivers, mode);
    },
    [locatedDrivers],
  );

  const applyZoomPreset = useCallback(
    (preset: number | 'fit') => {
      if (preset === 'fit') {
        fitAllDrivers('all');
        return;
      }
      mapRef.current?.setZoom(preset);
    },
    [fitAllDrivers],
  );

  const openStreetView = useCallback((lat: number, lng: number) => {
    const g = googleMaps();
    const streetEl = streetDivRef.current;
    if (!g || !streetEl) return;
    const service = new g.maps.StreetViewService();
    service.getPanorama({ location: { lat, lng }, radius: 80 }, (data, status) => {
      if (status !== g.maps.StreetViewStatus.OK || !data?.location?.latLng) {
        setMapError('Street View is not available at this location.');
        return;
      }
      setMapError(null);
      if (!streetPanoramaRef.current) {
        streetPanoramaRef.current = new g.maps.StreetViewPanorama(streetEl, {
          addressControl: true,
          linksControl: true,
          panControl: true,
          enableCloseButton: true,
        });
      }
      streetPanoramaRef.current.setPosition({
        lat: data.location.latLng.lat(),
        lng: data.location.latLng.lng(),
      });
      streetPanoramaRef.current.setPov({ heading: 0, pitch: 0 });
      streetPanoramaRef.current.setVisible(true);
      setStreetViewOpen(true);
    });
  }, []);

  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || !hasGoogleMapsApiKey()) return;
    const g = googleMaps();
    if (!g) return;

    const map = new g.maps.Map(mapDivRef.current, {
      center: DEFAULT_CENTER,
      zoom: 4,
      mapTypeControl: true,
      mapTypeControlOptions: {
        mapTypeIds: [
          g.maps.MapTypeId.ROADMAP,
          g.maps.MapTypeId.SATELLITE,
          g.maps.MapTypeId.HYBRID,
          g.maps.MapTypeId.TERRAIN,
        ],
        style: g.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      },
      streetViewControl: true,
      zoomControl: true,
      fullscreenControl: true,
      gestureHandling: 'greedy',
    });

    mapRef.current = map;
    infoRef.current = new g.maps.InfoWindow();
    setMapInstanceReady(true);

    const resize = () => {
      g.maps.event.trigger(map, 'resize');
    };
    const observer = new ResizeObserver(() => resize());
    observer.observe(mapDivRef.current);
    window.requestAnimationFrame(resize);

    return () => {
      observer.disconnect();
      setMapInstanceReady(false);
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      g.maps.event.clearInstanceListeners(map);
      mapRef.current = null;
      infoRef.current = null;
    };
  }, [mapsReady]);

  useEffect(() => {
    const g = googleMaps();
    const map = mapRef.current;
    if (!g || !map || !mapsReady || !mapInstanceReady) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = locatedDrivers.map((driver) => {
      const marker = new g.maps.Marker({
        map,
        position: { lat: driver.latitude, lng: driver.longitude },
        title: driver.name,
        optimized: false,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: markerColor(driver),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      marker.addListener('click', () => {
        const html = `
          <div style="min-width:180px;font-family:system-ui,sans-serif;font-size:13px;line-height:1.4">
            <strong>${driver.name}</strong><br/>
            ${driver.service_type} · ${driver.city}, ${driver.country}<br/>
            ${driver.plate_number} · ${driver.status}<br/>
            <button type="button" id="sv-${driver.driver_id}" style="margin-top:8px;padding:4px 10px;border-radius:8px;border:none;background:#2563eb;color:#fff;cursor:pointer;font-size:12px">
              Open Street View
            </button>
          </div>`;
        infoRef.current?.setContent(html);
        infoRef.current?.open({ map, anchor: marker });
        window.setTimeout(() => {
          document.getElementById(`sv-${driver.driver_id}`)?.addEventListener('click', () => {
            openStreetView(driver.latitude, driver.longitude);
            infoRef.current?.close();
          });
        }, 0);
      });

      return marker;
    });

    fitAllDrivers('smart');
  }, [mapsReady, mapInstanceReady, locatedDrivers, fitAllDrivers, openStreetView]);

  if (loading) {
    return <div className={`${className} animate-pulse rounded-2xl bg-slate-100`} />;
  }

  if (locatedDrivers.length === 0) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-100`}
      >
        No live driver GPS locations yet. Drivers appear here when online with location enabled.
      </div>
    );
  }

  if (!hasGoogleMapsApiKey()) {
    return (
      <div className={className}>
        <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Using OpenStreetMap preview. Add <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_GOOGLE_API_KEY</code> to{' '}
          <code className="rounded bg-amber-100 px-1">food_deliver/.env</code> for Google street maps, satellite layers,
          zoom presets (2–5, D), and Street View.
        </div>
        <DriverOpsLeafletMap drivers={locatedDrivers} className={className} />
      </div>
    );
  }

  if (mapsScriptError) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-2xl bg-red-50 px-4 text-center text-sm text-red-700 ring-1 ring-red-100`}
      >
        Failed to load Google Maps. Check your API key and billing.
      </div>
    );
  }

  if (!mapsReady) {
    return <div className={`${className} animate-pulse rounded-2xl bg-slate-100`} />;
  }

  return (
    <div className={`${className} relative overflow-hidden rounded-2xl ring-1 ring-slate-100`}>
      <span className="absolute left-2 top-2 z-20 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow sm:left-4 sm:top-4 sm:px-3 sm:py-1 sm:text-xs">
        LIVE · {locatedDrivers.length}
      </span>

      <div className="absolute right-2 top-2 z-20 flex gap-1 sm:right-4 sm:top-4">
        {ZOOM_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            title={preset.zoom === 'fit' ? 'Fit all drivers' : `Zoom level ${preset.zoom}`}
            onClick={() => applyZoomPreset(preset.zoom)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-xs font-bold text-slate-700 shadow-md ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div ref={mapDivRef} className="h-full min-h-[280px] w-full sm:min-h-[360px] lg:min-h-[420px]" />

      {streetViewOpen && (
        <div className="absolute inset-x-0 bottom-0 z-30 h-[45%] min-h-[200px] border-t border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            <span>Street View</span>
            <button
              type="button"
              className="rounded px-2 py-0.5 text-slate-500 hover:bg-slate-100"
              onClick={() => {
                streetPanoramaRef.current?.setVisible(false);
                setStreetViewOpen(false);
              }}
            >
              Close
            </button>
          </div>
          <div ref={streetDivRef} className="h-[calc(100%-28px)] w-full" />
        </div>
      )}

      {mapError && (
        <div className="absolute bottom-14 left-2 right-2 z-20 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200 sm:left-4 sm:right-auto sm:max-w-sm">
          {mapError}
        </div>
      )}

      <div className="absolute bottom-2 left-2 right-2 z-10 max-w-[220px] rounded-lg bg-white/95 p-2 text-[10px] shadow-md ring-1 ring-slate-100 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-none sm:rounded-xl sm:p-3 sm:text-xs">
        <p className="mb-1 font-semibold text-slate-700">Legend</p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 sm:gap-x-4 sm:gap-y-1">
          <span><i style={{ color: DEMAND_COLORS.normal }}>●</i> Available</span>
          <span><i style={{ color: DEMAND_COLORS.low }}>●</i> Low demand</span>
          <span><i style={{ color: DEMAND_COLORS.medium }}>●</i> Medium</span>
          <span><i style={{ color: DEMAND_COLORS.high }}>●</i> High demand</span>
          <span><i style={{ color: DEMAND_COLORS.offline }}>●</i> Offline</span>
          <span><i style={{ color: '#a855f7' }}>●</i> Special</span>
        </div>
        <p className="mt-2 text-[10px] text-slate-500">Drag the pegman for Street View · 2–5 zoom · D = fit drivers</p>
      </div>
    </div>
  );
}
