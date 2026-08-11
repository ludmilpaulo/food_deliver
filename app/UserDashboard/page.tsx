"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DownloadInvoice from "./DownloadInvoice";
import OrderHistory from "./OrderHistory";
import UpdateProfile from "./UpdateProfile";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";
import Bookings from "./Bookings";
import PropertyApplicationsPanel from "./PropertyApplicationsPanel";
import DocumentsVaultPanel from "./DocumentsVaultPanel";
import ActiveRentalsPanel from "./ActiveRentalsPanel";
import StayBookingsPanel from "./StayBookingsPanel";
import { useTranslation } from "@/hooks/useTranslation";
import withAuth from "@/components/ProtectedPage";
import { useAppDispatch } from "@/redux/store";
import { logoutUser } from "@/redux/slices/authSlice";
import api from "@/services/api";
import { readAuthToken } from "@/lib/authToken";
import type { PropertyServicesSummary } from "@/types/propertyApplication";
import { fetchPropertyServices } from "@/services/propertyApplicationApi";

const TrackOrders = dynamic(() => import("./TrackOrders"), { ssr: false });
const TrackDelivery = dynamic(() => import("./TrackDelivery"), { ssr: false });

const UserDashboard: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [selectedMenu, setSelectedMenu] = useState<string>(
    searchParams.get("menu") || "trackOrders",
  );
  const [deactivateModal, setDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [services, setServices] = useState<PropertyServicesSummary | null>(null);

  useEffect(() => {
    const menu = searchParams.get("menu");
    if (menu) setSelectedMenu(menu);
  }, [searchParams]);

  useEffect(() => {
    if (!readAuthToken()) return;
    let cancelled = false;
    fetchPropertyServices()
      .then((data) => {
        if (!cancelled) setServices(data);
      })
      .catch(() => {
        if (!cancelled) setServices(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConfirmDeactivate = async () => {
    setDeactivating(true);
    try {
      await api.post("/api/auth/deactivate/");
      dispatch(logoutUser());
      setDeactivateModal(false);
      router.replace("/LoginScreenUser");
    } catch {
      alert(
        t(
          "deactivateFailed",
          "Could not deactivate your account. Please try again or contact support.",
        ),
      );
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
      case "properties":
        return <PropertyApplicationsPanel />;
      case "documents":
        return <DocumentsVaultPanel />;
      case "activeRentals":
        return (
          <ActiveRentalsPanel
            rentals={services?.active_rentals}
            loading={services === null}
          />
        );
      case "upcomingStays":
        return <StayBookingsPanel />;
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
        services={services}
      />
      <main className="flex-1 py-10 px-4 sm:px-10 md:px-16 transition-all min-h-screen bg-gradient-to-b from-yellow-50 via-blue-50/20 to-white/70 shadow-inner rounded-l-3xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-8 text-center drop-shadow-lg">
            {t("myKudya", "My Kudya")}
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
