"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { fetchStoreTypes } from "@/redux/slices/storeTypeSlice";
import { StoreType } from "@/services/types";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MdStore } from "react-icons/md";
import { FiBox, FiSearch } from "react-icons/fi";
import { t, setLanguageFromBrowser, setLanguage, getLanguage } from "@/configs/i18n";
import { SupportedLocale } from "@/configs/translations";

const getFallbackIcon = (name?: string) => {
  const key = (name ?? "").toLowerCase();
  if (key.includes("store")) return <MdStore size={32} className="text-white" />;
  return <FiBox size={32} className="text-white" />;
};

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const storeTypes = useAppSelector((state) => state.storeTypes.data);
  const loading = useAppSelector((state) => state.storeTypes.loading);
  const error = useAppSelector((state) => state.storeTypes.error);

  const [searchTerm, setSearchTerm] = useState("");
  const [lang, setLang] = useState(getLanguage());
  const router = useRouter();

  // Detect browser language on first mount (client only)
  useEffect(() => {
    dispatch(fetchStoreTypes());
    setLanguageFromBrowser();
    setLang(getLanguage());
   }, [dispatch]);

  // If you want to add a language switcher:
  function handleLanguageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLanguage(e.target.value as SupportedLocale);
    setLang(getLanguage());
  }

  const filteredTypes = useMemo(
    () =>
      storeTypes.filter((type: StoreType) =>
        (type?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, storeTypes]
  );

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-800 via-blue-400 to-yellow-300 animate-gradient-xy overflow-x-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-yellow-200 to-pink-200 opacity-60 animate-pulse-slow" />
      <div className="relative z-10 max-w-3xl w-full mx-auto px-4 py-16 sm:px-8">
        {/* Optional: Language Switcher */}
        <div className="flex justify-end mb-3">
          <select
            className="p-2 rounded bg-white/70 border border-gray-300 text-gray-800 font-semibold"
            value={lang}
            onChange={handleLanguageChange}
            aria-label="Change language"
          >
            <option value="en">🇬🇧 English</option>
            <option value="pt">🇵🇹 Português</option>
          </select>
        </div>
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow mb-2 tracking-tight flex flex-col items-center gap-2">
            <span>
              <span className="text-yellow-300">{t("selectStore")}</span>
              <span className="inline-block animate-wave ml-1">👋</span>
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 font-medium max-w-xl mx-auto drop-shadow">
            {t("browse")}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center bg-white/70 backdrop-blur rounded-full px-6 py-3 shadow-lg border border-white/60 focus-within:ring-2 focus-within:ring-blue-400 transition mb-8"
        >
          <FiSearch size={22} className="text-blue-500" />
          <input
            type="text"
            placeholder={`🔍 ${t("search")}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ml-3 flex-1 bg-transparent outline-none text-gray-800 text-base font-medium placeholder-gray-400"
            autoCorrect="off"
            autoCapitalize="none"
          />
        </motion.div>
        <div className="flex flex-wrap gap-6 justify-center items-start min-h-[340px]">
          <AnimatePresence>
            {loading ? (
              <motion.div
                key="loading"
                className="w-full flex flex-col items-center mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-20 h-20 border-4 border-b-0 border-yellow-300 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                <p className="text-xl text-white font-semibold">{t("loading")}</p>
              </motion.div>
            ) : error ? (
              <motion.p
                key="error"
                className="text-white text-center text-lg font-semibold w-full mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="text-red-400">{t("error")}</span>
              </motion.p>
            ) : filteredTypes.length === 0 ? (
              <motion.p
                key="empty"
                className="text-white/90 text-center text-lg font-semibold w-full mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {t("noStores")}
              </motion.p>
            ) : (
              filteredTypes.map((type: StoreType, idx: number) => (
                <motion.div
                  key={type.id}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ delay: idx * 0.06, type: "spring", stiffness: 120 }}
                  className="w-full sm:w-[47%] md:w-[30%] cursor-pointer"
                >
                  <motion.button
                    whileHover={{ scale: 1.045, boxShadow: "0 6px 32px rgba(0,0,0,0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    className="relative rounded-2xl bg-white/90 hover:bg-blue-50 transition overflow-hidden shadow-xl flex flex-col items-center py-7 px-4 group border border-white/80"
                    onClick={() => router.push(`/stores?storeTypeId=${type.id}`)}
                    aria-label={type?.name ?? "Store"}
                  >
                    {type?.icon ? (
                      <div className="w-16 h-16 rounded-xl mb-3 overflow-hidden flex items-center justify-center bg-gradient-to-tr from-blue-400 to-yellow-300 shadow-inner border-2 border-blue-200 group-hover:scale-105 transition">
                        <Image
                          src={type.icon}
                          width={64}
                          height={64}
                          alt={type?.name ?? "Store"}
                          className="object-cover w-16 h-16"
                          loading="lazy"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-blue-400 rounded-xl mb-3 flex items-center justify-center shadow-lg border-2 border-blue-300 group-hover:scale-105 transition">
                        {getFallbackIcon(type?.name)}
                      </div>
                    )}
                    <span className="text-lg font-semibold text-center text-blue-800 group-hover:text-blue-600 transition">
                      {type?.name ?? "Store"}
                    </span>
                  </motion.button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
