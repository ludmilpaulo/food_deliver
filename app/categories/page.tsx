"use client";

import CategoryGrid from "@/components/categories/CategoryGrid";
import { useTranslation } from "@/hooks/useTranslation";

export default function CategoriesPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="mb-8">
          <h1 className="brand-h1 text-slate-900 dark:text-slate-100">
            {t("browseCategories", "Browse categories")}
          </h1>
          <p className="brand-muted mt-2 max-w-2xl">
            {t(
              "categoriesPageSubtitle",
              "Choose a service to explore restaurants, shops, property, stays, professionals, and more.",
            )}
          </p>
        </div>
        <CategoryGrid showHeader={false} />
      </div>
    </div>
  );
}
