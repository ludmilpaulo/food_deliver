import type { PropertyListing } from "@/types/property";

export type PropertyUiStatus =
  | "active"
  | "pending"
  | "draft"
  | "inactive"
  | "rejected"
  | "suspended";

export function getListingUiStatus(listing: PropertyListing): PropertyUiStatus {
  if (listing.approvalStatus === "draft") return "draft";
  if (listing.approvalStatus === "rejected") return "rejected";
  if (listing.approvalStatus === "suspended") return "suspended";
  if (listing.approvalStatus === "pending" || listing.approvalStatus === "under_review") {
    return "pending";
  }
  if (listing.isApproved && listing.isAvailable) return "active";
  if (listing.isApproved && !listing.isAvailable) return "inactive";
  if (!listing.isApproved) return "pending";
  return "inactive";
}

export function purposeFromListingType(listingType: string): "rent" | "stay" | "sale" {
  if (listingType === "buy") return "sale";
  if (listingType === "rent_daily") return "stay";
  return "rent";
}

export function listingPurpose(listing: PropertyListing): "rent" | "stay" | "sale" {
  if (listing.purpose === "rent" || listing.purpose === "stay" || listing.purpose === "sale") {
    return listing.purpose;
  }
  return purposeFromListingType(listing.listingType);
}

export function listingTypeFromPurpose(purpose: "rent" | "stay" | "sale"): "rent_daily" | "rent_monthly" | "buy" {
  if (purpose === "sale") return "buy";
  if (purpose === "stay") return "rent_daily";
  return "rent_monthly";
}

export const STATUS_BADGE_STYLES: Record<PropertyUiStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  draft: "bg-slate-200 text-slate-700",
  inactive: "bg-slate-100 text-slate-600",
  rejected: "bg-rose-100 text-rose-800",
  suspended: "bg-orange-100 text-orange-800",
};

export const STATUS_DOT_STYLES: Record<PropertyUiStatus, string> = {
  active: "bg-emerald-500",
  pending: "bg-amber-500",
  draft: "bg-slate-500",
  inactive: "bg-slate-400",
  rejected: "bg-rose-500",
  suspended: "bg-orange-500",
};
