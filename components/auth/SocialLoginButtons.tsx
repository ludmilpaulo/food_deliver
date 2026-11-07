"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FaFacebook, FaGoogle, FaTiktok } from "react-icons/fa";
import { useTranslation } from "@/hooks/useTranslation";
import type { LoginResult } from "@/redux/slices/authSlice";
import {
  getSocialPublicConfig,
  isSocialLoginConfigured,
  signInWithFacebookWeb,
  signInWithGoogleWeb,
  startTikTokWebLogin,
  type SocialProvider,
  type SocialPublicConfig,
} from "@/services/socialAuth";

type Props = {
  onSuccess: (result: LoginResult) => void;
  disabled?: boolean;
  heading?: string | null;
  className?: string;
  nextPath?: string | null;
};

const PROVIDERS: {
  id: SocialProvider;
  labelKey: string;
  loadingKey: string;
  icon: ReactNode;
}[] = [
  {
    id: "google",
    labelKey: "continueGoogle",
    loadingKey: "loadingGoogle",
    icon: <FaGoogle className="h-[18px] w-[18px] text-[#EA4335]" aria-hidden />,
  },
  {
    id: "facebook",
    labelKey: "continueFacebook",
    loadingKey: "loadingFacebook",
    icon: <FaFacebook className="h-[18px] w-[18px] text-[#1877F2]" aria-hidden />,
  },
  {
    id: "tiktok",
    labelKey: "continueTiktok",
    loadingKey: "loadingTiktok",
    icon: <FaTiktok className="h-[18px] w-[18px] text-slate-900" aria-hidden />,
  },
];

function friendlyError(
  provider: SocialProvider,
  t: (key: string, fallback?: string) => string,
  err: unknown,
): string {
  const message = err instanceof Error ? err.message : "";
  if (message === "cancelled") return "";
  if (message === "network") return t("networkError", "Network error, please try again.");
  if (message === "not_configured") {
    return t("socialLoginSetupHint", "Social login is not configured yet.");
  }
  if (message && message !== "failed") return message;
  if (provider === "google") {
    return t("googleSignInFailed", "We couldn't sign you in with Google. Please try again.");
  }
  if (provider === "facebook") {
    return t("facebookSignInFailed", "We couldn't sign you in with Facebook. Please try again.");
  }
  return t("tiktokSignInFailed", "We couldn't sign you in with TikTok. Please try again.");
}

export default function SocialLoginButtons({
  onSuccess,
  disabled,
  heading,
  className = "mt-4",
  nextPath,
}: Props) {
  const { t } = useTranslation();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<SocialPublicConfig | null>(null);

  useEffect(() => {
    void getSocialPublicConfig().then(setConfig);
  }, []);

  const handlePress = async (provider: SocialProvider) => {
    if (!isSocialLoginConfigured(provider, config)) {
      setError(t("socialLoginSetupHint", "Social login is not configured yet."));
      return;
    }
    setError("");
    setLoadingProvider(provider);
    try {
      if (provider === "google") {
        onSuccess(await signInWithGoogleWeb());
        return;
      }
      if (provider === "facebook") {
        onSuccess(await signInWithFacebookWeb());
        return;
      }
      await startTikTokWebLogin(nextPath);
    } catch (err: unknown) {
      const text = friendlyError(provider, t, err);
      if (text) setError(text);
    } finally {
      setLoadingProvider(null);
    }
  };

  const anyConfigured = PROVIDERS.some((p) => isSocialLoginConfigured(p.id, config));
  const headingText =
    heading === null ? null : heading ?? t("orContinueWith", "Or continue with");

  return (
    <div className={`${className} space-y-2.5`}>
      {headingText ? (
        <p className="text-center text-sm text-slate-500">{headingText}</p>
      ) : null}
      {!anyConfigured ? (
        <p className="text-center text-xs text-slate-400">
          {t("socialLoginSetupHint", "Social login is not configured yet.")}
        </p>
      ) : null}
      {PROVIDERS.map((p) => {
        const configured = isSocialLoginConfigured(p.id, config);
        const busy = loadingProvider === p.id;
        const locked = Boolean(loadingProvider) || Boolean(disabled) || !configured;
        return (
          <button
            key={p.id}
            type="button"
            disabled={locked}
            onClick={() => void handlePress(p.id)}
            className={`flex h-12 w-full items-center justify-center gap-3 rounded-xl border text-sm font-semibold shadow-sm transition ${
              configured
                ? "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
            } disabled:opacity-60`}
          >
            {p.icon}
            {busy ? t(p.loadingKey, "Loading...") : t(p.labelKey, p.labelKey)}
          </button>
        );
      })}
      {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
