"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DownloadInvoice from "./DownloadInvoice";
import OrderHistory from "./OrderHistory";
import UpdateProfile from "./UpdateProfile";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";
import Bookings from "./Bookings";
import { useTranslation } from "@/hooks/useTranslation";
import withAuth from "@/components/ProtectedPage";
import { useAppDispatch } from "@/redux/store";
import { logoutUser } from "@/redux/slices/authSlice";
import api from "@/services/api";

const TrackOrders = dynamic(() => import("./TrackOrders"), { ssr: false });
const TrackDelivery = dynamic(() => import("./TrackDelivery"), { ssr: false });

const UserDashboard: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [selectedMenu, setSelectedMenu] = useState<string>("trackOrders");
  const [deactivateModal, setDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const handleConfirmDeactivate = async () => {
    setDeactivating(true);
    try {
      await api.post("/api/auth/deactivate/");
      dispatch(logoutUser());
      setDeactivateModal(false);
      router.replace("/LoginScreenUser");
    } catch {
      alert(t("deactivateFailed", "Could not deactivate your account. Please try again or contact support."));
    } finally {
      setDeactivating(false);
    }
  };

  const renderComponent = () => {
    switch (selectedMenu) {
      case "trackOrders":
        return <TrackOrders />;
      case "trackDelivery":
        return <TrackDelivery />;
      case "serviceBookings":
        return <Bookings />;
      case "updateProfile":
        return <UpdateProfile />;
      case "orderHistory":
        return <OrderHistory />;
      case "downloadInvoice":
        return <DownloadInvoice />;
      default:
        return <TrackOrders />;
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-blue-100 via-yellow-100 to-white min-h-screen">
      <Sidebar
        selectedMenu={selectedMenu}
        setSelectedMenu={setSelectedMenu}
        onDeactivate={() => setDeactivateModal(true)}
      />
      <main className="flex-1 py-10 px-4 sm:px-10 md:px-16 transition-all min-h-screen bg-gradient-to-b from-yellow-50 via-blue-50/20 to-white/70 shadow-inner rounded-l-3xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-8 text-center drop-shadow-lg">
            {t("welcomeDashboard", "Welcome to your Dashboard")}
          </h1>
          <div className="bg-white/80 shadow-xl rounded-3xl p-6 min-h-[420px]">
            {renderComponent()}
          </div>
        </div>
      </main>

      {deactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              {t("deactivateAccountTitle", "Deactivate Account")}
            </h2>
            <p className="mb-6 text-gray-700">
              {t(
                "deactivateAccountConfirm",
                "Are you sure you want to deactivate your account? This action cannot be undone.",
              )}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow disabled:opacity-50"
                onClick={handleConfirmDeactivate}
                disabled={deactivating}
              >
                {deactivating ? t("loading") : t("yesDeactivate", "Yes, Deactivate")}
              </button>
              <button
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold"
                onClick={() => setDeactivateModal(false)}
                disabled={deactivating}
              >
                {t("cancel", "Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(UserDashboard);
