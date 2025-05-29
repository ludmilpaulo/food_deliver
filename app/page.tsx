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


  return (
    <>
    </>

  );
}