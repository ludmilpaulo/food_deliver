"use client";
import React, { useState, useEffect, useRef } from "react";
import { Loader2, X } from "lucide-react";
import { baseAPI } from "@/services/types";
import { useTranslation } from "@/hooks/useTranslation";

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ show, onClose }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formError, setFormError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 150);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
    setEmail("");
    setEmailSent(false);
    setLoading(false);
    setFormError("");
  }, [show, onClose]);

  const handleResetPassword = async () => {
    if (!email) {
      setFormError(t("enterEmail"));
      return;
    }
    setFormError("");
    setLoading(true);
    try {
      const response = await fetch(`${baseAPI}/conta/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { message?: string };

      if (response.ok) {
        setEmailSent(true);
      } else {
        setFormError(data.message || t("resetFailed"));
      }
    } catch {
      setFormError(t("resetFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="forgot-password-title"
      tabIndex={-1}
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={t("close")}
          type="button"
        >
          <X size={18} />
        </button>

        {emailSent ? (
          <>
            <h2 id="forgot-password-title" className="pr-8 text-xl font-semibold text-slate-900">
              {t("emailSent")}
            </h2>
            <p className="mt-3 mb-6 text-sm leading-6 text-slate-600">{t("emailSentInstruction")}</p>
            <button
              onClick={onClose}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
              autoFocus
              type="button"
            >
              {t("close")}
            </button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleResetPassword();
            }}
          >
            <h2 id="forgot-password-title" className="pr-8 text-xl font-semibold text-slate-900">
              {t("resetPassword")}
            </h2>
            <label htmlFor="reset-email" className="mt-5 block text-sm font-medium text-slate-700">
              {t("email")}
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              ref={inputRef}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError("");
              }}
              className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
              placeholder={t("enterEmail")}
              autoComplete="email"
              required
              disabled={loading}
            />
            {formError ? (
              <p role="alert" className="mt-2 text-sm text-rose-600">
                {formError}
              </p>
            ) : null}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-12 w-1/2 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                disabled={loading}
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="flex h-12 w-1/2 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("send")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
