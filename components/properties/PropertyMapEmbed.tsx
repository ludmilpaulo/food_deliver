"use client";

import { getMapEmbedUrl, type MapCoords } from "@/lib/propertyDirections";

type Props = {
  coords: MapCoords;
  approximate?: boolean;
  approximateLabel?: string;
  title?: string;
};

export default function PropertyMapEmbed({
  coords,
  approximate,
  approximateLabel,
  title,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <iframe
        title={title || "Property map"}
        src={getMapEmbedUrl(coords, approximate ? 12 : 15)}
        className="h-64 w-full border-0 sm:h-80"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {approximate ? (
        <p className="border-t border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
          {approximateLabel ||
            "Approximate area — exact address is hidden until a viewing is confirmed."}
        </p>
      ) : null}
    </div>
  );
}
