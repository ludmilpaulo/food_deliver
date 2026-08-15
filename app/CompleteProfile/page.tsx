"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { selectAuth } from "@/redux/slices/authSlice";
import { baseAPI } from "@/services/types";
import { useTranslation } from "@/hooks/useTranslation";

function CompleteProfileInner() {
  const { t, languageCode } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAppSelector(selectAuth);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const nextPath = searchParams.get("next");
  const destination =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/HomeScreen";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim() || !phone.trim()) {
      setError(t("fillAllFields", "Please fill in all required fields."));
      return;
    }
    if (!token) {
      router.replace("/LoginScreenUser");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${baseAPI}/api/auth/me/`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          preferred_language: languageCode,
        }),
      });
      if (!response.ok) {
        throw new Error("failed");
      }
      window.location.assign(destination);
    } catch {
      setError(t("networkError", "Network error, please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-100 to-blue-200 px-4 py-12">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl space-y-4"
      >
        <h1 className="text-xl font-bold text-gray-800">
          {t("completeProfileTitle", "Complete your profile")}
        </h1>
        <p className="text-sm text-gray-500">
          {t(
            "completeProfileHint",
            "Add a name and phone so we can finish setting up your Kudya account.",
          )}
        </p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={t("name", "Name")}
          className="w-full p-3 border rounded"
          autoComplete="given-name"
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder={t("lastName", "Last name")}
          className="w-full p-3 border rounded"
          autoComplete="family-name"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("phone", "Phone")}
          className="w-full p-3 border rounded"
          autoComplete="tel"
          inputMode="tel"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 font-semibold text-white bg-gradient-to-r from-blue-700 to-yellow-500 rounded disabled:opacity-60"
        >
          {saving
            ? t("loading", "Loading...")
            : t("completeProfileContinue", "Continue")}
        </button>
      </form>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-100 to-blue-200">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CompleteProfileInner />
    </Suspense>
  );
}
