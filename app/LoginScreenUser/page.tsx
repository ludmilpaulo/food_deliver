"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import logo from "@/assets/azul.png";
import { loginUser, selectAuth, setAuthFromSocial, type LoginResult } from "@/redux/slices/authSlice";
import { resolvePostLoginRoute } from "@/utils/postLoginRoute";
import { QRCodeSVG } from "qrcode.react";
import {
  confirmLoginMfaSetup,
  MFA_REQUIRED_ERROR,
  MFA_SETUP_REQUIRED_PREFIX,
  startLoginMfaSetup,
} from "@/services/authService";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { SupportedLocale, supportedLocales } from "@/configs/translations";
import { initLanguage } from "@/configs/i18n";
import { analytics } from "@/utils/mixpanel";
import { useTranslation } from "@/hooks/useTranslation";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import {
  DEV_TEST_ADMIN_LOGIN,
  DEV_TEST_CUSTOMER_LOGIN,
  DEV_TEST_DOCTOR_LOGIN,
  DEV_TEST_STORE_LOGIN,
  DEV_TEST_GROCERY_LOGIN,
  DEV_TEST_ADMIN_LOGIN_BUTTON_LABEL,
  DEV_TEST_CUSTOMER_LOGIN_BUTTON_LABEL,
  DEV_TEST_DOCTOR_LOGIN_BUTTON_LABEL,
  DEV_TEST_STORE_LOGIN_BUTTON_LABEL,
  DEV_TEST_GROCERY_LOGIN_BUTTON_LABEL,
  isDevLoginEnabled,
} from "@/configs/devTestLogin";

const LANGUAGE_OPTIONS: { value: SupportedLocale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "pt", label: "Português", flag: "🇵🇹" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15";

function LoginSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(280px,42%)_1fr]">
      <div className="hidden bg-slate-900 lg:block" />
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      </div>
    </div>
  );
}

