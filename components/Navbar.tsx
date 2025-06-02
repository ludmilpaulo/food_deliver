"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IoMdMenu, IoMdClose, IoMdCart, IoMdPerson } from "react-icons/io";
import { MdStore, MdCategory, MdDashboard } from "react-icons/md";
import { FiPackage } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/azul.png";
import { selectUser } from "@/redux/slices/authSlice";
import { useAppSelector } from "@/redux/store";
import { t, setLanguage, setLanguageFromBrowser, getLanguage } from "@/configs/i18n";
import { SupportedLocale } from "@/configs/translations";

const LANGUAGES: { value: SupportedLocale; label: string }[] = [
  { value: "en", label: "🇬🇧 English" },
  { value: "pt", label: "🇵🇹 Português" },
];

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<SupportedLocale>(getLanguage());
  const router = useRouter();

  useEffect(() => {
    setLanguageFromBrowser();
    setLang(getLanguage());
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLocale);
    setLang(getLanguage());
  };

  const user = useAppSelector(selectUser);
  const cartItems = useAppSelector((state) => state.basket.items);
  const cartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const navLinks = (
    <>
      <Link
        href="/AllProducts"
        className="flex items-center gap-1 text-gray-800 hover:bg-blue-50/60 active:bg-yellow-100 rounded-xl px-3 py-2 font-semibold transition shadow-sm hover:shadow"
      >
        <FiPackage size={20} className="mr-1 text-blue-700" />
        {t("allProducts") || "All Products"}
      </Link>
      <Link
        href="/StoreTypes"
        className="flex items-center gap-1 text-gray-800 hover:bg-blue-50/60 active:bg-yellow-100 rounded-xl px-3 py-2 font-semibold transition shadow-sm hover:shadow"
      >
        <MdStore size={20} className="mr-1 text-yellow-500" />
        {t("Stores")}
      </Link>
      <Link
        href="/CartPage"
        className="relative flex items-center gap-1 text-gray-800 hover:bg-blue-50/60 active:bg-yellow-100 rounded-xl px-3 py-2 font-semibold transition shadow-sm hover:shadow"
      >
        <IoMdCart size={22} className="mr-1 text-green-700" />
        <span>{t("Cart")}</span>
        {cartQuantity > 0 && (
          <span className="absolute -top-2 -right-3 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow font-bold">
            {cartQuantity}
          </span>
        )}
      </Link>
      {user ? (
        <Link
          href="/UserDashboard"
          className="flex items-center gap-1 text-gray-800 hover:bg-blue-50/60 active:bg-yellow-100 rounded-xl px-3 py-2 font-semibold transition shadow-sm hover:shadow"
        >
          <IoMdPerson size={20} className="mr-1 text-indigo-700" />
          {t("Profile")}
        </Link>
      ) : (
        <Link
          href="/LoginScreenUser"
          className="flex items-center gap-1 text-gray-800 hover:bg-blue-50/60 active:bg-yellow-100 rounded-xl px-3 py-2 font-semibold transition shadow-sm hover:shadow"
        >
          <IoMdPerson size={20} className="mr-1 text-indigo-700" />
          {t("login")}
        </Link>
      )}
    </>
  );

  return (
    <nav className="backdrop-blur-xl bg-white/60 shadow-xl sticky top-0 z-50 border-b border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={logo}
              alt="Logo"
              width={48}
              height={48}
              priority
              className="rounded-xl shadow-md border border-blue-200"
            />
            <span className="text-2xl font-extrabold text-blue-900 drop-shadow-sm hidden sm:block">Kudya</span>
          </Link>
          <div className="flex items-center gap-2">
            <select
              className="p-2 rounded-xl bg-white/70 border border-gray-200 text-gray-800 font-semibold text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-2 ml-4">{navLinks}</div>
            {/* Hamburger for mobile */}
            <button
              onClick={toggleMenu}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden p-2 rounded-full hover:bg-blue-100 focus:outline-none shadow transition"
            >
              {menuOpen ? (
                <IoMdClose size={28} className="text-gray-700" />
              ) : (
                <IoMdMenu size={28} className="text-gray-700" />
              )}
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden flex flex-col space-y-3 pb-4 animate-in fade-in-0 zoom-in-95 bg-white/95 rounded-xl shadow-lg mt-2 px-2 pt-2">
            {navLinks}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
