"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { loginUser } from "@/redux/slices/authSlice";
import { Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/assets/azul.png";
import { signup } from "@/services/authService";
import { t, setLanguageFromBrowser, setLanguage, getLanguage } from "@/configs/i18n";
import { SupportedLocale } from "@/configs/translations";
import { useAppDispatch } from "@/redux/store";
import { analytics } from "@/utils/mixpanel"; 
// LANGUAGE SELECT SUPPORT
const LANGUAGES: { value: SupportedLocale; label: string }[] = [
  { value: "en", label: "🇬🇧 English" },
  { value: "pt", label: "🇵🇹 Português" },
];

const SignupScreen = () => {
  const router = useRouter();

  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    logo: null as File | null,
    store_license: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [licencaLoading, setLicencaLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"client" | "store">("client");
  const [lang, setLang] = useState<SupportedLocale>(getLanguage());

  const dispatch = useAppDispatch();

  // Language setup
  React.useEffect(() => {
    setLanguageFromBrowser();
    setLang(getLanguage());
    analytics.trackPageView('Signup Page');
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLocale);
    setLang(getLanguage());
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRole(e.target.value as "client" | "store");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files) {
      if (name === "logo") {
        setLogoLoading(true);
        setTimeout(() => {
          setSignupData((prevState) => ({ ...prevState, [name]: files[0] }));
          setLogoLoading(false);
        }, 2000);
      } else if (name === "store_license") {
        setLicencaLoading(true);
        setTimeout(() => {
          setSignupData((prevState) => ({ ...prevState, [name]: files[0] }));
          setLicencaLoading(false);
        }, 2000);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call your signup service
      const { status, data } = await signup(role, signupData);

      if (status === 201 || data.status === "201" || data.status === "success") {
        // If your backend returns login token after signup:
        // You may need to adjust payload if backend is different.
        const loginResult = await dispatch(loginUser({ username: signupData.username, password: signupData.password })).unwrap();

        analytics.trackSignup(loginResult.user_id?.toString() || signupData.username, {
          name: signupData.name,
          email: signupData.email,
          user_type: role,
          platform: 'web'
        });

        alert(t("registerSuccess"));
        router.push(role === "store" ? "/StoreDashboad" : "/HomeScreen");
      } else {
        handleErrorResponse(status, data);
      }
    } catch (err) {
      analytics.trackError('Signup Failed', { role, error: err?.toString() });
      alert(t("registerFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleErrorResponse = (status: number, data: any) => {
    switch (status) {
      case 400:
        alert(data.message || t("fillAllFields"));
        break;
      case 401:
        alert(data.message || "Not authorized.");
        break;
      case 404:
        alert(data.message || "Not found.");
        break;
      case 200:
        alert(data.message || t("registerSuccess"));
        break;
      default:
        alert(data.message || t("registerFailed"));
    }
  };

  const togglePasswordVisibility = () => setShowPassword((s) => !s);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 via-blue-100 to-blue-200">
      <div className="relative w-full max-w-lg p-6 bg-white rounded-2xl shadow-2xl lg:w-1/3 border">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-yellow-400 to-blue-600 rounded-md filter blur-3xl opacity-50 -z-20" />
        <motion.div
          animate={{ scale: [1, 1.04, 1], rotate: [0, 3, 0] }}
          className="w-full p-8 bg-white rounded shadow"
        >
          <div className="flex justify-between items-center mb-6">
            <Image src={logo} alt="Logo" width={64} height={64} className="rounded-full" />
            <select
              className="ml-2 p-1 rounded bg-white/80 border border-gray-300 text-gray-800 font-semibold text-sm shadow"
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
          </div>
          <h1 className="text-2xl font-extrabold text-center text-gray-800 mb-2">
            {t("signup")}
          </h1>
          <p className="mb-6 text-sm font-medium text-center text-gray-500">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/LoginScreenUser">
              <span className="text-blue-700 font-semibold underline">{t("login")}</span>
            </Link>
          </p>
          <div className="my-4 text-center flex justify-center gap-8">
            <label className="font-medium">
              <input
                type="radio"
                name="role"
                value="client"
                checked={role === "client"}
                onChange={handleRoleChange}
                className="mr-1 accent-blue-600"
              />
              {t("client")}
            </label>
            <label className="font-medium">
              <input
                type="radio"
                name="role"
                value="store"
                checked={role === "store"}
                onChange={handleRoleChange}
                className="mr-1 accent-blue-600"
              />
              {t("store")}
            </label>
          </div>
          <Transition
            show={loading}
            as="div"
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {loading && (
              <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-gray-900 bg-opacity-40">
                <div className="w-16 h-16 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
          </Transition>
          {!loading && (
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input
                name="username"
                placeholder={t("username")}
                onChange={handleInputChange}
                className="p-3 border rounded"
                autoComplete="username"
                required
              />
              <input
                type="email"
                name="email"
                placeholder={t("email")}
                onChange={handleInputChange}
                className="p-3 border rounded"
                autoComplete="email"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={t("password")}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center justify-center h-full px-3"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {role === "store" && (
                <>
                  <input
                    name="name"
                    placeholder={t("storeName")}
                    onChange={handleInputChange}
                    className="p-3 border rounded"
                    required
                  />
                  <input
                    name="phone"
                    placeholder={t("phone")}
                    onChange={handleInputChange}
                    className="p-3 border rounded"
                  />
                  <input
                    name="address"
                    placeholder={t("address")}
                    onChange={handleInputChange}
                    className="p-3 border rounded"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      name="logo"
                      onChange={handleFileChange}
                      className="absolute w-full h-full p-3 border rounded opacity-0 cursor-pointer"
                      required
                    />
                    <div className="p-3 border rounded cursor-pointer bg-gray-50 text-gray-600 text-center">
                      {logoLoading ? (
                        <span className="w-5 h-5 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></span>
                      ) : (
                        t("uploadLogo")
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      name="store_license"
                      onChange={handleFileChange}
                      className="absolute w-full h-full p-3 border rounded opacity-0 cursor-pointer"
                      required
                    />
                    <div className="p-3 border rounded cursor-pointer bg-gray-50 text-gray-600 text-center">
                      {licencaLoading ? (
                        <span className="w-5 h-5 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></span>
                      ) : (
                        t("uploadLicense")
                      )}
                    </div>
                  </div>
                </>
              )}
              <button
                type="submit"
                aria-label={t("register")}
                className="w-full py-4 text-base font-bold text-white bg-gradient-to-r from-blue-700 to-yellow-500 rounded hover:from-blue-800 hover:to-yellow-600 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 transition"
              >
                {t("signup")}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SignupScreen;
