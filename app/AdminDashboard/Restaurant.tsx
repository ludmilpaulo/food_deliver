import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";

import { storeType } from "@/services/types";
import storeCard from "./store/storeCard";
import { Transition } from '@headlessui/react';
import useLoadScript from "./store//useLoadScript";
import { getstores, activatestore, updatestore, deactivatestore, deletestore } from "@/services/managerService";

declare global {
  interface Window {
    initMap: (store: storeType) => void;
  }
}

const store: React.FC = () => {
  const user = useSelector(selectUser);
  const [stores, setstores] = useState<storeType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("storees");
  const [editData, setEditData] = useState<Partial<storeType> | null>(null);
  const [selectedstore, setSelectedstore] = useState<storeType | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);

  useLoadScript(
    `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&callback=initMap`,
    () => {
      window.initMap = (store: storeType) => {
        const [latitude, longitude] = store.location.split(',').map(Number);
        const mapElement = document.getElementById('map');
        if (mapElement) {
          const map = new google.maps.Map(mapElement, {
            center: { lat: latitude, lng: longitude },
            zoom: 15
          });
          new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map,
            title: store.name
          });
        } else {
          console.error('Map element not found');
        }
      };
    }
  );

  useEffect(() => {
    const fetchstores = async () => {
      setLoading(true);
      try {
        const data = await getstores();
        setstores(data);
      } catch (error) {
        console.error("Error fetching stores data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchstores();
  }, [user]);

  const handleActivate = async (id: number) => {
    setLoading(true);
    try {
      await activatestore(id);
      setstores((prev) =>
        prev.map((store) =>
          store.id === id ? { ...store, is_approved: true } : store
        )
      );
    } catch (error) {
      console.error("Error activating store", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    setLoading(true);
    try {
      await deactivatestore(id);
      setstores((prev) =>
        prev.map((store) =>
          store.id === id ? { ...store, is_approved: false } : store
        )
      );
    } catch (error) {
      console.error("Error deactivating store", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (store: storeType) => {
    setEditData(store);
  };

  const handleUpdate = async () => {
    if (editData && editData.id) {
      setLoading(true);
      try {
        const updatedstore = await updatestore(editData.id, editData);
        setstores((prev) =>
          prev.map((store) =>
            store.id === editData.id ? updatedstore : store
          )
        );
        setEditData(null);
      } catch (error) {
        console.error("Error updating store", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await deletestore(id);
      setstores((prev) => prev.filter((store) => store.id !== id));
    } catch (error) {
      console.error("Error deleting store", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowMap = (store: storeType) => {
    setSelectedstore(store);
    setShowMap(true);
  };

  useEffect(() => {
    if (showMap && selectedstore) {
      window.initMap(selectedstore);
    }
  }, [showMap, selectedstore]);

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-around border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === "storees" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          onClick={() => setActiveTab("storees")}
        >
          storees
        </button>
        <button
          className={`py-2 px-4 ${activeTab === "pagamentos" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          onClick={() => setActiveTab("pagamentos")}
        >
          Pagamentos
        </button>
        <button
          className={`py-2 px-4 ${activeTab === "localizacao" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          onClick={() => setActiveTab("localizacao")}
        >
          Localização
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
            <storeCard
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
                Mostrar no mapa
              </button>
            </div>
          ))}
          {showMap && selectedstore && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Localização de {selectedstore.name}</h2>
                <div id="map" style={{ height: '400px' }}></div>
                <button
                  className="py-2 px-4 bg-gray-500 text-white mt-4 rounded-lg"
                  onClick={() => setShowMap(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar storee</h2>
            <input
              type="text"
              placeholder="Nome"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="mb-4 w-full p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Endereço"
              value={editData.address}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              className="mb-4 w-full p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Telefone"
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              className="mb-4 w-full p-2 border border-gray-300 rounded-lg"
            />
            <div className="flex justify-end">
              <button
                className="py-2 px-4 bg-gray-500 text-white mr-2 rounded-lg"
                onClick={() => setEditData(null)}
              >
                Cancelar
              </button>
              <button
                className="py-2 px-4 bg-blue-500 text-white rounded-lg"
                onClick={handleUpdate}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add content for other tabs */}
    </div>
  );
};

export default store;
