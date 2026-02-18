"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { fetchStoreTypes } from "@/redux/slices/storeTypeSlice";
import { StoreType } from "@/services/types";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MdStore, MdRestaurant, MdLocalGroceryStore, MdLocalPharmacy } from "react-icons/md";
import { FiSearch, FiChevronRight } from "react-icons/fi";
import { t, setLanguageFromBrowser, setLanguage, getLanguage } from "@/configs/i18n";
import { SupportedLocale } from "@/configs/translations";

const getStoreTypeConfig = (name?: string) => {
  const key = (name ?? "").toLowerCase();
  if (key.includes("restaurant")) return { icon: MdRestaurant, gradient: "from-amber-500 to-orange-600", text: "text-amber-700" };
  if (key.includes("grocery")) return { icon: MdLocalGroceryStore, gradient: "from-emerald-500 to-teal-600", text: "text-emerald-700" };
  if (key.includes("pharmacy")) return { icon: MdLocalPharmacy, gradient: "from-sky-500 to-blue-600", text: "text-sky-700" };
  return { icon: MdStore, gradient: "from-slate-500 to-slate-600", text: "text-slate-700" };
};

export default function StoreTypesPage() {
  const dispatch = useAppDispatch();
  const storeTypes = useAppSelector((state) => state.storeTypes.data);
  const loading = useAppSelector((state) => state.storeTypes.loading);
  const error = useAppSelector((state) => state.storeTypes.error);

  const [searchTerm, setSearchTerm] = useState("");
  const [lang, setLang] = useState(getLanguage());
  const router = useRouter();

  useEffect(() => {
    dispatch(fetchStoreTypes());
    setLanguageFromBrowser();
    setLang(getLanguage());
  }, [dispatch]);

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
    <main className="min-h-screen bg-slate-50">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-24">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {t("selectStore")}
              </h1>
              <p className="mt-2 text-slate-300 text-base sm:text-lg max-w-xl">
                {t("browse")}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <select
                className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition cursor-pointer"
                value={lang}
                onChange={handleLanguageChange}
                aria-label="Change language"
              >
                <option value="en" className="text-slate-900">🇬🇧 English</option>
                <option value="pt" className="text-slate-900">🇵🇹 Português</option>
              </select>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="relative"
          >
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t("search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/95 backdrop-blur-sm border border-white/50 text-slate-800 placeholder-slate-400 font-medium shadow-xl shadow-slate-900/10 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition"
              autoCorrect="off"
              autoCapitalize="none"
            />
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        <div className="relative z-20">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24"
              >
                <div className="w-14 h-14 rounded-full border-4 border-teal-200 border-t-teal-500 animate-spin mb-4" />
                <p className="text-slate-600 font-medium">{t("loading")}</p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center"
              >
                <p className="text-red-700 font-medium">{t("error")}</p>
              </motion.div>
            ) : filteredTypes.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl bg-slate-100 border border-slate-200 p-12 text-center"
              >
                <MdStore className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">{t("noStores")}</p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              >
                {filteredTypes.map((type: StoreType, idx: number) => {
                  const config = getStoreTypeConfig(type?.name);
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={type.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.4 }}
                    >
                      <motion.button
                        onClick={() => router.push(`/stores?storeTypeId=${type.id}`)}
                        aria-label={type?.name ?? "Store"}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full group flex items-center gap-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 text-left"
                      >
                        <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                          {type?.icon ? (
                            <Image
                              src={type.icon}
                              width={40}
                              height={40}
                              alt={type?.name ?? ""}
                              className="object-contain"
                              loading="lazy"
                              unoptimized
                            />
                          ) : (
                            <Icon className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`block text-lg font-semibold ${config.text}`}>
                            {type?.name ?? "Store"}
                          </span>
                          {type?.description && (
                            <span className="block text-sm text-slate-500 mt-0.5 line-clamp-1">
                              {type.description}
                            </span>
                          )}
                        </div>
                        <FiChevronRight className="flex-shrink-0 w-5 h-5 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
