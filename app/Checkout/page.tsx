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

const LANGUAGES: { value: SupportedLocale; label: string }[] = [
  { value: "en", label: "🇬🇧 English" },
  { value: "pt", label: "🇵🇹 Português" },
];

const DELIVERY_FEE = 40;

const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

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

    // Compose payload for API
    const payload = {
      access_token: user?.token, // Must be present
      store_id: items[0]?.store, // assumes same store per cart
      address: address,
      delivery_notes: notes,
      payment_method: payment,
      delivery_fee: DELIVERY_FEE,
      order_details: items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
      // If needed: coupon_code, location, use_current_location, etc.
    };

    try {
      const res = await fetch(`${baseAPI}/order/orders/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (data.status === "success") {
        setOrderSuccess(true);
        setOrderPin(data.secret_pin);
        setWhatsappUrl(data.whatsapp_url || null);
        dispatch(clearAllCart());
      } else {
        setError(data.error || t("An unexpected error occurred", "Ocorreu um erro inesperado"));
      }
    } catch (e) {
      setLoading(false);
      setError(t("Network error, please try again.", "Erro de rede, tente novamente."));
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-blue-50 to-blue-100 px-4">
        <FaCheckCircle className="text-green-500 text-6xl mb-3 drop-shadow-lg" />
        <h2 className="text-2xl font-extrabold text-green-700 mb-2">{t("Order Placed!", "Pedido realizado!")}</h2>
        <div className="bg-white shadow-xl rounded-xl px-6 py-4 mb-4 text-center border">
          <p className="text-lg font-bold text-blue-800">{t("Thank you! Your order has been received.", "Obrigado! Seu pedido foi recebido.")}</p>
          {orderPin && (
            <div className="mt-2 mb-2 flex items-center justify-center gap-2">
              <FaInfoCircle className="text-blue-400" />
              <span className="text-blue-800 font-bold">
                {t("Your Secret PIN:", "Seu PIN Secreto:")} <span className="bg-blue-50 px-2 py-1 rounded text-lg">{orderPin}</span>
              </span>
            </div>
          )}
          <p className="text-gray-500 mt-2 mb-1">{t("You'll receive updates via WhatsApp or email.", "Você receberá atualizações por WhatsApp ou email.")}</p>
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-xl transition">
              <FaWhatsapp /> {t("Open WhatsApp", "Abrir WhatsApp")}
            </a>
          )}
        </div>
        <Link href="/HomeScreen" className="mt-2">
          <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full text-white font-semibold shadow transition">
            {t("Back to Home", "Voltar para o início")}
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
          <h1 className="text-xl font-extrabold text-blue-900 drop-shadow">{t("Checkout", "Finalizar Compra")}</h1>
        </div>
        <select
          className="p-1 rounded bg-white/80 border border-gray-300 text-gray-800 font-semibold text-sm shadow ml-auto mt-2 md:mt-0"
          value={lang}
          onChange={handleLanguageChange}
          aria-label={t("changeLanguage", "Change language")}
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
          <h2 className="text-2xl font-bold text-blue-900 mb-4">{t("Delivery Details", "Detalhes de Entrega")}</h2>
          <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t("Full Name", "Nome completo")}</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 p-3"
                placeholder={t("Enter your name", "Digite seu nome")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t("Phone Number", "Telefone")}</label>
              <input
                type="tel"
                className="w-full rounded-lg border border-gray-300 p-3"
                placeholder={t("Enter your phone number", "Digite seu telefone")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">{t("Delivery Address", "Endereço de entrega")}</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 resize-none"
                placeholder={t("Enter delivery address", "Digite o endereço de entrega")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 mb-1">{t("Order Notes (optional)", "Observações (opcional)")}</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 resize-none"
              placeholder={t("e.g. Leave at the gate", "Ex: Deixe no portão")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">{t("Payment Method", "Método de pagamento")}</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" className="accent-blue-600" checked={payment === "cash"} onChange={() => setPayment("cash")} />
                <span>{t("Cash on Delivery", "Dinheiro na Entrega")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" className="accent-blue-600" checked={payment === "card"} onChange={() => setPayment("card")} />
                <span>{t("Card on Delivery", "Cartão na Entrega")}</span>
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
                {t("Placing Order...", "Enviando pedido...")}
              </span>
            ) : (
              t("Place Order", "Fazer Pedido")
            )}
          </button>
        </form>

        {/* Order Summary */}
        <div className="md:w-[28rem] w-full bg-white/90 shadow-2xl rounded-2xl p-8 h-fit border">
          <h3 className="text-xl font-bold mb-4 text-blue-900">{t("Order Summary", "Resumo do Pedido")}</h3>
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
                    {item.size && `${t("Size", "Tamanho")}: ${item.size} `}
                    {item.color && `${t("Color", "Cor")}: ${item.color}`}
                  </div>
                  <div className="text-xs text-gray-500">{t("Qty", "Qtd")}: {item.quantity}</div>
                </div>
                <div className="font-bold text-blue-700">
                  {formatCurrency(item.price * item.quantity, currencyCode, language)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-gray-700 font-semibold mb-1">
            <span>{t("Subtotal", "Subtotal")}</span>
            <span>{formatCurrency(subtotal, currencyCode, language)}</span>
          </div>
          <div className="flex justify-between text-gray-700 font-semibold mb-1">
            <span>{t("Delivery", "Entrega")}</span>
            <span>{formatCurrency(DELIVERY_FEE, currencyCode, language)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-blue-200 pt-3 mt-3">
            <span>{t("Total", "Total")}</span>
            <span>{formatCurrency(total, currencyCode, language)}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default withAuth(CheckoutPage);
