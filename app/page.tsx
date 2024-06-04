"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";
import {clearAllCart } from "@/redux/slices/basketSlice";




export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  console.log("user==>>", user)

useEffect(() => {
  if (user !== null && typeof user === 'object') {
    if (user.is_customer === true) {
      router.push("/HomeScreen");
    } else if (user.fornecedor_id !== null) {
      router.push("/RestaurantDashboard");
    } else {
      dispatch(clearAllCart());
      router.push("/LoginScreenUser");
    }
  } else {
    dispatch(clearAllCart());
    router.push("/LoginScreenUser");
  }
}, [router, user]);



  console.log("user==>>", user)


  return (
    <>
    </>

  );
}