import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";
import { getstore, getOpeningHours } from "@/services/apiService";
import { storeType, OpeningHourType } from "@/services/types";

import OpeningHour from "./OpeningHour";
import OpeningHoursCalendar from "./OpeningHoursCalendar";
import storeProfile from "./storeProfile";

const Profile: React.FC = () => {
  const user = useSelector(selectUser);
  const [store, setstore] = useState<storeType | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHourType[]>([]);
  const [activeTab, setActiveTab] = useState<string>("perfil");

  useEffect(() => {
    const fetchstore = async () => {
      if (user?.user_id) {
        try {
          const data = await getstore(user.user_id);
          console.log("store data==>", data)
          setstore(data);
          const openingHoursData = await getOpeningHours(data.id);
          setOpeningHours(openingHoursData);
        } catch (error) {
          console.error("Error fetching store data", error);
        }
      }
    };
    fetchstore();
  }, [user]);
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-around border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === "perfil" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          onClick={() => setActiveTab("perfil")}
        >
          Perfil do storee
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
      {store ? (
        <div>
          {activeTab === "perfil" && (
            <storeProfile store={store} setstore={setstore} />
          )}
          {activeTab === "horario" && (
            <OpeningHour storeId={store.id} openingHours={openingHours} setOpeningHours={setOpeningHours} />
          )}
          {activeTab === "calendario" && (
            <OpeningHoursCalendar storeId={store.id} />
          )}
        </div>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
};

export default Profile;
