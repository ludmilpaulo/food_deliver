import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, logoutUser, selectUser } from "../redux/slices/authSlice";

import React, { useState, useEffect } from "react";
import {
  AiOutlineMenu,
  AiOutlineSearch,
  AiOutlineClose,
  AiFillTag,
} from "react-icons/ai";
import { BsFillCartFill, BsFillSaveFill } from "react-icons/bs";
import { TbTruckDelivery } from "react-icons/tb";
import { FaUserFriends, FaWallet } from "react-icons/fa";
import { MdFavorite, MdHelp } from "react-icons/md";
import background from "../assets/bg.png";
import RestaurantItem from "@/components/RestaurantItem";


import Footer from "@/components/Footer";
import Hero from "@/components/Hero";

import { selectTotalItems, selectTotalPrice } from "@/redux/slices/basketSlice";
import Navbar from "@/components/Navbar";

interface Restaurant {
  id?: number;
  name?: string;
  phone?: number;
  address?: string;
  logo?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useSelector(selectUser);

  const totalPrice = useSelector(selectTotalPrice);
  const getAllItems = useSelector(selectTotalItems);

  const [restaurantData, setRestaurantData] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [filteredDataSource, setFilteredDataSource] = useState<Restaurant[]>([]);
  const [masterDataSource, setMasterDataSource] = useState<Restaurant[]>([]);

  const [loading, setLoading] = useState(false);
  const [nav, setNav] = useState(false);

  const getRestaurant = async () => {
    try {
      fetch("https://www.sunshinedeliver.com/api/customer/restaurants/")
        .then((response) => response.json())
        .then((responseJson) => {
          setRestaurantData(responseJson.restaurants);
          setFilteredDataSource(responseJson.restaurants);
          setMasterDataSource(responseJson.restaurants);
        })
        .catch(function (error) {
          console.log(
            "There has been a problem with your fetch operation: " +
              error.message
          );
          // ADD THIS THROW error
          throw error;
        });
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    getRestaurant();
  }, [restaurantData]);

  ///******************************Procurar************************* */
  const searchFilterFunction = (text: any) => {
    // Check if searched text is not blank
    if (text) {
      // Inserted text is not blank
      // Filter the masterDataSource and update FilteredDataSource
      const newData = masterDataSource.filter(function (item) {
        // Applying filter for the inserted text in search bar
        const itemData = item.name ? item.name.toUpperCase() : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with restaurantData
      setFilteredDataSource(masterDataSource);
      setSearch(text);
    }
  };

  return (
    <>
      <div className="bg-bg_image bg-cover bg-center bg-no-repeat h-screen md:h-screen">
      <Navbar total={totalPrice} count={getAllItems.length} />
        <Hero  />
       

        <div className="max-w-[1640px] mx-auto p-4 py-12 grid md:grid-cols-3 gap-6">
          {/* Card  */}

          <RestaurantItem restaurantData={masterDataSource} map={undefined} id={0} name={""} phone={0} address={""} logo={""} />
         
        </div>
      </div>
      <Footer />
    </>
  );
}
