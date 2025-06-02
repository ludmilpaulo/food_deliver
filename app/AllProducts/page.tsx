"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchAllProducts } from "@/redux/slices/allProductsSlice";
import ProductCard from "@/components/ProductCard";
import { t } from "@/configs/i18n";
import {
  FiSearch,
  FiTrendingUp,
  FiArrowDown,
  FiArrowUp,
} from "react-icons/fi";
import {
  FaTags,
  FaMars,
  FaVenus,
  FaGenderless,
  FaCheckCircle,
} from "react-icons/fa";
import { getUserRegion } from "@/utils/region";

const PAGE_SIZE = 12;

const BrowseProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: allProducts, loading } = useAppSelector((s) => s.allProducts);

  // UI State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "priceLowHigh" | "priceHighLow">("newest");
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [gender, setGender] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [page, setPage] = useState(1);
  const [userRegion, setUserRegion] = useState<string>("ZA");

  // Unique filters
  const categories = useMemo(
    () =>
      Array.from(
        new Set(allProducts.map((p) => p.category).filter(Boolean))
      ) as string[],
    [allProducts]
  );
  const sizes = useMemo(
    () =>
      Array.from(
        new Set(
          allProducts.flatMap((p) => Array.isArray(p.sizes) ? p.sizes : [])
        )
      ),
    [allProducts]
  );
  const colors = useMemo(
    () =>
      Array.from(
        new Set(
          allProducts.flatMap((p) => Array.isArray(p.colors) ? p.colors : [])
        )
      ),
    [allProducts]
  );

  // Filtering logic
  const filteredProducts = useMemo(() => {
    let res = allProducts.filter((p) => {
      // Search by name or description (case-insensitive)
      const q = search.trim().toLowerCase();
      let matchesSearch =
        p.name?.toLowerCase().includes(q) ||
        (typeof p.description === "string"
          ? p.description.toLowerCase().includes(q)
          : false);

      // Category
      let matchesCat = !selectedCategory || p.category === selectedCategory;

      // Sale filter
      let matchesSale = !onSaleOnly || p.on_sale;

      // Gender
      let matchesGender =
        !gender ||
        !p.gender ||
        p.gender.toLowerCase() === gender.toLowerCase();

      // Price
      let priceNum = Number(p.price);
      let matchesPrice =
        (!minPrice || priceNum >= minPrice) &&
        (!maxPrice || priceNum <= maxPrice);

      // Size
      let matchesSize =
        !size ||
        (Array.isArray(p.sizes) && p.sizes.includes(size));

      // Color (assume string for colors, adapt as needed)
      let matchesColor =
        !color ||
        (Array.isArray(p.colors) && p.colors.includes(color));

      return (
        matchesSearch &&
        matchesCat &&
        matchesSale &&
        matchesGender &&
        matchesPrice &&
        matchesSize &&
        matchesColor
      );
    });

    // Sorting
    if (sortBy === "priceLowHigh") {
      res = [...res].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "priceHighLow") {
      res = [...res].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "newest") {
      res = [...res].sort((a, b) => Number(b.id) - Number(a.id));
    }
    return res;
  }, [
    allProducts,
    search,
    selectedCategory,
    onSaleOnly,
    gender,
    minPrice,
    maxPrice,
    size,
    color,
    sortBy,
  ]);

  // Paginator
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const pagedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  useEffect(() => {
    getUserRegion().then(setUserRegion);
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Reset page if filters change
  useEffect(() => {
    setPage(1);
  }, [
    search,
    selectedCategory,
    onSaleOnly,
    gender,
    minPrice,
    maxPrice,
    size,
    color,
    sortBy,
  ]);

  // Gender options for filter
  const genderOptions = [
    { value: "", label: t("all"), icon: <FaGenderless /> },
    { value: "male", label: t("male"), icon: <FaMars className="text-blue-500" /> },
    { value: "female", label: t("female"), icon: <FaVenus className="text-pink-400" /> }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-yellow-50 min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-6 text-blue-900 drop-shadow">
          {t("browseProducts")} <span role="img" aria-label="shop">🛒</span>
        </h1>

        {/* Filter UI */}
        <div className="flex flex-wrap items-center gap-4 bg-white/40 rounded-2xl shadow px-4 py-4 mb-8 glassmorphism">
          {/* Search box */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <FiSearch size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search") + "..."}
              className="p-2 rounded-xl border border-blue-200 shadow-sm bg-white/60 focus:ring-2 focus:ring-blue-300 transition w-full"
            />
          </div>
          {/* On Sale only */}
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded-full border-2 text-sm font-bold transition ${
              onSaleOnly
                ? "bg-yellow-400/90 border-yellow-400 text-white shadow"
                : "bg-white/80 border-blue-200 text-blue-700 hover:bg-yellow-50"
            }`}
            onClick={() => setOnSaleOnly((v) => !v)}
          >
            <FaTags /> {t("onSale")}
          </button>
          {/* Gender */}
          <div className="flex items-center gap-2">
            {genderOptions.map((g) => (
              <button
                key={g.value}
                className={`flex items-center gap-1 px-2 py-1 rounded-full border transition text-sm font-medium ${
                  gender === g.value
                    ? "bg-blue-500 text-white border-blue-500 shadow"
                    : "bg-white/70 border-blue-200 text-blue-600 hover:bg-blue-100"
                }`}
                onClick={() => setGender(g.value)}
              >
                {g.icon}
                {g.label}
              </button>
            ))}
          </div>
          {/* Price range */}
          <div className="flex items-center gap-1 text-sm font-medium">
            {t("price")}:
            <input
              type="number"
              min={0}
              max={100000}
              className="w-16 p-1 rounded border border-blue-200 ml-1 bg-white/80"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
            />
            <span>-</span>
            <input
              type="number"
              min={0}
              max={100000}
              className="w-16 p-1 rounded border border-blue-200 bg-white/80"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>
          {/* Size */}
          <div className="flex items-center gap-2 text-sm font-medium">
            {t("size")}:
            <select
              className="p-1 rounded border border-blue-200 bg-white/80"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              <option value="">{t("all")}</option>
              {sizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {/* Color */}
          <div className="flex items-center gap-2 text-sm font-medium">
            {t("color")}:
            <select
              className="p-1 rounded border border-blue-200 bg-white/80"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              <option value="">{t("all")}</option>
              {colors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {/* Sort by */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="font-medium text-gray-700">{t("sortBy")}:</span>
            <button
              className={`flex items-center gap-1 px-3 py-1 rounded-lg border-2 transition font-bold text-sm ${
                sortBy === "newest"
                  ? "bg-blue-600 border-blue-600 text-white shadow"
                  : "bg-white/80 border-blue-200 text-blue-600 hover:bg-blue-50"
              }`}
              onClick={() => setSortBy("newest")}
            >
              <FiTrendingUp /> {t("newest")}
            </button>
            <button
              className={`flex items-center gap-1 px-3 py-1 rounded-lg border-2 transition font-bold text-sm ${
                sortBy === "priceLowHigh"
                  ? "bg-blue-600 border-blue-600 text-white shadow"
                  : "bg-white/80 border-blue-200 text-blue-600 hover:bg-blue-50"
              }`}
              onClick={() => setSortBy("priceLowHigh")}
            >
              <FiArrowDown /> {t("priceLowHigh")}
            </button>
            <button
              className={`flex items-center gap-1 px-3 py-1 rounded-lg border-2 transition font-bold text-sm ${
                sortBy === "priceHighLow"
                  ? "bg-blue-600 border-blue-600 text-white shadow"
                  : "bg-white/80 border-blue-200 text-blue-600 hover:bg-blue-50"
              }`}
              onClick={() => setSortBy("priceHighLow")}
            >
              <FiArrowUp /> {t("priceHighLow")}
            </button>
          </div>
        </div>

        {/* Category Bar */}
        <div className="flex gap-2 flex-wrap mb-8 px-1">
          <button
            className={`px-4 py-1 rounded-2xl border-2 font-semibold transition shadow-sm ${
              !selectedCategory
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-100"
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            {t("all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-1 rounded-2xl border-2 font-semibold transition shadow-sm ${
                selectedCategory === cat
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white/80 border-blue-200 text-blue-700 hover:bg-blue-100"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 min-h-[480px]">
          {loading ? (
            <div className="col-span-full text-center text-xl text-blue-700 py-12 animate-pulse">{t("loading")}...</div>
          ) : pagedProducts.length === 0 ? (
            <div className="col-span-full text-center text-xl text-gray-400 py-16">{t("noProductsFound")}</div>
          ) : (
            pagedProducts.map((product) => (
             <ProductCard
    key={product.id}
    product={product}
    regionCode={regionCode}
    language={language}
  />
            ))
          )}
        </div>

        {/* Paginator */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              className="px-3 py-1 rounded-lg bg-blue-100 text-blue-600 font-bold hover:bg-blue-200 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              &lt;
            </button>
            <span className="font-bold text-blue-800 text-lg bg-white/60 px-4 py-1 rounded-xl shadow border border-blue-200">
              {page} <span className="text-gray-500">/</span> {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded-lg bg-blue-100 text-blue-600 font-bold hover:bg-blue-200 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseProductsPage;
