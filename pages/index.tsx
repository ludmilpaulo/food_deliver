import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";
import HomeScreen from "./HomeScreen";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();

  const user = useSelector(selectUser);
  useEffect(() => {
    if (user !== null && typeof user === 'object' && user.is_customer === true) {
      router.push("/HomeScreen");
    } else if (user !== null && typeof user === 'object' && user.is_customer === false) {
      router.push("/RestaurantDashboard"); // Redirect to Dashboard
    }
    if (user == null && typeof user === 'object') {
      router.push("/LoginScreenUser");
    }
  }, [router, user]);
  

  console.log("user==>>", user)


  return (
    <>
    </>

  );
}
