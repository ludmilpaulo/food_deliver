"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/redux/store";
import { setAuthFromSocial } from "@/redux/slices/authSlice";
import { completeTikTokWebCallback } from "@/services/socialAuth";
import { resolvePostLoginRoute } from "@/utils/postLoginRoute";
import { useTranslation } from "@/hooks/useTranslation";

function OAuthCallbackInner() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");

    let cancelled = false;
    (async () => {
      try {
        const result = await completeTikTokWebCallback({
          code,
          state,
          error: oauthError,
        });
        if (cancelled) return;
        dispatch(setAuthFromSocial(result));
        window.location.assign(resolvePostLoginRoute(result));
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "";
        if (message === "cancelled") {
          router.replace("/LoginScreenUser");
          return;
        }
        setStatus("error");
        setError(
          message === "network"
            ? t("networkError", "Network error, please try again.")
            : t("tiktokSignInFailed", "We couldn't sign you in with TikTok. Please try again."),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, router, searchParams, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-100 to-blue-200 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl text-center">
        {status === "working" ? (
          <>
            <div className="mx-auto mb-4 h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-700">{t("loadingTiktok", "Loading TikTok...")}</p>
          </>
        ) : (
          <>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              type="button"
              className="w-full py-3 font-semibold text-white bg-gradient-to-r from-blue-700 to-yellow-500 rounded"
              onClick={() => router.replace("/LoginScreenUser")}
            >
              {t("login", "Sign in")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-100 to-blue-200">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  );
}
