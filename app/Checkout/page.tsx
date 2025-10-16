"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { selectCartItems, clearAllCart } from "@/redux/slices/basketSlice";
import { selectUser } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, getCurrencyForCountry } from "@/utils/currency";
import { t, setLanguageFromBrowser, setLanguage, getLanguage } from "@/configs/i18n";
import { SupportedLocale } from "@/configs/translations";
import { baseAPI, CartItem } from "@/services/types";
import { FaCheckCircle, FaArrowLeft, FaWhatsapp, FaInfoCircle } from "react-icons/fa";
import withAuth from "@/components/ProtectedPage";
import { analytics } from "@/utils/mixpanel";

const LANGUAGES: { value: SupportedLocale; label: string }[] = [
  { value: "en", label: "🇬🇧 English" },
  { value: "pt", label: "🇵🇹 Português" },
];

const DELIVERY_FEE = 40;

const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [location, setLocation] = useState("");

  // Locale/currency
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
  const user = useAppSelector(selectUser);
  const items: CartItem[] = useAppSelector(selectCartItems);

  const language = lang || "en";
  const regionCode =
    typeof window !== "undefined"
      ? navigator.language.split("-")[1] || "ZA"
      : "ZA";
  const currencyCode = getCurrencyForCountry(regionCode);

  // Totals
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + DELIVERY_FEE;

  // Form state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderPin, setOrderPin] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const valid = !!name.trim() && !!phone.trim() && !!address.trim() && items.length > 0;

  // Redirect if not logged in
  useEffect(() => {
    analytics.trackPageView('Checkout Page');
    analytics.trackCheckoutStarted(total, items.length);
    
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latLng = `${position.coords.latitude},${position.coords.longitude}`;
        setLocation(latLng);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocation(""); // Fallback to empty if error
      }
    );
  }
    if (!user) {
      router.replace("/LoginScreenUser");
    }
  }, [user, router]);

  // Handle order submit
