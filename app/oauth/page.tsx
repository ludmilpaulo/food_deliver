"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch } from "@/redux/store";
import { setAuthFromSocial } from "@/redux/slices/authSlice";
import { resolvePostLoginRoute } from "@/utils/postLoginRoute";
import {
  completeTikTokWebCallback,
  consumeOauthNextPath,
} from "@/services/socialAuth";

export default function OAuthCallbackPage() {
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = consumeOauthNextPath();
    void completeTikTokWebCallback({
      code: params.get("code"),
      state: params.get("state"),
      error: params.get("error"),
    })
      .then((result) => {
        dispatch(setAuthFromSocial(result));
        window.location.assign(resolvePostLoginRoute(result, next));
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "";
        if (message === "cancelled") {
          window.location.assign("/LoginScreenUser");
          return;
        }
        setError("We couldn't finish social sign-in. Please try again.");
      });
  }, [dispatch]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
        <p className="text-center text-sm text-rose-700">{error}</p>
        <Link href="/LoginScreenUser" className="mt-4 font-semibold text-blue-700 underline">
          Back to sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-600">Completing sign-in…</p>
    </main>
  );
}
