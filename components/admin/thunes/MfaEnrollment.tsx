"use client";

import React, { useEffect, useState } from "react";
import { adminUi } from "@/lib/adminUi";
import { confirmMfaSetup, fetchMfaStatus, startMfaSetup } from "@/services/platformAdminApi";
import { apiDetail, MfaField, StatusLine, type Translate } from "./shared";

/** Thunes changes need a TOTP code; offer enrollment in place when the admin has none. */
export default function MfaEnrollment({ t }: { t: Translate }) {
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<{ secret: string; otpauth_uri: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMfaStatus()
      .then((status) => setEnrolled(status.enrolled))
      .catch(() => setEnrolled(null));
  }, []);

  if (enrolled !== false) return null;

  async function begin() {
    setError(null);
    try {
      setSetup(await startMfaSetup());
    } catch (err) {
      setError(apiDetail(err, t("mfaSetupFailed", "Authenticator setup could not start.")));
    }
  }

  async function confirm() {
    setError(null);
    try {
      const result = await confirmMfaSetup(code);
      if (result.enabled) {
        setEnrolled(true);
        setSetup(null);
      }
    } catch (err) {
      setError(apiDetail(err, t("mfaConfirmFailed", "That code did not match. Try the current code.")));
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">{t("mfaRequiredTitle", "Set up an authenticator app")}</p>
      <p className="mt-1">
        {t(
          "mfaRequiredThunes",
          "Changing Thunes credentials and switches requires a code from an authenticator app. You will also be asked for it when you sign in.",
        )}
      </p>
      <StatusLine error={error} notice={null} />
      {setup ? (
        <div className="mt-3 space-y-2">
          <p>{t("mfaAddKey", "Add this key to your authenticator app, then enter the 6-digit code it shows.")}</p>
          <code className="block break-all rounded-lg bg-white px-3 py-2 font-mono text-slate-900">{setup.secret}</code>
          <MfaField value={code} onChange={setCode} t={t} />
          <button type="button" className={adminUi.btnAccent} disabled={code.length !== 6} onClick={() => void confirm()}>
            {t("confirm", "Confirm")}
          </button>
        </div>
      ) : (
        <button type="button" className={adminUi.btnAccent + " mt-3"} onClick={() => void begin()}>
          {t("mfaStart", "Set up authenticator")}
        </button>
      )}
    </div>
  );
}
