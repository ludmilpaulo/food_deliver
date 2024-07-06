import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";

import { RestaurantType } from "@/services/types";
import RestaurantCard from "./restaurant/RestaurantCard";
import { Transition } from '@headlessui/react';
import useLoadScript from "./restaurant//useLoadScript";
import { getRestaurants, activateRestaurant, updateRestaurant, deactivateRestaurant, deleteRestaurant } from "@/services/managerService";

declare global {
  interface Window {
    initMap: (restaurant: RestaurantType) => void;
  }
}

const Restaurant: React.FC = () => {
  const user = useSelector(selectUser);
  const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("restaurantes");
  const [editData, setEditData] = useState<Partial<RestaurantType> | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantType | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);

  useLoadScript(
    `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&callback=initMap`,
    () => {
      window.initMap = (restaurant: RestaurantType) => {
        const [latitude, longitude] = restaurant.location.split(',').map(Number);
        const mapElement = document.getElementById('map');
        if (mapElement) {
          const map = new google.maps.Map(mapElement, {
            center: { lat: latitude, lng: longitude },
            zoom: 15
          });
          new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: map,
            title: restaurant.name
          });
        } else {
          console.error('Map element not found');
        }
      };
    }
  );

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const data = await getRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error("Error fetching restaurants data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [user]);

  const handleActivate = async (id: number) => {
    setLoading(true);
    try {
      await activateRestaurant(id);
      setRestaurants((prev) =>
        prev.map((restaurant) =>
          restaurant.id === id ? { ...restaurant, is_approved: true } : restaurant
        )
      );
    } catch (error) {
      console.error("Error activating restaurant", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    setLoading(true);
    try {
      await deactivateRestaurant(id);
      setRestaurants((prev) =>
        prev.map((restaurant) =>
          restaurant.id === id ? { ...restaurant, is_approved: false } : restaurant
        )
      );
    } catch (error) {
      console.error("Error deactivating restaurant", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (restaurant: RestaurantType) => {
    setEditData(restaurant);
  };

  const handleUpdate = async () => {
    if (editData && editData.id) {
      setLoading(true);
      try {
        const updatedRestaurant = await updateRestaurant(editData.id, editData);
        setRestaurants((prev) =>
          prev.map((restaurant) =>
            restaurant.id === editData.id ? updatedRestaurant : restaurant
          )
        );
        setEditData(null);
      } catch (error) {
        console.error("Error updating restaurant", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await deleteRestaurant(id);
      setRestaurants((prev) => prev.filter((restaurant) => restaurant.id !== id));
    } catch (error) {
      console.error("Error deleting restaurant", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowMap = (restaurant: RestaurantType) => {
    setSelectedRestaurant(restaurant);
    setShowMap(true);
  };

  useEffect(() => {
    if (showMap && selectedRestaurant) {
      window.initMap(selectedRestaurant);
    }
  }, [showMap, selectedRestaurant]);

  return (
    <div className="relative p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-around border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === "restaurantes" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          onClick={() => setActiveTab("restaurantes")}
        >
          Restaurantes
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
      {activeTab === "restaurantes" && (
        <div>
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
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
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="mb-4 p-4 border rounded-lg">
              <h2 className="text-xl font-bold">{restaurant.name}</h2>
              <p>{restaurant.address}</p>
              <button
                className="py-2 px-4 bg-blue-500 text-white rounded-lg mt-2"
                onClick={() => handleShowMap(restaurant)}
              >
                Mostrar no mapa
              </button>
            </div>
          ))}
          {showMap && selectedRestaurant && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Localização de {selectedRestaurant.name}</h2>
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
            <h2 className="text-xl font-bold mb-4">Editar Restaurante</h2>
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

export default Restaurant;
