"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";
import dynamic from "next/dynamic";
import { Transition } from "@headlessui/react";
import { fetchFornecedorData, updateLocation } from "@/services/apiService";
import { FornecedorType } from "@/services/types";
import { MdMenu } from "react-icons/md";
import withAuth from "@/components/ProtectedPage";

// Dynamically import Sidebar to reduce initial bundle size
const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const StoreDashboard: React.FC = () => {
  const user = useSelector(selectUser);
  const [fornecedor, setFornecedor] = useState<FornecedorType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.user_id) {
        try {
          setLoading(true);
          const data = await fetchFornecedorData(user.user_id);
          setFornecedor(data);
        } catch (error) {
          setError("Ocorreu um erro ao buscar os dados");
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
    </div>
  );
};

export default withAuth(StoreDashboard);
