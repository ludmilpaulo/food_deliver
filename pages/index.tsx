import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const user = useSelector(selectUser);

  if (user == null) {
    router.push("/JoinScreen");
  } else {
    router.push("/HomeScreen");
  }

  useEffect(() => {}, []);
  return <></>;
}
