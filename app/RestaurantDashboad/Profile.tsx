import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";
import { getRestaurant, getOpeningHours } from "@/services/apiService";
import { RestaurantType, OpeningHourType } from "@/services/types";
import RestaurantProfile from "./RestaurantProfile";
import OpeningHour from "./OpeningHour";
import OpeningHoursCalendar from "./OpeningHoursCalendar"; // Import OpeningHoursCalendar component
import styles from './Profile.module.css'; // Import the CSS module

const Profile: React.FC = () => {
  const user = useSelector(selectUser);
  const [restaurant, setRestaurant] = useState<RestaurantType | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHourType[]>([]);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (user?.user_id) {
        try {
          const data = await getRestaurant(user.user_id);
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
    <div className={`p-6 bg-white rounded-lg shadow-md ${styles.profileContainer}`}>
      {restaurant ? (
        <div>
          <RestaurantProfile restaurant={restaurant} setRestaurant={setRestaurant} />
          <OpeningHour restaurantId={restaurant.id} openingHours={openingHours} setOpeningHours={setOpeningHours} />
          <OpeningHoursCalendar restaurantId={restaurant.id} /> {/* Add OpeningHoursCalendar component */}
        </div>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
};

export default Profile;
