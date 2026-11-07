"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  FileUp,
  ImageUp,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import logo from "@/assets/azul.png";
import { signup } from "@/services/authService";
import { SupportedLocale, supportedLocales } from "@/configs/translations";
import { initLanguage } from "@/configs/i18n";
import { useAppDispatch } from "@/redux/store";
import { analytics } from "@/utils/mixpanel";
import { useTranslation } from "@/hooks/useTranslation";
import { fetchBusinessCategories, type BusinessCategory } from "@/services/platformApi";
import { type LoginResult, loginUser, setAuthFromSocial } from "@/redux/slices/authSlice";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { resolvePostLoginRoute } from "@/utils/postLoginRoute";

const LANGUAGE_OPTIONS: { value: SupportedLocale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "pt", label: "Português", flag: "🇵🇹" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15";

const iconInputClass = `${inputClass} pl-11`;

type Role = "client" | "store";

type SignupFormState = {
  username: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  logo: File | null;
  store_license: File | null;
  business_category: string;
};

function passwordScore(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-blue-600">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function SignupSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(280px,42%)_1fr]">
      <div className="hidden bg-slate-900 lg:block" />
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      </div>
    </div>
  );
}

function SignupScreen() {
  const { t, languageCode, changeLanguage } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [signupData, setSignupData] = useState<SignupFormState>({
    username: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    logo: null,
    store_license: null,
    business_category: "business",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("client");
  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const strength = passwordScore(signupData.password);
  const strengthLabels = [
    "",
    t("passwordWeak"),
    t("passwordFair"),
    t("passwordGood"),
    t("passwordStrong"),
  ];
  const strengthColors = ["bg-slate-200", "bg-rose-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"];

  const logoPreview = useMemo(() => {
    if (signupData.logo && signupData.logo.type.startsWith("image/")) {
      return URL.createObjectURL(signupData.logo);
    }
    return null;
  }, [signupData.logo]);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  useEffect(() => {
    analytics.trackPageView("Signup Page");
  }, []);

  useEffect(() => {
    const account = searchParams.get("account");
    if (account === "partner" || account === "business") {
      setRole("store");
    }
  }, [searchParams]);

  useEffect(() => {
    if (role !== "store") return;
    fetchBusinessCategories(languageCode, "web")
      .then((data) => {
        setBusinessCategories(data);
        setSignupData((prev) => ({
          ...prev,
          business_category: prev.business_category || data[0]?.slug || "business",
        }));
      })
      .catch(() => {
        setBusinessCategories([]);
      });
  }, [languageCode, role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const file = files?.[0];
    if (!file) return;
    if (name === "logo" || name === "store_license") {
      setSignupData((prev) => ({ ...prev, [name]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setLoading(true);
    try {
      const { status, data } = await signup(role, signupData);

      if (status === 201 || data.status === "201" || data.status === "success") {
        const loginResult: LoginResult = await dispatch(
          loginUser({ username: signupData.username, password: signupData.password }),
        ).unwrap();

        analytics.trackSignup(loginResult.user_id?.toString() || signupData.username, {
          name: signupData.name,
          email: signupData.email,
          user_type: role,
          platform: "web",
        });

        setFormSuccess(t("registerSuccess"));
        if (role === "store") {
          router.push(loginResult.business_profile?.dashboardRoute || "/dashboard/business");
        } else {
          router.push("/HomeScreen");
        }
      } else {
        handleErrorResponse(status, data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      analytics.trackError("Signup Failed", { role, error: errorMessage });
      setFormError(t("registerFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleErrorResponse = (status: number, data: { message?: string }) => {
    switch (status) {
      case 400:
        setFormError(data.message || t("fillAllFields"));
        break;
      case 401:
        setFormError(data.message || t("notAuthorized"));
        break;
      case 404:
        setFormError(data.message || t("notFound"));
        break;
      case 200:
        setFormSuccess(data.message || t("registerSuccess"));
        break;
      default:
        setFormError(data.message || t("registerFailed"));
    }
  };

  const highlights = [
    t("signupHighlight1"),
    t("signupHighlight2"),
    t("signupHighlight3"),
  ];

  return (
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
            {t("signupHeroTitle")}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-pretty text-slate-300">
            {t("signupHeroSubtitle")}
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

        <p className="relative z-10 text-sm text-slate-400">
          {t("signupTrustLine")}
        </p>
      </aside>

      <main className="relative flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/" className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 lg:hidden">
              <Image src={logo} alt="" width={32} height={32} className="object-contain" />
            </span>
            <span className="text-base font-semibold tracking-tight text-slate-900 lg:hidden">Kudya</span>
            <span className="hidden items-center gap-2 lg:inline-flex">
              <ArrowLeft size={16} />
              {t("backToHome")}
            </span>
          </Link>
          <label className="sr-only" htmlFor="signup-language">
            {t("changeLanguage")}
          </label>
          <select
            id="signup-language"
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
              <h1 className="text-xl font-semibold tracking-tight">
                {t("signupHeroTitle")}
              </h1>
              <p className="mt-1.5 text-sm leading-6 text-slate-300">
                {t("signupHeroSubtitleShort")}
              </p>
              <p className="mt-3 text-sm text-slate-300">
                {t("alreadyHaveAccount")}{" "}
                <Link href="/LoginScreenUser" className="font-semibold text-white underline underline-offset-2">
                  {t("login")}
                </Link>
              </p>
            </div>

            <div className="mb-7 hidden lg:block">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
                {t("signup")}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {t("alreadyHaveAccount")}{" "}
                <Link
                  href="/LoginScreenUser"
                  className="font-semibold text-blue-700 underline-offset-2 hover:underline"
                >
                  {t("login")}
                </Link>
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3" role="radiogroup" aria-label={t("role")}>
              <button
                type="button"
                role="radio"
                aria-checked={role === "client"}
                onClick={() => setRole("client")}
                className={`rounded-2xl border p-3.5 text-left transition ${
                  role === "client"
                    ? "border-blue-600 bg-blue-50 shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <ShoppingBag
                  className={role === "client" ? "text-blue-600" : "text-slate-400"}
                  size={20}
                />
                <p className="mt-2 text-sm font-semibold text-slate-900">{t("client")}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  {t("signupCustomerHint")}
                </p>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={role === "store"}
                onClick={() => setRole("store")}
                className={`rounded-2xl border p-3.5 text-left transition ${
                  role === "store"
                    ? "border-blue-600 bg-blue-50 shadow-[0_0_0_4px_rgba(37,99,235,0.12)]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <Store className={role === "store" ? "text-blue-600" : "text-slate-400"} size={20} />
                <p className="mt-2 text-sm font-semibold text-slate-900">{t("store")}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  {t("signupPartnerHint")}
                </p>
              </button>
            </div>

            {formError ? (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {formError}
              </div>
            ) : null}
            {formSuccess ? (
              <div
                role="status"
                className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {formSuccess}
              </div>
            ) : null}

            {role === "client" ? (
              <div className="mb-5">
                <SocialLoginButtons
                  heading={null}
                  className=""
                  disabled={loading}
                  onSuccess={(result) => {
                    dispatch(setAuthFromSocial(result));
                    analytics.trackSignup(result.user_id.toString(), {
                      user_type: "social",
                      platform: "web",
                    });
                    window.location.assign(resolvePostLoginRoute(result));
                  }}
                />
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <p className="relative mx-auto w-fit bg-slate-50 px-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t("orRegisterWithEmail")}
                  </p>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
              <Field id="username" label={t("username")} required>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="username"
                    name="username"
                    placeholder={t("username")}
                    onChange={handleInputChange}
                    className={iconInputClass}
                    autoComplete="username"
                    required
                  />
                </div>
              </Field>

              <Field id="email" label={t("email")} required>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder={t("email")}
                    onChange={handleInputChange}
                    className={iconInputClass}
                    autoComplete="email"
                    required
                  />
                </div>
              </Field>

              <Field id="password" label={t("password")} required>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t("password")}
                    onChange={handleInputChange}
                    className={`${iconInputClass} pr-12`}
                    autoComplete="new-password"
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
                {signupData.password ? (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <span
                          key={step}
                          className={`h-1.5 flex-1 rounded-full ${
                            strength >= step ? strengthColors[strength] : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {t("passwordHint")}{" "}
                      {strengthLabels[strength] ? (
                        <span className="font-medium text-slate-700">{strengthLabels[strength]}</span>
                      ) : null}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">{t("passwordHint")}</p>
                )}
              </Field>

              {role === "store" ? (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Building2 size={16} className="text-blue-600" />
                    {t("businessInfo")}
                  </div>

                  <Field id="business_category" label={t("businessCategory")} required>
                    <select
                      id="business_category"
                      name="business_category"
                      value={signupData.business_category}
                      onChange={(e) =>
                        setSignupData((prev) => ({
                          ...prev,
                          business_category: e.target.value,
                        }))
                      }
                      className={inputClass}
                      required
                    >
                      {businessCategories.length === 0 && (
                        <option value="business">{t("businessCategory")}</option>
                      )}
                      {businessCategories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field id="name" label={t("storeName")} required>
                    <input
                      id="name"
                      name="name"
                      placeholder={t("storeName")}
                      onChange={handleInputChange}
                      className={inputClass}
                      required
                    />
                  </Field>

                  <Field id="phone" label={t("phone")}>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="phone"
                        name="phone"
                        placeholder={t("phone")}
                        onChange={handleInputChange}
                        className={iconInputClass}
                      />
                    </div>
                  </Field>

                  <Field id="address" label={t("address")}>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="address"
                        name="address"
                        placeholder={t("address")}
                        onChange={handleInputChange}
                        className={iconInputClass}
                      />
                    </div>
                  </Field>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center transition hover:border-blue-400 hover:bg-blue-50/50">
                      <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                        required
                      />
                      {logoPreview ? (
                        <Image
                          src={logoPreview}
                          alt=""
                          width={40}
                          height={40}
                          unoptimized
                          className="mb-2 h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <ImageUp className="mb-2 h-5 w-5 text-slate-400" />
                      )}
                      <span className="text-xs font-semibold text-slate-700">{t("uploadLogo")}</span>
                      <span className="mt-1 max-w-full truncate text-[11px] text-slate-500">
                        {signupData.logo ? signupData.logo.name : t("chooseImage")}
                      </span>
                    </label>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center transition hover:border-blue-400 hover:bg-blue-50/50">
                      <input
                        type="file"
                        name="store_license"
                        onChange={handleFileChange}
                        className="sr-only"
                        required
                      />
                      {signupData.store_license ? (
                        <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-600" />
                      ) : (
                        <FileUp className="mb-2 h-5 w-5 text-slate-400" />
                      )}
                      <span className="text-xs font-semibold text-slate-700">{t("uploadLicense")}</span>
                      <span className="mt-1 max-w-full truncate text-[11px] text-slate-500">
                        {signupData.store_license
                          ? signupData.store_license.name
                          : t("chooseLicenseFile")}
                      </span>
                    </label>
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                aria-label={t("register")}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("signingUp")}
                  </>
                ) : (
                  t("signup")
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignupScreenPage() {
  return (
    <Suspense fallback={<SignupSkeleton />}>
      <SignupScreen />
    </Suspense>
  );
}
