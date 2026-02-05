"use client";
import React, { useState, useEffect } from "react";
import { baseAPI } from "@/services/types";
import { formatCurrency, getCurrencyForCountry } from "@/utils/currency";
import { useUserRegion } from "@/hooks/useUserRegion";
import Image from "next/image";
import Link from "next/link";
import { MdHome, MdSearch, MdCalendarMonth, MdSell } from "react-icons/md";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

type ListingType = "rent_daily" | "rent_monthly" | "buy";
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
  image_urls: string[];
};

const LISTING_OPTIONS: { value: ListingType; label: string; icon: React.ReactNode }[] = [
  { value: "rent_daily", label: "Rent per Day", icon: <MdCalendarMonth size={20} /> },
  { value: "rent_monthly", label: "Rent per Month", icon: <MdHome size={20} /> },
  { value: "buy", label: "For Sale", icon: <MdSell size={20} /> },
];

export default function PropertiesPage() {
  const { region: regionCode } = useUserRegion();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingType, setListingType] = useState<ListingType | "">("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (listingType) params.set("listing_type", listingType);
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);

    setLoading(true);
    fetch(`${baseAPI}/properties/search/?${params}`)
      .then((res) => res.json())
      .then((data) => setProperties(Array.isArray(data) ? data : []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [listingType, search, city, minPrice, maxPrice]);

  const currencyCode = getCurrencyForCountry(regionCode) as "AOA" | "USD" | "EUR";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-teal-900 mb-2 flex items-center gap-2">
          <HiOutlineBuildingOffice2 size={36} />
          Properties
        </h1>
        <p className="text-teal-700 mb-6">
          Search for properties to rent per day, per month, or to buy
        </p>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            {LISTING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setListingType(listingType === opt.value ? "" : opt.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                  listingType === opt.value
                    ? "bg-teal-600 text-white"
                    : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by title, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16 text-teal-600">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow">
            <MdHome size={64} className="mx-auto text-teal-200 mb-4" />
            <p className="text-teal-600">No properties found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <Link
                key={prop.id}
                href={`/properties/${prop.id}`}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="aspect-video bg-teal-100 relative overflow-hidden">
                  {prop.image_urls?.[0] ? (
                    <Image
                      src={`${baseAPI}${prop.image_urls[0]}`}
                      alt={prop.title}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MdHome size={64} className="text-teal-300" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-1 bg-teal-600 text-white text-xs font-medium rounded-lg">
                    {prop.listing_type_display}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-teal-900 group-hover:text-teal-600 truncate">
                    {prop.title}
                  </h3>
                  <p className="text-sm text-gray-500">{prop.city}</p>
                  <div className="flex gap-2 mt-2 text-sm text-gray-600">
                    {prop.bedrooms > 0 && <span>{prop.bedrooms} bed</span>}
                    {prop.bathrooms > 0 && <span>{prop.bathrooms} bath</span>}
                    {prop.area_sqm && <span>{prop.area_sqm} m²</span>}
                  </div>
                  <p className="mt-2 font-bold text-teal-600">
                    {formatCurrency(parseFloat(prop.price), currencyCode)}
                    <span className="text-xs font-normal text-gray-500 ml-1">
                      {prop.listing_type === "rent_daily" && "/ day"}
                      {prop.listing_type === "rent_monthly" && "/ month"}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
