"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { removeItem, removeLine, clearAllCart, addItem } from "@/redux/slices/basketSlice";
import { selectUser } from "@/redux/slices/authSlice";
import Image from "next/image";
import withAuth from "@/components/ProtectedPage";
import { formatCurrency, getCurrencyForCountry } from "@/utils/currency";
import { t, setLanguageFromBrowser, setLanguage, getLanguage } from "@/configs/i18n";
import { SupportedLocale } from "@/configs/translations";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartItem } from "@/services/types";
import { FaShoppingCart, FaImage } from "react-icons/fa";
import { MdRemoveShoppingCart } from "react-icons/md";
import { IoMdClose } from "react-icons/io";

const LANGUAGES: { value: SupportedLocale; label: string }[] = [
  { value: "en", label: "🇬🇧 English" },
  { value: "pt", label: "🇵🇹 Português" },
];

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // System language detection on mount (client-only)
  const [lang, setLangState] = useState(getLanguage());
  useEffect(() => {
    setLanguageFromBrowser();
    setLangState(getLanguage());
  }, []);
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLocale);
    setLangState(getLanguage());
  };

  // Redux state
  const items: CartItem[] = useAppSelector((state) => state.basket.items);
  const user = useAppSelector(selectUser);

  // Locale/currency
  const language = lang || "en";
  const regionCode =
    typeof window !== "undefined"
      ? navigator.language.split("-")[1] || "ZA"
      : "ZA";
  const currencyCode = getCurrencyForCountry(regionCode);

  // Totals
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Remove only one unit
  const handleQuantityChange = (item: CartItem, diff: 1 | -1) => {
    if (diff === 1) {
      dispatch(
        addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          size: item.size || "",
          color: item.color || "",
          store: item.store,
          quantity: 1,
        })
      );
    } else {
      dispatch(removeItem({ id: item.id, size: item.size || "", color: item.color || "" }));
    }
  };

  // Remove the entire item (all quantities)
  const handleRemoveLine = (item: CartItem) => {
    dispatch(removeLine({ id: item.id, size: item.size || "", color: item.color || "" }));
  };

  // Confirm clear cart
  const confirmClearCart = () => {
    if (
      window.confirm(
        t(
          "Are you sure you want to remove all items from your cart?"
          
        )
      )
    ) {
      dispatch(clearAllCart());
    }
  };

  // Require login to checkout
  const handleCheckout = () => {
    if (!user) {
      router.push("/LoginScreenUser");
      return;
    }
    router.push("/Checkout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-yellow-50 to-blue-100 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/80 border-b border-blue-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <FaShoppingCart className="text-blue-700 text-2xl" />
          <h1 className="text-xl font-extrabold text-blue-900 drop-shadow">
            {t("YourCart")}
          </h1>
        </div>
        <select
          className="p-1 rounded bg-white/80 border border-gray-300 text-gray-800 font-semibold text-sm shadow ml-auto mt-2 md:mt-0"
          value={lang}
          onChange={handleLanguageChange}
          aria-label={t("changeLanguage")}
        >
          {LANGUAGES.map((langOpt) => (
            <option key={langOpt.value} value={langOpt.value}>
              {langOpt.label}
            </option>
          ))}
        </select>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-2 sm:px-6 py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 mb-24">
            <MdRemoveShoppingCart className="text-6xl text-gray-300 mb-2" />
            <div className="text-lg text-gray-400 font-semibold mb-4">
              {t("Your cart is empty")}
            </div>
            <Link href="/HomeScreen">
              <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-white font-semibold shadow transition">
                {t("Go Shopping")}
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-36">
            {items.map((item, idx) => (
              <div
                key={`${item.id}-${item.size || ""}-${item.color || ""}-${item.store}-${idx}`}
                className="bg-white rounded-2xl flex flex-col sm:flex-row items-center p-4 shadow-md gap-4 relative"
              >
                <div className="w-20 h-20 relative bg-gray-100 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-xl"
                    />
                  ) : (
                    <FaImage className="text-gray-400 text-3xl" />
                  )}
                </div>
                <div className="flex-1 flex flex-col w-full min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold truncate">{item.name}</span>
                    <button
                      className="ml-2 p-1 hover:bg-red-100 rounded"
                      onClick={() => handleRemoveLine(item)}
                      aria-label={t("Remove")}
                    >
                      <IoMdClose className="text-red-500 text-lg" />
                    </button>
                  </div>
                  {!!item.size && (
                    <div className="text-xs text-gray-500 mt-1">
                      {t("size")}: {item.size}
                    </div>
                  )}
                  {!!item.color && (
                    <div className="text-xs text-gray-500 mt-1">
                      {t("color")}: {item.color}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold hover:bg-blue-100 transition"
                      onClick={() => handleQuantityChange(item, -1)}
                      aria-label={t("Decrease quantity")}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="mx-2 text-lg font-semibold">{item.quantity}</span>
                    <button
                      className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold hover:bg-blue-100 transition"
                      onClick={() => handleQuantityChange(item, 1)}
                      aria-label={t("Increase quantity")}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end min-w-[5rem]">
                  <span className="text-base font-extrabold text-blue-700">
                    {formatCurrency(item.price * item.quantity, currencyCode, language)}
                  </span>
                  <button
                    className="mt-3 text-xs text-red-500 font-semibold hover:underline"
                    onClick={() => handleRemoveLine(item)}
                  >
                    {t("Remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sticky total bar */}
      {items.length > 0 && (
        <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-2xl z-50">
          <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-gray-800">
             Total:
              </span>
              <span className="text-xl font-extrabold text-blue-700">
                {formatCurrency(total, currencyCode, language)}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                className="bg-blue-600 hover:bg-blue-700 py-3 px-8 rounded-xl text-white font-bold shadow transition"
                onClick={handleCheckout}
              >
                {t("Proceed to Checkout")}
              </button>
              <button
                className="bg-red-100 text-red-500 hover:bg-red-200 py-3 px-5 rounded-xl font-semibold transition"
                onClick={confirmClearCart}
              >
                {t("Clear Cart")}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default withAuth(CartPage);
