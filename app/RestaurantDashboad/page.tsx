"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";
import dynamic from "next/dynamic";
import { Transition } from "@headlessui/react";
import { fetchFornecedorData, updateLocation } from "@/services/apiService";
import { FornecedorType } from "@/services/types";
import { MdMenu } from "react-icons/md";
import { HelpCircle } from "lucide-react";
import withAuth from "@/components/ProtectedPage";
import HelpGuideModal from "@/components/HelpGuideModal";
import { useTranslation } from "@/hooks/useTranslation";

const StoreDashboard: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const [fornecedor, setFornecedor] = useState<FornecedorType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const Sidebar = dynamic(() => import("./Sidebar"), {
    ssr: false,
    loading: () => <p>{t("loading")}</p>,
  });

  const helpSections = [
    {
      title: t("dashHelpUseTitle", "How to use the Dashboard"),
      content: t(
        "dashHelpUseContent",
        "The restaurant dashboard lets you manage orders, products, and profile settings.",
      ),
      steps: [
        t("dashHelpUseStep1", "Use the side menu to access different sections."),
        t("dashHelpUseStep2", "View pending orders on the main page."),
        t("dashHelpUseStep3", "Update order statuses as they progress."),
        t("dashHelpUseStep4", "Manage products and opening hours."),
      ],
    },
    {
      title: t("dashHelpOrdersTitle", "Order Management"),
      content: t("dashHelpOrdersContent", "Track and manage all your orders in real time."),
      steps: [
        t("dashHelpOrdersStep1", "Accept or reject new orders."),
        t("dashHelpOrdersStep2", "Update order status (preparing, ready, delivered)."),
        t("dashHelpOrdersStep3", "View full order details and customer information."),
        t("dashHelpOrdersStep4", "Contact drivers when needed."),
      ],
    },
    {
      title: t("dashHelpProductsTitle", "Add Products"),
      content: t("dashHelpProductsContent", "Add and manage your restaurant products."),
      steps: [
        t("dashHelpProductsStep1", 'Click "Products" in the menu.'),
        t("dashHelpProductsStep2", "Add photos, descriptions, and prices."),
        t("dashHelpProductsStep3", "Set categories for your products."),
        t("dashHelpProductsStep4", "Enable or disable products based on availability."),
      ],
    },
    {
      title: t("dashHelpHoursTitle", "Set Opening Hours"),
      content: t("dashHelpHoursContent", "Define your operating schedule."),
      steps: [
        t("dashHelpHoursStep1", 'Open "Profile" in the menu.'),
        t("dashHelpHoursStep2", "Configure hours for each day of the week."),
        t("dashHelpHoursStep3", "Mark closed days or holidays."),
      ],
    },
    {
      title: t("dashHelpReportsTitle", "Reports and Analytics"),
      content: t("dashHelpReportsContent", "View detailed reports about your business."),
      steps: [
        t("dashHelpReportsStep1", 'Open "Reports" in the menu.'),
        t("dashHelpReportsStep2", "View sales by period."),
        t("dashHelpReportsStep3", "Analyze best-selling products."),
        t("dashHelpReportsStep4", "Export reports for deeper analysis."),
      ],
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (user?.user_id) {
        try {
          setLoading(true);
          const data = await fetchFornecedorData(user.user_id);
          setFornecedor(data);
        } catch (error) {
          setError(t("errorFetchingData", "An error occurred while fetching data"));
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const updateLocationWithRetry = async (userId: number, location: string, retries: number = 3) => {
    try {
      const response = await updateLocation(userId, location);
      console.log("Location update response:", response);
    } catch (error) {
      console.error("Error updating location:", error);
      if (retries > 0) {
        setTimeout(() => {
          updateLocationWithRetry(userId, location, retries - 1);
        }, 100000);
      } else {
        console.error("Failed to update location after multiple attempts");
      }
    }
  };

  useEffect(() => {
    const updateLocationPeriodically = () => {
      if (user?.user_id) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const location = `${latitude},${longitude}`;
            console.log("Updating location to:", location);
            await updateLocationWithRetry(user.user_id, location);
          },
          (error) => {
            console.error("Error fetching location:", error);
          },
          { enableHighAccuracy: true }
        );
      }
    };

    const intervalId = setInterval(updateLocationPeriodically, 5000); // Update every 5 seconds for testing
    return () => clearInterval(intervalId);
  }, [user]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Transition>
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          <div className="absolute top-4 right-4 z-40">
            <button
              onClick={() => setShowHelp(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
              title={t("help", "Help")}
            >
              <HelpCircle size={24} />
            </button>
          </div>
          <div className="absolute top-0 left-0 md:hidden">
            <button
              onClick={handleSidebarToggle}
              className="text-2xl text-blue-500 p-2"
            >
              <MdMenu />
            </button>
          </div>
          <Sidebar fornecedor={fornecedor} isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
        </>
      )}
      <HelpGuideModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        sections={helpSections}
        title={t("dashboardGuide", "Dashboard Guide")}
      />
    </div>
  );
};

export default withAuth(StoreDashboard);
