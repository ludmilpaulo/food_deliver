"use client";

import GroceryPartnerShell from "@/features/grocery-partner/GroceryPartnerShell";

export default function GroceryProviderLayout({ children }: { children: React.ReactNode }) {
  return <GroceryPartnerShell>{children}</GroceryPartnerShell>;
}
