import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addItem, removeItem } from "@/redux/slices/basketSlice";
import { selectCartItems } from "@/redux/slices/basketSlice";
import { baseAPI, Product } from "@/services/types";
import { formatCurrency, getCurrencyForCountry } from "@/utils/currency";
import { FaShoppingCart, FaCheck, FaPlus, FaMinus } from "react-icons/fa";
import React, { useState, useMemo } from "react";
import { t } from "@/configs/i18n"; // import your translation function

interface ProductCardProps {
  product: Product;
  regionCode: string;
  language: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, regionCode, language }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);

  // Extract available sizes and colors
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];

  // State for add-to-cart modal
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [adding, setAdding] = useState(false);

  // Price calculation
  const price =
    product.on_sale && product.discount_percentage > 0
      ? product.price - (product.price * product.discount_percentage) / 100
      : product.price;
  const currencyCode = getCurrencyForCountry(regionCode);

  // Find if product (with same size & color) is in cart
  const matchingCartItem = useMemo(
    () =>
      cartItems.find(
        (item) =>
          item.id === product.id &&
          (sizes.length === 0 || item.size === selectedSize || item.size === sizes[0]) &&
          (colors.length === 0 || item.color === selectedColor || item.color === colors[0])
      ),
    [cartItems, product.id, sizes, colors, selectedSize, selectedColor]
  );

  // Render category name safely
  const categoryLabel =
    typeof product.category === "string"
      ? product.category
      : product.category
      ? product.category.name
      : "";

  // Stock status and badge
  let stockLabel = "";
  let stockBadgeColor = "";
  let disableAddToCart = false;
  if (product.stock <= 0) {
    stockLabel = t("outOfStock") || "Out of Stock";
    stockBadgeColor = "#EF4444";
    disableAddToCart = true;
  } else if (product.stock === 1) {
    stockLabel = t("lastOne") || "Last One!";
    stockBadgeColor = "#F59E42";
    disableAddToCart = false;
  } else if (product.stock < 10) {
    stockLabel = t("lowStock") || "Low Stock";
    stockBadgeColor = "#FCD34D";
    disableAddToCart = false;
  }

  // Handlers
  function handleCardClick() {
    router.push(`/products/${product.id}`);
  }

  function openAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    setShowModal(true);
  }

  function handleAddToCart() {
    if ((sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor)) {
      return;
    }
    setAdding(true);
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price,
        image: product.image_url?.[0] || "",
        store: product.store ?? 0,
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
      })
    );
    setTimeout(() => {
      setAdding(false);
      setShowModal(false);
    }, 350);
  }

  function adjustQuantity(amount: number) {
    if (!matchingCartItem) return;
    if (amount === -1 && matchingCartItem.quantity <= 1) return;
    dispatch(
      addItem({
        ...matchingCartItem,
        quantity: amount === 1 ? 1 : -1, // Will be handled by slice
      })
    );
  }

  // Responsive: hover actions for desktop, always visible on mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  // --- UI ---
  return (
    <>
      <div
        className="bg-white rounded-2xl p-3 shadow-md relative cursor-pointer transition hover:scale-[1.03] group"
        onClick={handleCardClick}
        tabIndex={0}
        role="button"
        aria-label={product.name}
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
            sizes="250px"
            priority
          />
          {product.on_sale && product.discount_percentage > 0 && (
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
              <span className="text-white text-xs font-bold">{stockLabel}</span>
            </div>
          )}
        </div>
        <div className="truncate font-bold text-gray-800 mt-1">{product.name}</div>
        <div className="mt-1 text-blue-500 text-xs">{categoryLabel}</div>
        <div className="flex items-center mt-2 mb-2">
          {product.on_sale && product.discount_percentage > 0 && (
            <span className="text-gray-400 line-through text-xs mr-2">
              {formatCurrency(product.price, currencyCode, language)}
            </span>
          )}
          <span className="text-blue-700 font-semibold text-base">
            {formatCurrency(price, currencyCode, language)}
          </span>
        </div>
        {/* Cart controls */}
        <div className="flex flex-col gap-2 mt-3">
          {matchingCartItem ? (
            <div className="flex flex-col items-center gap-2">
              <button
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-xl font-semibold transition shadow"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/cart");
                }}
              >
                <FaCheck /> {t("goToCart") || "Go to Cart"}
              </button>
              <div
                className={`flex items-center gap-2 mt-1 transition-opacity ${
                  isMobile ? "" : "opacity-0 group-hover:opacity-100"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="bg-blue-200 hover:bg-blue-300 text-blue-700 rounded-full p-2"
                  onClick={() => dispatch(removeItem({ id: product.id, size: selectedSize, color: selectedColor }))}
                  title={t("decreaseQuantity") || "Decrease quantity"}
                >
                  <FaMinus />
                </button>
                <span className="min-w-[28px] text-center font-bold text-blue-800">
                  {matchingCartItem.quantity}
                </span>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                  onClick={() => dispatch(addItem({ ...matchingCartItem, quantity: 1 }))}
                  title={t("increaseQuantity") || "Increase quantity"}
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          ) : (
            <button
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-xl font-semibold transition shadow"
              onClick={openAddToCart}
              disabled={adding || disableAddToCart}
            >
              <FaShoppingCart />
              {adding ? t("adding") || "Adding..." : t("addToCart") || "Add to Cart"}
            </button>
          )}
        </div>
      </div>
      {/* --- Add to Cart Modal --- */}
      {showModal && (
        <div className="fixed z-40 inset-0 flex items-center justify-center bg-black/30">
          <div
            className="bg-white p-6 rounded-2xl shadow-xl max-w-[340px] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <div className="font-bold text-lg mb-2">{product.name}</div>
              <div className="text-blue-600 font-bold mb-2">
                {formatCurrency(price, currencyCode, language)}
              </div>
              {sizes.length > 0 && (
                <div className="mb-2">
                  <label className="font-semibold text-sm mb-1 block">{t("selectSize") || "Select Size"}</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        className={`px-3 py-1 rounded-lg border text-sm font-medium ${
                          selectedSize === s
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-gray-100 border-gray-200 text-gray-700"
                        }`}
                        onClick={() => setSelectedSize(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {colors.length > 0 && (
                <div className="mb-2">
                  <label className="font-semibold text-sm mb-1 block">{t("selectColor") || "Select Color"}</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        className={`px-3 py-1 rounded-lg border text-sm font-medium ${
                          selectedColor === c
                            ? "bg-yellow-500 text-white border-yellow-500"
                            : "bg-gray-100 border-gray-200 text-gray-700"
                        }`}
                        onClick={() => setSelectedColor(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
                onClick={handleAddToCart}
                disabled={
                  adding ||
                  (sizes.length > 0 && !selectedSize) ||
                  (colors.length > 0 && !selectedColor)
                }
              >
                {adding ? t("adding") || "Adding..." : t("addToCart") || "Add to Cart"}
              </button>
              <button
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg"
                onClick={() => setShowModal(false)}
              >
                {t("cancel") || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
