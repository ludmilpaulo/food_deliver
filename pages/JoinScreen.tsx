import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import logo from "../assets/nome.gif";
import Link from "next/link";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Barner from "@/components/Barner";

function JoinScreen() {
  return (
    <>
    <Nav />
    <div className="w-screen h-64 sm:h-64 md:h-64 lg:h-64 xl:h-64 2xl:h-64">
       <Barner />
      </div>    
    </>
  );
}

export default JoinScreen;
