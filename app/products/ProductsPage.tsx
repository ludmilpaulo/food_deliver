"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchProductsByStore } from "@/redux/slices/productsSlice";
import { addItem, removeItem, selectCartItems } from "@/redux/slices/basketSlice";
import { t } from "@/configs/i18n";
import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { getCurrencyForCountry, formatCurrency } from "@/utils/currency";
import { baseAPI, Product } from "@/services/types";

type ProductSelections = Record<number, { size: string | null; color: string | null }>;
type SelectionPrompt = { [productId: number]: string | null };

// --- Helper to normalize category as string ---
const getCategoryName = (cat: string | { id: number; name: string }): string => {
  if (!cat) return "";
  if (typeof cat === "string") return cat;
  return cat.name ?? "";
};

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const storeId = Number(searchParams.get("storeId"));
  const storeName = searchParams.get("storeName") || t("Stores");

  // Redux state
  const products = useAppSelector((state) => state.products.data);
  const loading = useAppSelector((state) => state.products.loading);
  const error = useAppSelector((state) => state.products.error);
  const cartItems = useAppSelector(selectCartItems);

  // Per-product selection (size/color per product)
  const [productSelections, setProductSelections] = useState<ProductSelections>({});
  const [selectionPrompt, setSelectionPrompt] = useState<SelectionPrompt>({});

  // UI search/filter
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (typeof storeId === "number" && !Number.isNaN(storeId)) {
      dispatch(fetchProductsByStore(storeId));
    }
  }, [storeId, dispatch]);

  // --- Categories (all as string) ---
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(
        products
          .map((p) => getCategoryName(p.category))
          .filter((name) => name && name !== "")
      )
    );
    return ["all", ...cats];
  }, [products]);

  // --- Filtered products ---
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) => getCategoryName(p.category) === selectedCategory
      );
    }
    if (search.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search.trim().toLowerCase()) ||
          (p.description ?? "").toLowerCase().includes(search.trim().toLowerCase())
      );
    }
    return filtered;
  }, [products, search, selectedCategory]);

  // --- Promo banners ---
  const onSaleProducts = useMemo(
    () => products.filter((p) => p.on_sale && p.discount_percentage > 0),
    [products]
  );
  const promoBanners = onSaleProducts.slice(0, 5).map((product) => ({
    id: product.id,
    name: product.name,
    subtitle:
      product.discount_percentage > 0 ? `-${product.discount_percentage}%` : "SALE",
    image:
      product.image_url?.[0]?.startsWith("/media/")
        ? `${process.env.NEXT_PUBLIC_BASE_API}${product.image_url[0]}`
        : product.image_url?.[0] || "/no-image.png",
  }));



  // --- Locale/currency ---
  const language =
    typeof window !== "undefined" ? navigator.language.split("-")[0] : "en";
  const regionCode =
    typeof window !== "undefined" ? navigator.language.split("-")[1] || "ZA" : "ZA";
  const currencyCode = getCurrencyForCountry(regionCode);

  // --- Helpers ---
  const getSelection = (productId: number) =>
    productSelections[productId] || { size: null, color: null };

  const getCartItem = (
    productId: number,
    size: string | null,
    color: string | null
  ) =>
    cartItems.find(
      (item) =>
        item.id === productId &&
        (item.size || "") === (size || "") &&
        (item.color || "") === (color || "")
    );

  // Selection Handlers
  const startAddToCart = (productId: number) => {
    setProductSelections((prev) => ({
      ...prev,
      [productId]: { size: null, color: null },
    }));
    setSelectionPrompt((prev) => ({ ...prev, [productId]: null }));
  };

  const handleSelectSize = (productId: number, size: string) => {
    setProductSelections((prev) => ({
      ...prev,
      [productId]: { ...getSelection(productId), size },
    }));
    setSelectionPrompt((prev) => ({ ...prev, [productId]: null }));
  };

  const handleSelectColor = (productId: number, color: string) => {
    setProductSelections((prev) => ({
      ...prev,
      [productId]: { ...getSelection(productId), color },
    }));
    setSelectionPrompt((prev) => ({ ...prev, [productId]: null }));
  };

  // Add/Remove Quantity
  const handleChangeQuantity = (
    change: 1 | -1,
    product: Product,
    size: string | null,
    color: string | null
  ) => {
    const cartItem = getCartItem(product.id, size, color);
    if (change === 1) {
      if (cartItem && cartItem.quantity >= product.stock) {
        alert(
          `${t("stockLimitReached")}\n${t("only")} ${product.stock} ${t(
            "itemsAvailable"
          )}.`
        );
        return;
      }
      dispatch(
        addItem({
          id: product.id,
          name: product.name,
          price:
            product.on_sale && product.discount_percentage > 0
              ? product.price -
                (product.price * product.discount_percentage) / 100
              : product.price,
          image: product.image_url?.[0],
          size: size || "",
          color: color || "",
          store: storeId,
          quantity: 1,
        })
      );
    } else if (cartItem) {
      dispatch(
        removeItem({ id: product.id, size: size || "", color: color || "" })
      );
    }
  };

  // Confirm Add To Cart
  const handleConfirmAddToCart = (
    product: Product,
    selectedSize: string | null,
    selectedColor: string | null
  ) => {
    // Validation: size, then color if needed
    if (product.sizes?.length && !selectedSize) {
      setSelectionPrompt((prev) => ({
        ...prev,
        [product.id]: t("selectSize") || "Please select size",
      }));
      return;
    }
    if (product.colors?.length && !selectedColor) {
      setSelectionPrompt((prev) => ({
        ...prev,
        [product.id]: t("selectColor") || "Please select color",
      }));
      return;
    }
    // Add to cart
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price:
          product.on_sale && product.discount_percentage > 0
            ? product.price - (product.price * product.discount_percentage) / 100
            : product.price,
        image: product.images?.[0],
        size: selectedSize || "",
        color: selectedColor || "",
        store: storeId,
        quantity: 1,
      })
    );
    setSelectionPrompt((prev) => ({ ...prev, [product.id]: null }));
  };

  // Render
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-200 to-blue-400">
      {/* Carousel */}
      {promoBanners.length > 0 && (
        <div className="mb-6 px-4">
          <Carousel
            autoPlay
            infiniteLoop
            showThumbs={false}
            showStatus={false}
            showIndicators={true}
            interval={4000}
          >
            {promoBanners.map((item) => (
              <div
                key={item.id}
                className="relative rounded-xl overflow-hidden h-44 cursor-pointer"
                onClick={() => router.push(`/products/${item.id}`)}
              >
                <Image
                  src={item.image || "/no-image.png"}
                  alt={item.name}
                  fill
                  className="object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-4">
                  <h3 className="text-white text-lg font-bold">{item.name}</h3>
                  <p className="text-white text-sm mt-1 font-semibold">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      )}

      {/* Header */}
      <h2 className="text-3xl font-bold mb-3 text-white px-4 drop-shadow">{storeName}</h2>

      {/* Search Bar */}
      <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 shadow mx-4 mb-4">
        <span className="text-gray-400 mr-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx={11} cy={11} r={8}></circle>
            <line x1={21} y1={21} x2={16.65} y2={16.65}></line>
          </svg>
        </span>
        <input
          className="flex-1 text-base text-black bg-transparent outline-none"
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto pl-4 pr-2 pb-2 mb-4 gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full border mr-2 whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-black border-black text-white"
                : "bg-white border-gray-300 text-gray-800"
            } text-sm font-semibold`}
          >
            {cat === "all" ? t("Categories") : cat}
          </button>
        ))}
      </div>

      {/* Error/Loading/Empty states */}
      {loading && (
        <div className="flex flex-col items-center justify-center w-full py-12">
          <span className="loader mb-3"></span>
          <p className="text-gray-700">{t("loading")}</p>
        </div>
      )}
      {!loading && error && (
        <div className="bg-red-500/70 text-white text-center w-full py-3 rounded-xl mx-4">
          {t("error")}
        </div>
      )}
      {!loading && !error && filteredProducts.length === 0 && (
        <p className="text-center text-white/90 mt-16 w-full">{t("noStores")}</p>
      )}

      {/* Product Grid */}
      <div className="flex flex-wrap gap-4 px-4">
        {!loading &&
          !error &&
          filteredProducts.map((product) => {
            const hasSale = product.on_sale && product.discount_percentage > 0;
            const price = hasSale
              ? product.price - (product.price * product.discount_percentage) / 100
              : product.price;

            // Stock status
            let stockLabel = "";
            let stockBadgeColor = "";
            let disableAddToCart = false;
            if (product.stock <= 0) {
              stockLabel = t("outOfStock");
              stockBadgeColor = "#EF4444";
              disableAddToCart = true;
            } else if (product.stock === 1) {
              stockLabel = t("lastOne");
              stockBadgeColor = "#F59E42";
              disableAddToCart = true;
            } else if (product.stock < 10) {
              stockLabel = t("lowStock");
              stockBadgeColor = "#FCD34D";
            }

            const { size: selectedSize, color: selectedColor } = getSelection(product.id);
            const cartItem = getCartItem(product.id, selectedSize, selectedColor);

           // Selection requirements (fully safe!)
            const needsSize = (product.sizes?.length ?? 0) > 0 && !selectedSize;
            const needsColor =
              (product.colors?.length ?? 0) > 0 &&
              (((product.sizes?.length ?? 0) > 0 && selectedSize && !selectedColor) ||
                ((product.sizes?.length ?? 0) === 0 && !selectedColor));
            const canChangeQty =
              ((product.sizes?.length ?? 0) > 0 ? !!selectedSize : true) &&
              ((product.colors?.length ?? 0) > 0 ? !!selectedColor : true);


            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-3 shadow-md relative w-full sm:w-[calc(50%-1rem)] md:w-[calc(33%-1rem)] lg:w-[calc(25%-1rem)] mb-4"
              >
                <div
                  className="relative cursor-pointer"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  <div className="w-full h-40 rounded-lg bg-gray-200 overflow-hidden mb-2 relative">
                    <Image
                      src={
                        product.image_url?.[0]
                          ? product.image_url[0].startsWith("/media/")
                            ? `${baseAPI}${product.image_url[0]}`
                            : product.image_url[0]
                          : "/no-image.png"
                      }
                      alt={product.name}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />

                    {hasSale && (
                      <div className="absolute top-2 right-2 bg-blue-500 rounded-lg px-2 py-1 flex items-center">
                        <span className="text-white text-xs font-bold">
                          -{product.discount_percentage}%
                        </span>
                      </div>
                    )}
                    {stockLabel && (
                      <div
                        className="absolute top-2 left-2 rounded-lg px-2 py-1"
                        style={{ backgroundColor: stockBadgeColor }}
                      >
                        <span className="text-white text-xs font-bold">
                          {stockLabel}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="truncate font-bold text-gray-800 mt-1">{product.name}</div>
                </div>
                <div className="flex items-center mt-2 mb-2">
                  {hasSale && (
                    <span className="text-gray-400 line-through text-xs mr-2">
                      {formatCurrency(product.price, currencyCode, language)}
                    </span>
                  )}
                  <span className="text-blue-700 font-semibold text-base">
                    {formatCurrency(price, currencyCode, language)}
                  </span>
                </div>

                {/* --- ADD TO CART LOGIC --- */}
                {!disableAddToCart && (
                  <>
                    {/* Step 1: Add to cart button */}
                    {!productSelections[product.id] && !cartItem && (
                      <button
                        className="bg-green-600 w-full py-2 rounded-lg text-white font-bold mt-1"
                        onClick={() => startAddToCart(product.id)}
                        disabled={disableAddToCart}
                      >
                        {t("addToCart")}
                      </button>
                    )}

                    {/* Step 2: Size selection */}
                    {productSelections[product.id] && needsSize && (
                      <>
                        <div className="mb-2 text-sm font-medium text-yellow-600">
                          {selectionPrompt[product.id] ?? t("selectSize")}
                        </div>
                        <div className="flex flex-wrap mt-2 gap-2">
                          {product.sizes!.map((size: string) => (
                            <button
                              key={size}
                              className={`px-4 py-2 rounded-full border m-1 font-bold ${
                                selectedSize === size
                                  ? "bg-black border-black text-white"
                                  : "bg-white border-gray-300 text-gray-800"
                              }`}
                              onClick={() => handleSelectSize(product.id, size)}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Step 3: Color selection */}
                    {productSelections[product.id] && !needsSize && needsColor && (
                      <>
                        <div className="mb-2 text-sm font-medium text-yellow-600">
                          {selectionPrompt[product.id] ?? t("selectColor")}
                        </div>
                        <div className="flex flex-wrap mt-2 gap-2">
                          {product.colors!.map((color: string) => (
                            <button
                              key={color}
                              className={`px-4 py-2 rounded-full border m-1 font-bold ${
                                selectedColor === color
                                  ? "bg-pink-600 border-pink-600 text-white"
                                  : "bg-white border-gray-300 text-gray-800"
                              }`}
                              onClick={() => handleSelectColor(product.id, color)}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Step 4: Quantity controls and Confirm Add to Cart */}
                    {productSelections[product.id] && canChangeQty && !cartItem && (
                      <div className="flex flex-col gap-2 mt-3">
                        <div className="flex items-center justify-center">
                          <button
                            className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center"
                            onClick={() =>
                              handleChangeQuantity(
                                -1,
                                product,
                                selectedSize,
                                selectedColor
                              )
                            }
                            disabled={true} // can't go below 1 when adding new
                          >
                            <span className="text-xl font-bold">-</span>
                          </button>
                          <span className="mx-6 text-lg font-bold">1</span>
                          <button
                            className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center"
                            onClick={() =>
                              handleChangeQuantity(
                                1,
                                product,
                                selectedSize,
                                selectedColor
                              )
                            }
                            disabled={false}
                          >
                            <span className="text-xl font-bold">+</span>
                          </button>
                        </div>
                        <button
                          className="bg-green-600 w-full py-2 rounded-lg text-white font-bold"
                          onClick={() =>
                            handleConfirmAddToCart(product, selectedSize, selectedColor)
                          }
                        >
                          {t("addToCart")}
                        </button>
                        {selectionPrompt[product.id] && (
                          <div className="text-xs text-red-600 text-center">
                            {selectionPrompt[product.id]}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 5: Variant is already in cart: show quantity and go to cart */}
                    {cartItem && canChangeQty && (
                      <div className="flex items-center justify-center mt-2">
                        <button
                          className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center"
                          onClick={() =>
                            handleChangeQuantity(-1, product, selectedSize, selectedColor)
                          }
                          disabled={cartItem.quantity <= 1}
                        >
                          <span className="text-xl font-bold">-</span>
                        </button>
                        <span className="mx-6 text-lg font-bold">{cartItem.quantity}</span>
                        <button
                          className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center"
                          onClick={() =>
                            handleChangeQuantity(1, product, selectedSize, selectedColor)
                          }
                          disabled={cartItem.quantity >= product.stock}
                        >
                          <span className="text-xl font-bold">+</span>
                        </button>
                        <button
                          className="ml-4 bg-blue-600 px-4 py-2 rounded-lg text-white font-bold"
                          onClick={() => router.push("/CartPage")}
                        >
                          {t("goToCart")}
                        </button>
                      </div>
                    )}
                  </>
                )}
                {disableAddToCart && (
                  <div className="text-center text-gray-400 font-semibold mt-2">
                    {t("outOfStock")}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
