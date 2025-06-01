"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IoMdMenu, IoMdClose, IoMdCart, IoMdPerson } from "react-icons/io";
import { MdStore } from "react-icons/md";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/azul.png";
import { selectUser } from "@/redux/slices/authSlice";
import { useSelector } from "react-redux";
import { useAppSelector } from "@/redux/store";
import { t, setLanguage, setLanguageFromBrowser, getLanguage } from "@/configs/i18n";
import { SupportedLocale } from "@/configs/translations";

const LANGUAGES: { value: SupportedLocale; label: string }[] = [
  { value: "en", label: "🇬🇧 English" },
  { value: "pt", label: "🇵🇹 Português" },
];

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [lang, setLang] = useState(getLanguage());
  const router = useRouter();

  // System language detection on mount (only client-side)
  useEffect(() => {
    setLanguageFromBrowser();
    setLang(getLanguage());
  }, []);

  // Update language state when changed
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLocale);
    setLang(getLanguage());
  };

  const user = useSelector(selectUser);
  const cartItems = useAppSelector((state) => state.basket.items);
  const cartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchText)}`);
      setSearchText("");
      setMenuOpen(false); // Close menu on mobile
    }
  };

  // NavLinks for DRY code (mobile & desktop)
  const navLinks = (
    <>
      <form onSubmit={handleSearch} className="relative flex-1 max-w-xs">
        <input
          type="text"
          placeholder={t("search", "Search food or stores")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label={t("search")}
        />
      </form>
      <Link href="/HomeScreen" className="flex items-center text-gray-800 hover:text-blue-600 font-semibold transition px-2 py-1">
        <MdStore size={20} className="mr-1" /> {t("stores", "Stores")}
      </Link>
      <Link
        href="/CartPage"
        className="relative flex items-center text-gray-800 hover:text-blue-600 font-semibold transition px-2 py-1"
      >
        <span className="relative">
          <IoMdCart size={22} />
          {cartQuantity > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow">
              {cartQuantity}
            </span>
          )}
        </span>
        <span className="ml-1">{t("cart", "Cart")}</span>
      </Link>
      {user ? (
        <Link href="/UserDashboard" className="flex items-center text-gray-800 hover:text-blue-600 font-semibold transition px-2 py-1">
          <IoMdPerson size={20} className="mr-1" /> {t("profile", "Profile")}
        </Link>
      ) : (
        <Link href="/LoginScreenUser" className="flex items-center text-gray-800 hover:text-blue-600 font-semibold transition px-2 py-1">
          <IoMdPerson size={20} className="mr-1" /> {t("login", "Login")}
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-blue-700 shadow-md sticky top-0 z-50 transition">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={logo}
              alt="Logo"
              width={48}
              height={48}
              priority
              className="rounded-xl shadow-md"
            />
            <span className="text-xl font-bold text-blue-900 drop-shadow-sm hidden sm:block">Kudya</span>
          </Link>

          {/* Language selector */}
          <div className="flex items-center gap-2">
            <select
              className="p-1 rounded bg-white/80 border border-gray-300 text-gray-800 font-semibold text-sm shadow"
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

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-4 ml-4">{navLinks}</div>

            {/* Hamburger for mobile */}
            <button
              onClick={toggleMenu}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden p-2 rounded-full hover:bg-blue-100 focus:outline-none transition"
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
          <div className="md:hidden flex flex-col space-y-3 pb-4 animate-in fade-in-0 zoom-in-95">
            {navLinks}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
