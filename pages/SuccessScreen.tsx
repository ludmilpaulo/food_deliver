import React, { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import logo from "../assets/done.gif";
import Link from "next/link";
import router from "next/router";

type Props = {};

const SuccessScreen = (props: Props) => {
  useEffect(() => {
    setTimeout(() => {
      router.push("/");
    }, 7000);
  }, []);
  return (
    <motion.div
      animate={{
        scale: [1, 1, 1, 1, 1],
        rotate: [0, 30, 60, 240, 360],
      }}
      className=""
    >
      <Image className="h-screen w-screen" src={logo} alt={""} />

      <div className="mt-6  w-full"></div>
    </motion.div>
  );
};

export default SuccessScreen;