const handlePlaceOrder = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  if (!valid) return;
  setLoading(true);

  // Group cart items by store
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.store]) acc[item.store] = [];
    acc[item.store].push({
      product_id: item.id,
      quantity: item.quantity,
    });
    return acc;
  }, {} as Record<number, { product_id: number; quantity: number }[]>);

  // Construct payload
  const payload = {
    access_token: user?.token,
    orders: Object.entries(groupedItems).map(([store_id, orderDetails]) => ({
      store_id: Number(store_id),
      address,
      location,
      use_current_location: !!location,
      delivery_notes: notes,
      payment_method: payment,
      delivery_fee: DELIVERY_FEE, // Adjust per store if needed
      order_details: orderDetails,
    })),
  };

  try {
    const res = await fetch(`${baseAPI}/order/orders/add-multiple/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (data.status === "success" || data.status === "partial_success") {
      analytics.trackOrderCompleted(data.order_pins?.join(',') || 'unknown', total, items);
      setOrderSuccess(true);
      dispatch(clearAllCart());
      setOrderPin(data.order_pins || []);
      setWhatsappUrl(data.whatsapp_urls || []);
      if (data.errors?.length) {
        setError(`Some orders had issues: ${JSON.stringify(data.errors)}`);
      }
    } else {
      analytics.trackError('Order Failed', { error: data.error });
      setError(data.error || "An unexpected error occurred");
    }
  } catch (e) {
    setLoading(false);
    setError(t("error"));
  }
};


  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-blue-50 to-blue-100 px-4">
        <FaCheckCircle className="text-green-500 text-6xl mb-3 drop-shadow-lg" />
        <h2 className="text-2xl font-extrabold text-green-700 mb-2">{t("OrderPlaced")}</h2>
        <div className="bg-white shadow-xl rounded-xl px-6 py-4 mb-4 text-center border">
          <p className="text-lg font-bold text-blue-800">{t("Thank you! Your order has been received.")}</p>
          {orderPin && (
            <div className="mt-2 mb-2 flex items-center justify-center gap-2">
              <FaInfoCircle className="text-blue-400" />
              <span className="text-blue-800 font-bold">
                {t("YourSecretPIN")} <span className="bg-blue-50 px-2 py-1 rounded text-lg">{orderPin}</span>
              </span>
            </div>
          )}
          <p className="text-gray-500 mt-2 mb-1">{t("You'll_receive_updates_via_WhatsApp_or_email")}</p>
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-xl transition">
              <FaWhatsapp /> {t("OpenWhatsApp")}
            </a>
          )}
        </div>
        <Link href="/HomeScreen" className="mt-2">
          <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-white font-semibold shadow transition">
            {t("BacktoHome")}
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-yellow-50 to-blue-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 border-b border-blue-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            className="p-2 text-blue-700 rounded-full hover:bg-blue-100"
            onClick={() => router.back()}
            aria-label="Back"
            type="button"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-extrabold text-blue-900 drop-shadow">{t("Checkout")}</h1>
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

      <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-6 py-8 flex flex-col md:flex-row gap-10">
        {/* Checkout form */}
        <form
          className="flex-1 bg-white/90 shadow-2xl rounded-2xl p-8 mb-8"
          onSubmit={handlePlaceOrder}
        >
          <h2 className="text-2xl font-bold text-blue-900 mb-4">{t("DeliveryDetails")}</h2>
          <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t("FullName")}</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 p-3"
                placeholder={t("name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t("phone")}</label>
              <input
                type="tel"
                className="w-full rounded-lg border border-gray-300 p-3"
                placeholder={t("phone")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">{t("DeliveryAddress")}</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 resize-none"
                placeholder={t("Enterdeliveryaddress")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 mb-1">{t("OrderNotes(optional)")}</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 resize-none"
              placeholder={t("e.g.Leaveatthegate")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">{t("PaymentMethod")}</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" className="accent-blue-600" checked={payment === "cash"} onChange={() => setPayment("cash")} />
                <span>{t("CashonDelivery")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" className="accent-blue-600" checked={payment === "card"} onChange={() => setPayment("card")} />
                <span>{t("CardonDelivery")}</span>
              </label>
              {/* You can add more payment methods */}
            </div>
          </div>
          {error && (
            <div className="bg-red-100 text-red-600 rounded-lg px-4 py-2 mb-3 font-semibold border border-red-200">
              {error}
            </div>
          )}
          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-bold transition text-white text-lg tracking-wide ${
              valid && !loading
                ? "bg-gradient-to-r from-blue-600 to-yellow-500 shadow-lg hover:from-blue-700 hover:to-yellow-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            disabled={!valid || loading}
          >
            {loading ? (
              <span>
                <span className="inline-block animate-spin mr-2">⏳</span>
                {t("PlacingOrder...")}
              </span>
            ) : (
              t("PlaceOrder")
            )}
          </button>
        </form>

        {/* Order Summary */}
        <div className="md:w-[28rem] w-full bg-white/90 shadow-2xl rounded-2xl p-8 h-fit border">
          <h3 className="text-xl font-bold mb-4 text-blue-900">{t("OrderSummary")}</h3>
          <div className="flex flex-col gap-4 mb-6 max-h-[40vh] overflow-auto">
            {items.map((item, idx) => (
              <div key={`${item.id}-${item.size || ""}-${item.color || ""}-${item.store}-${idx}`} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover rounded-lg" />
                  ) : (
                    <span className="text-xs text-gray-400">No image</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{item.name}</div>
                  <div className="text-xs text-gray-600">
                    {item.size && `${t("size")}: ${item.size} `}
                    {item.color && `${t("color")}: ${item.color}`}
                  </div>
                  <div className="text-xs text-gray-500">{t("Qty")}: {item.quantity}</div>
                </div>
                <div className="font-bold text-blue-700">
                  {formatCurrency(item.price * item.quantity, currencyCode, language)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-gray-700 font-semibold mb-1">
            <span> Subtotal</span>
            <span>{formatCurrency(subtotal, currencyCode, language)}</span>
          </div>
          <div className="flex justify-between text-gray-700 font-semibold mb-1">
            <span>{t("Delivery")}</span>
            <span>{formatCurrency(DELIVERY_FEE, currencyCode, language)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-blue-200 pt-3 mt-3">
            <span>Total</span>
            <span>{formatCurrency(total, currencyCode, language)}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default withAuth(CheckoutPage);
