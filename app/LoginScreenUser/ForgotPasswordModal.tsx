"use client";
import React, { useState, useEffect, useRef } from "react";
import { baseAPI } from "@/services/types";
import { t } from "@/configs/i18n";

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ show, onClose }) => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open, ESC closes
  useEffect(() => {
    if (show) {
      setTimeout(() => inputRef.current?.focus(), 150);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
    // Reset state on close
    setEmail("");
    setEmailSent(false);
    setLoading(false);
  }, [show, onClose]);

  const handleResetPassword = async () => {
    if (!email) {
      alert(t("enterEmail"));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${baseAPI}/conta/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
      } else {
        alert(data.message || t("resetFailed"));
      }
    } catch (error) {
      alert(t("resetFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      aria-modal="true"
      tabIndex={-1}
    >
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm relative">
        {emailSent ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-blue-700">{t("emailSent")}</h2>
            <p className="mb-6 text-gray-700">{t("emailSentInstruction")}</p>
            <button
              onClick={onClose}
              className="w-full py-3 font-semibold rounded bg-blue-700 text-white hover:bg-blue-800 transition"
              autoFocus
            >
              {t("close")}
            </button>
          </>
        ) : (
          <form
            onSubmit={e => {
              e.preventDefault();
              handleResetPassword();
            }}
          >
            <h2 className="text-xl font-bold mb-4 text-blue-700">{t("resetPassword")}</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("email")}</label>
            <input
              type="email"
              value={email}
              ref={inputRef}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 mb-5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
              placeholder={t("enterEmail")}
              autoComplete="email"
              required
              disabled={loading}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-3 rounded font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                disabled={loading}
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 rounded font-semibold bg-blue-700 text-white hover:bg-blue-800 transition flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <span className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin inline-block"></span>
                ) : (
                  t("send")
                )}
              </button>
            </div>
          </form>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-blue-700 text-2xl"
          aria-label={t("close")}
          tabIndex={0}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