function LoginScreenUser() {
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
  const [formError, setFormError] = useState("");
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSetup, setMfaSetup] = useState<{ token: string; secret: string; otpauthUri: string } | null>(null);

  useEffect(() => {
    analytics.trackPageView("Login Page");
  }, []);

  const handleFillTestAdminLogin = () => {
    setUsername(DEV_TEST_ADMIN_LOGIN.username);
    setPassword(DEV_TEST_ADMIN_LOGIN.password);
    setFormError("");
  };

  const handleFillTestDoctorLogin = () => {
    setUsername(DEV_TEST_DOCTOR_LOGIN.username);
    setPassword(DEV_TEST_DOCTOR_LOGIN.password);
    setFormError("");
  };

  const handleFillTestStoreLogin = () => {
    setUsername(DEV_TEST_STORE_LOGIN.username);
    setPassword(DEV_TEST_STORE_LOGIN.password);
    setFormError("");
  };

  const handleFillTestCustomerLogin = () => {
    setUsername(DEV_TEST_CUSTOMER_LOGIN.username);
    setPassword(DEV_TEST_CUSTOMER_LOGIN.password);
    setFormError("");
  };

  const handleFillTestGroceryLogin = () => {
    setUsername(DEV_TEST_GROCERY_LOGIN.username);
    setPassword(DEV_TEST_GROCERY_LOGIN.password);
    setFormError("");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError("");
    if (!username || !password) {
      setFormError(t("fillAllFields"));
      return;
    }
    const needsCode = mfaStep || mfaSetup !== null;
    if (needsCode && !/^\d{6}$/.test(mfaCode.trim())) {
      setFormError(t("mfaCodeHint", "Enter the 6-digit code from your authenticator app."));
      return;
    }
    if (mfaSetup) {
      try {
        await confirmLoginMfaSetup(mfaSetup.token, mfaCode.trim());
      } catch (error: unknown) {
        setFormError(error instanceof Error ? error.message : t("loginFailed"));
        return;
      }
      setMfaSetup(null);
      setMfaStep(true);
    }
    try {
      const resultAction: LoginResult = await dispatch(
        loginUser({ username, password, mfaCode: needsCode ? mfaCode.trim() : undefined }),
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
      if (errorMessage === MFA_REQUIRED_ERROR) {
        setMfaStep(true);
        setMfaCode("");
        return;
      }
      if (errorMessage.startsWith(MFA_SETUP_REQUIRED_PREFIX)) {
        const token = errorMessage.slice(MFA_SETUP_REQUIRED_PREFIX.length);
        try {
          const setup = await startLoginMfaSetup(token);
          setMfaSetup({ token, secret: setup.secret, otpauthUri: setup.otpauth_uri });
          setMfaCode("");
        } catch (setupError: unknown) {
          setFormError(setupError instanceof Error ? setupError.message : t("loginFailed"));
        }
        return;
      }
      analytics.trackError("Login Failed", { username, error: errorMessage });
      if (typeof error === "string" && error.trim()) {
        setFormError(error);
      } else if (error instanceof Error && error.message) {
        setFormError(error.message);
      } else {
        setFormError(t("loginFailed"));
      }
    }
  };

  const handleSocialSuccess = (result: LoginResult) => {
    dispatch(setAuthFromSocial(result));
    const destination = resolvePostLoginRoute(result, nextPath);
    analytics.trackLogin(result.user_id.toString(), {
      user_type: result.created ? "social_signup" : "social_login",
      platform: "web",
    });
    window.location.assign(destination);
  };

  const highlights = [
    t("signupHighlight1"),
    t("signupHighlight2"),
    t("signupHighlight3"),
  ];

  return (
    <>
      <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(300px,44%)_1fr]">
        <aside className="relative hidden bg-slate-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-600/40 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg">
                <Image src={logo} alt="Kudya" width={40} height={40} className="object-contain" />
              </span>
              <span className="text-xl font-semibold tracking-tight">Kudya</span>
            </Link>
            <h1 className="mt-14 max-w-md text-4xl font-semibold leading-tight tracking-tight text-balance xl:text-[2.6rem]">
              {t("loginHeroTitle")}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-pretty text-slate-300">
              {t("loginHeroSubtitle")}
            </p>
            <ul className="mt-10 space-y-4">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-sm text-slate-400">{t("loginTrustLine")}</p>
        </aside>

        <main className="relative flex min-h-screen flex-col">
          <header className="flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 lg:hidden">
                <Image src={logo} alt="" width={32} height={32} className="object-contain" />
              </span>
              <span className="text-base font-semibold tracking-tight text-slate-900 lg:hidden">Kudya</span>
              <span className="hidden items-center gap-2 lg:inline-flex">
                <ArrowLeft size={16} />
                {t("backToHome")}
              </span>
            </Link>
            <label className="sr-only" htmlFor="login-language">
              {t("changeLanguage")}
            </label>
            <select
              id="login-language"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
              value={languageCode}
              onChange={(e) => {
                const next = e.target.value as SupportedLocale;
                initLanguage(next);
                changeLanguage(next);
              }}
              aria-label={t("changeLanguage")}
            >
              {LANGUAGE_OPTIONS.filter((opt) => supportedLocales.includes(opt.value)).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.flag} {opt.label}
                </option>
              ))}
            </select>
          </header>

          <div className="flex flex-1 items-start justify-center px-5 pb-12 pt-1 sm:px-8 lg:items-center lg:px-12">
            <div className="w-full max-w-[460px]">
              <div className="mb-6 overflow-hidden rounded-2xl bg-slate-950 p-5 text-white lg:hidden">
                <h1 className="text-xl font-semibold tracking-tight">{t("loginHeroTitle")}</h1>
                <p className="mt-1.5 text-sm leading-6 text-slate-300">{t("loginHeroSubtitleShort")}</p>
                <p className="mt-3 text-sm text-slate-300">
                  {t("noAccount")}{" "}
                  <Link href="/SignupScreen" className="font-semibold text-white underline underline-offset-2">
                    {t("registerHere")}
                  </Link>
                </p>
              </div>

              <div className="mb-7 hidden lg:block">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
                  {t("loginTitle")}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {t("noAccount")}{" "}
                  <Link
                    href="/SignupScreen"
                    className="font-semibold text-blue-700 underline-offset-2 hover:underline"
                  >
                    {t("registerHere")}
                  </Link>
                </p>
              </div>

              {formError ? (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  {formError}
                </div>
              ) : null}

              <div className="mb-5">
                <SocialLoginButtons
                  heading={null}
                  className=""
                  disabled={loading}
                  nextPath={nextPath}
                  onSuccess={handleSocialSuccess}
                />
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <p className="relative mx-auto w-fit bg-slate-50 px-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("orContinueWithEmail")}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="login-username" className="block text-sm font-medium text-slate-700">
                    {t("username")}
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (formError) setFormError("");
                      }}
                      placeholder={t("username")}
                      type="text"
                      autoComplete="username"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                    {t("password")}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (formError) setFormError("");
                      }}
                      placeholder={t("password")}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className={`${inputClass} pr-12`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 hover:text-slate-700"
                      aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {mfaSetup ? (
                  <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">{t("mfaLoginSetupTitle")}</p>
                    <p>{t("mfaLoginSetupHint")}</p>
                    <div className="flex justify-center rounded-lg bg-white p-3">
                      <QRCodeSVG value={mfaSetup.otpauthUri} size={168} />
                    </div>
                    <code className="block break-all rounded-lg bg-white px-3 py-2 text-center font-mono text-slate-900">
                      {mfaSetup.secret}
                    </code>
                  </div>
                ) : null}

                {mfaStep || mfaSetup ? (
                  <div className="space-y-1.5">
                    <label htmlFor="login-mfa" className="block text-sm font-medium text-slate-700">
                      {t("mfaCode", "Authenticator code")}
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="login-mfa"
                        value={mfaCode}
                        onChange={(e) => {
                          setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                          if (formError) setFormError("");
                        }}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        autoFocus
                        placeholder="123456"
                        className={inputClass}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      {t("mfaCodeHint", "Enter the 6-digit code from your authenticator app.")}
                    </p>
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-sm font-semibold text-blue-700 underline-offset-2 hover:underline"
                  >
                    {t("forgotPassword")}
                  </button>
                </div>

                {isDevLoginEnabled() ? (
                  <details className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                    <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                      {t("devSignIn")}
                    </summary>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={handleFillTestAdminLogin}
                        className="w-full rounded-lg border border-indigo-200 bg-indigo-50 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 sm:col-span-2"
                      >
                        {DEV_TEST_ADMIN_LOGIN_BUTTON_LABEL}
                      </button>
                      <button
                        type="button"
                        onClick={handleFillTestCustomerLogin}
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        {DEV_TEST_CUSTOMER_LOGIN_BUTTON_LABEL}
                      </button>
                      <button
                        type="button"
                        onClick={handleFillTestStoreLogin}
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        {DEV_TEST_STORE_LOGIN_BUTTON_LABEL}
                      </button>
                      <button
                        type="button"
                        onClick={handleFillTestGroceryLogin}
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        {DEV_TEST_GROCERY_LOGIN_BUTTON_LABEL}
                      </button>
                      <button
                        type="button"
                        onClick={handleFillTestDoctorLogin}
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 sm:col-span-2"
                      >
                        {DEV_TEST_DOCTOR_LOGIN_BUTTON_LABEL}
                      </button>
                    </div>
                  </details>
                ) : null}

                <button
                  type="submit"
                  aria-label={t("login")}
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("signingIn")}
                    </>
                  ) : (
                    t("login")
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>

      <ForgotPasswordModal
        show={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </>
  );
}

export default function LoginScreenUserPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginScreenUser />
    </Suspense>
  );
}
