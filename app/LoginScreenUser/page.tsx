"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Transition } from "@headlessui/react";
import { Eye, EyeOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import logo from "@/assets/azul.png";
import { loginUser, selectAuth, type LoginResult } from "@/redux/slices/authSlice";
import { resolvePostLoginRoute } from "@/utils/postLoginRoute";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { SupportedLocale, supportedLocales } from "@/configs/translations";
import { analytics } from "@/utils/mixpanel";
import { useTranslation } from "@/hooks/useTranslation";
import {
  DEV_TEST_CUSTOMER_LOGIN,
  DEV_TEST_DOCTOR_LOGIN,
  DEV_TEST_STORE_LOGIN,
  DEV_TEST_CUSTOMER_LOGIN_BUTTON_LABEL,
  DEV_TEST_DOCTOR_LOGIN_BUTTON_LABEL,
  DEV_TEST_STORE_LOGIN_BUTTON_LABEL,
  isDevLoginEnabled,
} from "@/configs/devTestLogin";

const LANGUAGE_LABELS: Record<SupportedLocale, string> = {
  en: "English",
  pt: "Portugues",
  fr: "Francais",
  es: "Espanol",
};

const LoginScreenUser: React.FC = () => {
  const { t, languageCode, changeLanguage } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectAuth);
  const nextPath = searchParams.get("next");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  useEffect(() => {
    analytics.trackPageView('Login Page');
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value as SupportedLocale);
  };

  const handleFillTestDoctorLogin = () => {
    setUsername(DEV_TEST_DOCTOR_LOGIN.username);
    setPassword(DEV_TEST_DOCTOR_LOGIN.password);
  };

  const handleFillTestStoreLogin = () => {
    setUsername(DEV_TEST_STORE_LOGIN.username);
    setPassword(DEV_TEST_STORE_LOGIN.password);
  };

  const handleFillTestCustomerLogin = () => {
    setUsername(DEV_TEST_CUSTOMER_LOGIN.username);
    setPassword(DEV_TEST_CUSTOMER_LOGIN.password);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      alert(t("fillAllFields"));
      return;
    }
    try {
      const resultAction: LoginResult = await dispatch(
        loginUser({ username, password })
      ).unwrap();
      const destination = resolvePostLoginRoute(resultAction, nextPath);
      const userType = resultAction.is_customer
        ? "customer"
        : resultAction.is_platform_admin || resultAction.role === "super_admin"
          ? "platform_admin"
          : resultAction.is_driver
            ? "driver"
            : "store";

      analytics.trackLogin(resultAction.user_id.toString(), {
        user_type: userType,
        platform: "web",
      });
      if (typeof window !== "undefined") {
        window.location.assign(destination);
      } else {
        router.replace(destination);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      analytics.trackError('Login Failed', { username, error: errorMessage });
      if (typeof error === "string") {
        alert(error);
      } else {
        alert(t("loginFailed"));
      }
    }
  };

  return (
    <>
      <div className="w-full min-h-screen px-4 py-12 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-100 to-blue-200">
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-br from-yellow-400 to-blue-600 rounded-md filter blur-3xl opacity-40 -z-20" />
        <motion.div
          animate={{ scale: [1, 1.03, 1], rotate: [0, 2, 0] }}
          className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl relative border"
        >
          <div className="flex items-center justify-between mb-6">
            <Image src={logo} alt="logo" width={64} height={64} className="rounded-full" />
            <select
              className="ml-2 p-1 rounded bg-white/80 border border-gray-300 text-gray-800 font-semibold text-sm shadow"
              value={languageCode}
              onChange={handleLanguageChange}
              aria-label={t("changeLanguage")}
            >
              {supportedLocales.map((code) => (
                <option key={code} value={code}>
                  {LANGUAGE_LABELS[code]}
                </option>
              ))}
            </select>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-2">
            {t("loginTitle")}
          </h2>
          <Link href="/SignupScreen" className="block text-center mb-6 text-gray-500 text-sm font-medium">
            {t("noAccount")}{" "}
            <span className="text-blue-700 underline font-semibold cursor-pointer">{t("registerHere")}</span>
          </Link>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("username")}</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("username")}
                type="text"
                autoComplete="username"
                className="w-full py-3 px-4 text-base bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full py-3 px-4 text-base bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center h-full px-3"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <span
                className="text-sm text-blue-700 hover:underline cursor-pointer"
                onClick={() => setShowForgotPasswordModal(true)}
              >
                {t("forgotPassword")}
              </span>
            </div>
            {isDevLoginEnabled() && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleFillTestCustomerLogin}
                  className="w-full py-2 text-xs font-semibold text-slate-600 bg-slate-100 border border-dashed border-slate-300 rounded hover:bg-slate-200 transition"
                >
                  {DEV_TEST_CUSTOMER_LOGIN_BUTTON_LABEL}
                </button>
                <button
                  type="button"
                  onClick={handleFillTestStoreLogin}
                  className="w-full py-2 text-xs font-semibold text-slate-600 bg-slate-100 border border-dashed border-slate-300 rounded hover:bg-slate-200 transition"
                >
                  {DEV_TEST_STORE_LOGIN_BUTTON_LABEL}
                </button>
                <button
                  type="button"
                  onClick={handleFillTestDoctorLogin}
                  className="w-full py-2 text-xs font-semibold text-slate-600 bg-slate-100 border border-dashed border-slate-300 rounded hover:bg-slate-200 transition"
                >
                  {DEV_TEST_DOCTOR_LOGIN_BUTTON_LABEL}
                </button>
              </div>
            )}
            <button
              type="submit"
              aria-label={t("login")}
              className="w-full py-3 text-base font-bold text-white bg-gradient-to-r from-blue-700 to-yellow-500 rounded hover:from-blue-800 hover:to-yellow-600 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 transition"
              disabled={loading}
            >
              {t("login")}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Loading Overlay */}
      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Transition>

      <ForgotPasswordModal
        show={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </>
  );
};

export default LoginScreenUser;
