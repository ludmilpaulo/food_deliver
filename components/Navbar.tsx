"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IoMdMenu, IoMdClose, IoMdCart, IoMdPerson } from "react-icons/io";
import { MdStore } from "react-icons/md";
import { FiPackage } from "react-icons/fi";
import Image from "next/image";
import logo from "@/assets/azul.png";
import { selectUser } from "@/redux/slices/authSlice";
import { useAppSelector } from "@/redux/store";
import { t, setLanguage, setLanguageFromBrowser, getLanguage } from "@/configs/i18n";
import { SupportedLocale } from "@/configs/translations";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES: { value: SupportedLocale; label: string }[] = [
  { value: "en", label: "🇬🇧 English" },
  { value: "pt", label: "🇵🇹 Português" },
];

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<SupportedLocale>(getLanguage());

  useEffect(() => {
    setLanguageFromBrowser();
    setLang(getLanguage());
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLocale);
    setLang(getLanguage());
    setMenuOpen(false); // Close mobile menu when changing language
  };

  const user = useAppSelector(selectUser);
  const cartItems = useAppSelector((state) => state.basket.items);
  const cartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = (
    <>
      <NavLink href="/AllProducts" icon={<FiPackage size={20} className="text-blue-700" />} label={t("allProducts") || "All Products"} />
      <NavLink href="/StoreTypes" icon={<MdStore size={20} className="text-yellow-500" />} label={t("Stores")} />
      <NavLink href="/CartPage" icon={<IoMdCart size={22} className="text-green-700" />} label={t("Cart")}>
        {cartQuantity > 0 && (
          <span className="absolute -top-2 -right-3 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow font-bold animate-bounce">
            {cartQuantity}
          </span>
        )}
      </NavLink>
      {user ? (
        <NavLink href="/UserDashboard" icon={<IoMdPerson size={20} className="text-indigo-700" />} label={t("Profile")} />
      ) : (
        <NavLink href="/LoginScreenUser" icon={<IoMdPerson size={20} className="text-indigo-700" />} label={t("login")} />
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-blue-100 shadow-xl">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 py-2">
          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src={logo}
              alt="Logo"
              width={48}
              height={48}
              priority
              className="rounded-xl shadow-md border border-blue-200 transition group-hover:scale-105"
            />
            <span className="text-2xl font-extrabold text-blue-900 drop-shadow-sm hidden sm:block group-hover:text-yellow-500 transition">
              Kudya
            </span>
          </Link>

          {/* Language selector */}
          <div className="flex items-center gap-2">
            <motion.select
              key={lang}
              className="p-2 rounded-xl bg-white/70 border border-gray-200 text-gray-800 font-semibold text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={lang}
              onChange={handleLanguageChange}
              aria-label={t("changeLanguage")}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {LANGUAGES.map((langOpt) => (
                <option key={langOpt.value} value={langOpt.value}>
                  {langOpt.label}
                </option>
              ))}
            </motion.select>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1 ml-5">{navLinks}</div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden p-2 rounded-full bg-blue-50 hover:bg-yellow-100 focus:outline-none shadow transition"
            >
              {menuOpen ? (
                <IoMdClose size={28} className="text-gray-700" />
              ) : (
                <IoMdMenu size={28} className="text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav, animated */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobileNav"
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="md:hidden flex flex-col space-y-2 pb-4 bg-white/95 rounded-xl shadow-lg mt-2 px-2 pt-2"
            >
              {navLinks}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

// NavLink component for consistent styling
interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
}
const NavLink: React.FC<NavLinkProps> = ({ href, icon, label, children }) => (
  <Link
    href={href}
    className="relative flex items-center gap-1 text-gray-800 hover:bg-blue-50/60 active:bg-yellow-100 rounded-xl px-3 py-2 font-semibold transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  >
    {icon}
    <span>{label}</span>
    {children}
  </Link>
);

export default Navbar;
