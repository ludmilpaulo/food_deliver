import React, { useState } from "react";

import {
  selectTotalItems,
  selectTotalPrice,
} from "../redux/slices/basketSlice";
import { useSelector } from "react-redux";


import { selectCartItems } from "../redux/slices/basketSlice";
import Nav from "@/components/Nav";
import CartMenu from "@/components/CartMenu";

interface Meals {
  foods: any;
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
    <div className="flex-1">
      <Nav />

      <div className="flex-1">
        <CartMenu />
      </div>
    </div>
  );
};

export default CartSreen;
