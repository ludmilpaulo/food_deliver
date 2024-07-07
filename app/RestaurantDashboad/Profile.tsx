import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";
import { getRestaurant, getOpeningHours } from "@/services/apiService";
import { RestaurantType, OpeningHourType } from "@/services/types";

import OpeningHour from "./OpeningHour";
import OpeningHoursCalendar from "./OpeningHoursCalendar";
import RestaurantProfile from "./RestaurantProfile";

const Profile: React.FC = () => {
  const user = useSelector(selectUser);
  const [restaurant, setRestaurant] = useState<RestaurantType | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHourType[]>([]);
  const [activeTab, setActiveTab] = useState<string>("perfil");

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (user?.user_id) {
        try {
          const data = await getRestaurant(user.user_id);
          console.log("restaurant data==>", data)
          setRestaurant(data);
          const openingHoursData = await getOpeningHours(data.id);
          setOpeningHours(openingHoursData);
        } catch (error) {
          console.error("Error fetching restaurant data", error);
        }
      }
    };
    fetchRestaurant();
  }, [user]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-around border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === "perfil" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          onClick={() => setActiveTab("perfil")}
        >
          Perfil do Restaurante
        </button>
        <button
          className={`py-2 px-4 ${activeTab === "horario" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          onClick={() => setActiveTab("horario")}
        >
          Horário de Funcionamento
        </button>
        <button
          className={`py-2 px-4 ${activeTab === "calendario" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          onClick={() => setActiveTab("calendario")}
        >
          Calendário
        </button>
      </div>
      {restaurant ? (
        <div>
          {activeTab === "perfil" && (
            <RestaurantProfile restaurant={restaurant} setRestaurant={setRestaurant} />
          )}
          {activeTab === "horario" && (
            <OpeningHour restaurantId={restaurant.id} openingHours={openingHours} setOpeningHours={setOpeningHours} />
          )}
          {activeTab === "calendario" && (
            <OpeningHoursCalendar restaurantId={restaurant.id} />
          )}
        </div>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
};

export default Profile;
