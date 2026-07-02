import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";

import { Store as StoreType } from "@/services/types";
import StoreCard from "./store/StoreCard";
import { Transition } from '@headlessui/react';
import { useGoogleMapsScript } from "@/hooks/useGoogleMapsScript";
import { getstores, activatestore, updatestore, deactivatestore, deletestore } from "@/services/managerService";
import { useTranslation } from "@/hooks/useTranslation";

const Store: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("stores");
  const [editData, setEditData] = useState<Partial<StoreType> | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);

  const { ready: mapsReady } = useGoogleMapsScript({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    enabled: showMap,
  });

  const renderStoreMap = useCallback(
    (store: StoreType) => {
      if (!store.location) {
        alert(t("noLocationSetForStore", "No location set for this store."));
        return;
      }
      const [latitude, longitude] = store.location.split(",").map(Number);
      if (isNaN(latitude) || isNaN(longitude)) {
        alert(t("invalidLocationFormat", "Invalid location format."));
        return;
      }
      const mapElement = document.getElementById("map");
      if (!mapElement || !window.google?.maps) {
        console.error(t("mapElementNotFound", "Map element not found"));
        return;
      }
      const map = new window.google.maps.Map(mapElement, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
      });
      new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map,
        title: store.name,
      });
    },
    [t],
  );

   useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const data = await getstores();
        setStores(data);
      } catch (error) {
        console.error(t("errorFetchingStoresData", "Error fetching stores data"), error);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, [user]);

const handleActivate = async (id: number) => {
    setLoading(true);
    try {
      await activatestore(id);
      setStores(prev =>
        prev.map(store =>
          store.id === id ? { ...store, is_approved: true } : store
        )
      );
    } catch (error) {
      console.error(t("errorActivatingStore", "Error activating store"), error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    setLoading(true);
    try {
      await deactivatestore(id);
      setStores(prev =>
        prev.map(store =>
          store.id === id ? { ...store, is_approved: false } : store
        )
      );
    } catch (error) {
      console.error(t("errorDeactivatingStore", "Error deactivating store"), error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (store: StoreType) => {
    setEditData(store);
  };

  const handleUpdate = async () => {
    if (editData && editData.id) {
      setLoading(true);
      try {
        const updatedStore = await updatestore(editData.id, editData);
        setStores(prev =>
          prev.map(store =>
            store.id === editData.id ? updatedStore : store
          )
        );
        setEditData(null);
      } catch (error) {
      console.error(t("errorUpdatingStore", "Error updating store"), error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await deletestore(id);
      setStores(prev => prev.filter(store => store.id !== id));
    } catch (error) {
      console.error(t("errorDeletingStore", "Error deleting store"), error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowMap = (store: StoreType) => {
    setSelectedStore(store);
    setShowMap(true);
  };

  useEffect(() => {
    if (showMap && selectedStore && mapsReady) {
      renderStoreMap(selectedStore);
    }
  }, [showMap, selectedStore, mapsReady, renderStoreMap]);

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-around border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === "storees" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          onClick={() => setActiveTab("storees")}
        >
          {t("stores", "Stores")}
        </button>
        <button
          className={`py-2 px-4 ${activeTab === "pagamentos" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          onClick={() => setActiveTab("pagamentos")}
        >
          {t("payments", "Payments")}
        </button>
        <button
          className={`py-2 px-4 ${activeTab === "localizacao" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          onClick={() => setActiveTab("localizacao")}
        >
          {t("location", "Location")}
        </button>
      </div>
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
      {activeTab === "storees" && (
        <div>
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      {activeTab === "localizacao" && (
        <div>
          {stores.map((store) => (
            <div key={store.id} className="mb-4 p-4 border rounded-lg">
              <h2 className="text-xl font-bold">{store.name}</h2>
              <p>{store.address}</p>
              <button
                className="py-2 px-4 bg-blue-500 text-white rounded-lg mt-2"
                onClick={() => handleShowMap(store)}
              >
                {t("showOnMap", "Show on map")}
              </button>
            </div>
          ))}
          {showMap && selectedStore && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">
                  {t("locationOf", "Location of")} {selectedStore.name}
                </h2>
                <div id="map" style={{ height: '400px' }}></div>
                <button
                  className="py-2 px-4 bg-gray-500 text-white mt-4 rounded-lg"
                  onClick={() => setShowMap(false)}
                >
                  {t("close", "Close")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t("editStore", "Edit store")}</h2>
            <input
              type="text"
              placeholder={t("name", "Name")}
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="mb-4 w-full p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder={t("address", "Address")}
              value={editData.address}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              className="mb-4 w-full p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder={t("phone", "Phone")}
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              className="mb-4 w-full p-2 border border-gray-300 rounded-lg"
            />
            <div className="flex justify-end">
              <button
                className="py-2 px-4 bg-gray-500 text-white mr-2 rounded-lg"
                onClick={() => setEditData(null)}
              >
                {t("cancel", "Cancel")}
              </button>
              <button
                className="py-2 px-4 bg-blue-500 text-white rounded-lg"
                onClick={handleUpdate}
              >
                {t("save", "Save")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add content for other tabs */}
    </div>
  );
};

export default Store;
