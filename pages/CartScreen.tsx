import React, { useState } from "react";

import {
  selectTotalItems,
  selectTotalPrice,
} from "../redux/slices/basketSlice";
import { useSelector } from "react-redux";

import CartItem from "../components/CartItem";
import Hero from "@/components/Hero";

import { selectCartItems, updateBusket } from "../redux/slices/basketSlice";
import Navbar from "@/components/Navbar";

interface Meals {
    foods : any;
    meals: any;
    food: any;
    resImage: string;
    resName: string;
    resId: number;
    category: string;
    id: number;
    image: string;
    name: string;
    price: number;
    quantity: number;
    short_description: string;
  }

const CartSreen = () => {
  const totalPrice = useSelector(selectTotalPrice);
  const getAllItems = useSelector(selectTotalItems);
  const all = useSelector(selectCartItems);

  let allCartItems = all;
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <div className="flex-1 bg-cover w-full h-full bg-no-repeat bg-bg_image">
       <Navbar total={totalPrice} count={getAllItems.length} />
    

      <div className="flex-1 bg-bg_image h-screen ">
        <CartItem text={""} />
      </div>
    </div>
  );
};

export default CartSreen;