import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import logo from "../assets/nome.gif";
import Link from "next/link";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Barner from "@/components/Barner";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import RestaurantCard from "@/components/RestaurantCard";
import SearchBar from "@/components/SearchBar";


function JoinScreen() {
  return (
    <>
      <Nav />
      <div className="w-full h-custom">
        <Barner />
      </div>
      <div>
        <Card />
        <SearchBar />
        <RestaurantCard />
      </div>
   
      <Footer />
    </>
  );
}

export default JoinScreen;
