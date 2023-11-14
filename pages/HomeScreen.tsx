import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import logo from "../assets/nome.gif";
import Link from "next/link";
import withAuth from "@/components/ProtectedPage";
import Nav from "@/components/Nav";
import Barner from "@/components/Barner";
import Card from "@/components/CategoryCard";
import Footer from "@/components/Footer";
import RestaurantCard from "@/components/RestaurantCard";
import { FiSearch } from "react-icons/fi";
import { Restaurant, basAPI } from "@/configs/variable";



type Restaurants = Restaurant[];

function HomeScreen() {
  const [restaurants, setRestaurants] = useState<Restaurants>([]);
  const [search, setSearch] = useState("");

  const [filteredDataSource, setFilteredDataSource] = useState<Restaurants>([]);
  const [masterDataSource, setMasterDataSource] = useState<Restaurants>([]);

  useEffect(() => {
    fetch(`${basAPI}api/customer/restaurants/`)
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
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Nav />
        
        <div className="w-full h-auto sm:h-custom">
          <Barner />
        </div>
        <div className="px-2 sm:px-4">
          <Card onSelectCategory={(category) => setSearch(category)}/>
          

          <div className="flex items-center justify-center px-4 sm:px-24 mx-4 sm:mx-24 border-2 border-[#0171CE] rounded-md mt-4">
            <input
              type="text"
              className="w-full p-2 text-center sm:text-center rounded-l-md"
              value={search}
              onChange={(event) => searchFilterFunction(event.target.value)}
              placeholder="Pesquisar restaurantes"
            />
          </div>

          <div className="pb-16 mx-8 my-12">
            
            <RestaurantCard restaurantData={filteredDataSource} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default withAuth(HomeScreen);
