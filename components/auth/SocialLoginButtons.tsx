"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { LoginResult } from "@/redux/slices/authSlice";
import {
  isSocialLoginConfigured,
  signInWithFacebookWeb,
  signInWithGoogleWeb,
  startTikTokWebLogin,
  type SocialProvider,
} from "@/services/socialAuth";

type Props = {
  onSuccess: (result: LoginResult) => void;
  disabled?: boolean;
};

const PROVIDERS: { id: SocialProvider; labelKey: string; loadingKey: string }[] = [
  { id: "google", labelKey: "continueGoogle", loadingKey: "loadingGoogle" },
  { id: "facebook", labelKey: "continueFacebook", loadingKey: "loadingFacebook" },
  { id: "tiktok", labelKey: "continueTiktok", loadingKey: "loadingTiktok" },
];

function friendlyError(provider: SocialProvider, t: (key: string, fallback?: string) => string, err: unknown): string {
  const message = err instanceof Error ? err.message : "";
  if (message === "cancelled") return "";
  if (message === "network") return t("networkError", "Network error, please try again.");
  if (provider === "google") {
    return t("googleSignInFailed", "We couldn't sign you in with Google. Please try again.");
  }
  if (provider === "facebook") {
    return t("facebookSignInFailed", "We couldn't sign you in with Facebook. Please try again.");
  }
  return t("tiktokSignInFailed", "We couldn't sign you in with TikTok. Please try again.");
}

export default function SocialLoginButtons({ onSuccess, disabled }: Props) {
  const { t } = useTranslation();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState("");

  const handlePress = async (provider: SocialProvider) => {
    if (!isSocialLoginConfigured(provider)) {
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
      await startTikTokWebLogin();
    } catch (err: unknown) {
      const text = friendlyError(provider, t, err);
      if (text) setError(text);
    } finally {
      setLoadingProvider(null);
    }
  };

  const anyConfigured = PROVIDERS.some((p) => isSocialLoginConfigured(p.id));

  return (
    <div className="mt-4 space-y-2">
      <p className="text-center text-sm text-gray-500">{t("orContinueWith", "Or continue with")}</p>
      {!anyConfigured ? (
        <p className="text-center text-xs text-gray-400">
          {t("socialLoginSetupHint", "Social login is not configured yet.")}
        </p>
      ) : null}
      {PROVIDERS.map((p) => {
        const configured = isSocialLoginConfigured(p.id);
        const busy = loadingProvider === p.id;
        const locked = Boolean(loadingProvider) || Boolean(disabled) || !configured;
        return (
          <button
            key={p.id}
            type="button"
            disabled={locked}
            onClick={() => void handlePress(p.id)}
            className={`w-full py-3 rounded border text-sm font-semibold ${
              configured
                ? "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
                : "bg-gray-50 border-gray-200 text-gray-400"
            } disabled:opacity-60`}
          >
            {busy ? t(p.loadingKey, "Loading...") : t(p.labelKey, p.labelKey)}
          </button>
        );
      })}
      {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
