import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import logo from "../assets/nome.gif";
import Link from "next/link";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Barner from "@/components/Barner";
import Card from "@/components/CategoryCard";
import Footer from "@/components/Footer";
import RestaurantCard from "@/components/RestaurantCard";
import SearchBar from "@/components/SearchBar";
import { FiSearch } from "react-icons/fi";
import CategoryCard from "@/components/CategoryCard";


type Restaurant = {
  id: number;
  name: string;
  phone: string;
  address: string;
  logo: string;
};

type Restaurants = Restaurant[];

function JoinScreen() {
  const [restaurants, setRestaurants] = useState<Restaurants>([]);
  const [search, setSearch] = useState("");

  const [filteredDataSource, setFilteredDataSource] = useState<Restaurants>([]);
  const [masterDataSource, setMasterDataSource] = useState<Restaurants>([]);

  useEffect(() => {
    fetch("https://www.sunshinedeliver.com/api/customer/restaurants/")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setMasterDataSource(data.restaurants);
        setFilteredDataSource(data.restaurants);
      });
  }, []);

  const searchFilterFunction = (text: any) => {
    if (text) {
      const newData = masterDataSource.filter(function (item) {
        const itemData = item.name ? item.name.toUpperCase() : "".toUpperCase();
        const textData = text.toString().toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      setFilteredDataSource(masterDataSource);
      setSearch(text);
    }
  };

  return (
    <>
      <Nav />
      <div className="w-full h-auto sm:h-custom">
        <Barner />
      </div>
      <div className="px-2 sm:px-4">
      <CategoryCard onSelectCategory={(category) => console.log(category)} />

        <div className="flex items-center border-2 border-sky-500 rounded-md mt-4">
          <input
            type="text"
            className="w-full p-2 rounded-l-md"
            value={search}
            onChange={(event) => searchFilterFunction(event.target.value)}
            placeholder="Pesquisar restaurantes"
          />
          <button className="px-4 py-2 bg-blue-500 text-white rounded-r-md flex items-center justify-center">
            <FiSearch />
          </button>
        </div>

        <div className="pb-16 mx-8 my-12">
          <RestaurantCard restaurantData={filteredDataSource} />
        </div>
      </div>

      <Footer />
    </>
  );
}

export default JoinScreen;
