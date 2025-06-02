"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { baseAPI } from "@/services/types";
import { t } from "@/configs/i18n";

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const uid = searchParams.get("uid");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token || !uid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded shadow-lg text-center text-red-600">
          {t("invalidResetLink")}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordsDontMatch"));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${baseAPI}/conta/reset-password-confirm/${uid}/${token}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || t("resetFailed"));
      }
    } catch (error) {
      setError(t("resetFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
        <h2 className="text-2xl mb-6 text-center font-bold text-blue-700">{t("resetPassword")}</h2>
        {success ? (
          <div>
            <p className="mb-6 text-center text-green-600">{t("passwordResetSuccess")}</p>
            <button
              onClick={() => router.push("/LoginScreenUser")}
              className="w-full py-3 px-4 bg-blue-700 text-white rounded font-semibold hover:bg-blue-800"
            >
              {t("login")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="mb-4 text-red-600 text-center">{error}</p>}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">{t("newPassword")}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
                placeholder={t("enterNewPassword")}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">{t("confirmNewPassword")}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
                placeholder={t("confirmNewPassword")}
                required
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-700 text-white rounded font-semibold hover:bg-blue-800"
              disabled={loading}
            >
              {loading ? t("resetting") : t("resetPassword")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
