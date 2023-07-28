import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, logoutUser, selectUser } from "../redux/slices/authSlice";
import withAuth from '../components/ProtectedPage';




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
import { FiSearch } from "react-icons/fi";
import background from "../assets/bg.png";
import RestaurantItem from "@/components/RestaurantItem";

import Footer from "@/components/Footer";
import Hero from "@/components/Hero";

import { selectTotalItems, selectTotalPrice } from "@/redux/slices/basketSlice";
import Nav from "@/components/Nav";

import { useMemo } from "react";
import Header from "@/components/Header";

export type Restaurant = {
  restaurantData: any;
  id?: number;
  name?: string;
  phone?: number;
  address?: string;
  logo?: string;
};

export async function getServerSideProps() {
  const res = await fetch(
    "https://www.sunshinedeliver.com/api/customer/restaurants/"
  );
  const data = await res.json();

  return {
    props: {
      restaurantData: data?.restaurants,
    },
  };
}


const HomeScreen = ({ restaurantData }: Restaurant)=> {
  const router = useRouter();
  const user = useSelector(selectUser);

  const totalPrice = useSelector(selectTotalPrice);
  const getAllItems = useSelector(selectTotalItems);
  const [search, setSearch] = useState("");

  const [filteredDataSource, setFilteredDataSource] =
    useState<Restaurant[]>(restaurantData);
  const [masterDataSource, setMasterDataSource] =
    useState<Restaurant[]>(restaurantData);

  const [loading, setLoading] = useState(false);
  const [nav, setNav] = useState(false);

  ///******************************Procurar************************* */
  const searchFilterFunction = (text: any) => {
    console.log("text captured", text);
    // Check if searched text is not blank
    if (text) {
      // Inserted text is not blank
      // Filter the masterDataSource and update FilteredDataSource
      const newData = masterDataSource.filter(function (item) {
        // Applying filter for the inserted text in search bar
        const itemData = item.name ? item.name.toUpperCase() : "".toUpperCase();
        const textData = text.toString().toUpperCase();
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
    <Header />
      <div className="h-screen bg-center bg-no-repeat bg-cover bg-bg_image md:h-screen">
        <Nav />
        <Hero />
        <div className="container relative mx-auto">
          <div className="flex pb-4 mt-4 space-x-3 border-b border-gray-800 dark:border-gray-700">
            <div>
              <FiSearch />
            </div>
            <input
              value={search}
              onChange={(text) => searchFilterFunction(text.target.value)}
              type="text"
              placeholder="Pesquisar restaurantes"
              className="text-sm text-gray-600 bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <div className="max-w-[1640px] mx-auto p-4 py-12 grid md:grid-cols-3 gap-6">
          {/* Card  */}

          <RestaurantItem
            restaurantData={filteredDataSource}
            map={undefined}
            id={0}
            name={""}
            phone={0}
            address={""}
            logo={""}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default withAuth(HomeScreen);
