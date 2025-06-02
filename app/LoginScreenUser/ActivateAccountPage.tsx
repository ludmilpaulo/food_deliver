"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { baseAPI } from "@/services/types";
import { t } from "@/configs/i18n";

const ActivateAccountPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const uid = searchParams.get("uid");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const activateAccount = async () => {
      if (!token || !uid) {
        setMessage(t("invalidActivationLink"));
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${baseAPI}/conta/activate-account/${uid}/${token}/`, {
          method: "GET",
        });
        const data = await response.json();
        setMessage(
          response.ok
            ? t("accountActivatedSuccess")
            : data.message || t("activationFailed")
        );
      } catch (error) {
        setMessage(t("activationFailed"));
      } finally {
        setLoading(false);
      }
    };
    activateAccount();
  }, [token, uid]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
        <div className="text-center mb-6 text-blue-700 text-lg font-semibold">
          {loading ? t("activatingAccount") : message}
        </div>
        <button
          onClick={() => router.push("/LoginScreenUser")}
          className="w-full py-3 px-4 mt-6 bg-blue-700 text-white rounded font-semibold hover:bg-blue-800"
        >
          {t("backToLogin")}
        </button>
      </div>
    </div>
  );
};

export default ActivateAccountPage;
