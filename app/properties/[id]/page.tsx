"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { baseAPI } from "@/services/types";
import { formatCurrency, getCurrencyForCountry } from "@/utils/currency";
import { useUserRegion } from "@/hooks/useUserRegion";
import Image from "next/image";
import Link from "next/link";
import { MdHome, MdArrowBack } from "react-icons/md";
import { useTranslation } from "@/hooks/useTranslation";
import PropertyEnquiryPanel from "@/components/properties/PropertyEnquiryPanel";

const LISTING_LABELS: Record<string, string> = {
  rent_daily: "Rent per Day",
  rent_monthly: "Rent per Month",
  buy: "For Sale",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  studio: "Studio",
  villa: "Villa",
  room: "Room",
  other: "Other",
};

type ApiProperty = {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  listing_type: string;
  property_type?: string;
  price: string;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  amenities: string[];
  images?: { image: string }[];
};

type Property = {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  listing_type: string;
  listing_type_display: string;
  property_type_display: string;
  price: string;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  amenities: string[];
  image_urls: string[];
};

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { region: regionCode } = useUserRegion();
  const { t } = useTranslation();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${baseAPI}/properties/${id}/`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ApiProperty | null) => {
        if (!data) {
          setProperty(null);
          return;
        }
        setProperty({
          ...data,
          listing_type_display: LISTING_LABELS[data.listing_type] ?? data.listing_type,
          property_type_display: PROPERTY_TYPE_LABELS[data.property_type ?? ""] ?? data.property_type ?? "Property",
          image_urls: (data.images ?? []).map((img) => img.image),
        });
      })
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  const currencyCode = getCurrencyForCountry(regionCode) as "AOA" | "USD" | "EUR";

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t("loading")}</div>;
  }
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("propertyNotFound", "Property not found")}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/properties" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 mb-6">
          <MdArrowBack size={20} /> {t("backToSearch", "Back to search")}
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="aspect-video bg-teal-100 relative">
            {property.image_urls?.[0] ? (
              <Image
                src={`${baseAPI}${property.image_urls[0]}`}
                alt={property.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MdHome size={120} className="text-teal-300" />
              </div>
            )}
            <span className="absolute top-4 left-4 px-3 py-1 bg-teal-600 text-white font-medium rounded-lg">
              {property.listing_type_display}
            </span>
          </div>

          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-teal-900">{property.title}</h1>
            <p className="text-teal-600 mt-1">{property.city} • {property.property_type_display}</p>

            <div className="flex flex-wrap gap-4 mt-4 text-gray-600">
              {property.bedrooms > 0 && <span>{property.bedrooms} {t("bedrooms", "bedrooms")}</span>}
              {property.bathrooms > 0 && <span>{property.bathrooms} {t("bathrooms", "bathrooms")}</span>}
              {property.area_sqm && <span>{property.area_sqm} m²</span>}
            </div>

            <p className="text-3xl font-bold text-teal-600 mt-4">
              {formatCurrency(parseFloat(property.price), currencyCode)}
              <span className="text-base font-normal text-gray-500 ml-2">
                {property.listing_type === "rent_daily" && t("perDay", "per day")}
                {property.listing_type === "rent_monthly" && t("perMonth", "per month")}
              </span>
            </p>

            {property.address && (
              <p className="mt-4 text-gray-600">
                <strong>{t("address", "Address")}:</strong> {property.address}
              </p>
            )}

            {property.description && (
              <div className="mt-6">
                <h2 className="font-semibold text-teal-900 mb-2">{t("description", "Description")}</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{property.description}</p>
              </div>
            )}

            {property.amenities?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold text-teal-900 mb-2">{t("amenities", "Amenities")}</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <PropertyEnquiryPanel
              propertyId={property.id}
              listingType={property.listing_type}
              propertyTitle={property.title}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
