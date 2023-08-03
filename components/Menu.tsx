import React, { useState } from "react";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { selectCartItems, updateBusket } from "../redux/slices/basketSlice";

interface Meals {
  foods: any;
  meals: any;
  food: any;
  resImage: string;
  resName: string;
  resId?: any;
  category: string;
  id: number;
  image: string;
  name: string;
  price: number;
  quantity: number;
  short_description: string;
}

const Menu = ({ resId, food, resName, resImage, foods }: Meals) => {
  const [qty, setQty] = useState(0);

  const cartItems = useSelector(selectCartItems);

  const dispatch = useDispatch();

  const handleAddRemove = (id: any, newQty: number) => {
    try {
      const indexFromFood = foods.findIndex((x: { id: any }) => x.id === id);
      const resIndex = cartItems.findIndex(
        (item: { resName: string }) => item.resName === resName,
      );
      const foodItem = foods[indexFromFood];
      foodItem.quantity = newQty;

      if (resIndex >= 0) {
        const menuIndex = cartItems[resIndex].foods.findIndex(
          (item: { id: any }) => item.id === id,
        );
        let oldArrays = [...cartItems];
        let oldfoods = [...oldArrays[resIndex].foods];
        if (qty === 0) { // if the quantity is 0, remove the item from the cart
          oldfoods.splice(menuIndex, 1);
        } else {
          oldfoods[menuIndex] = foodItem;
        }
        oldArrays[resIndex].foods = oldfoods;
        if (oldfoods.length > 0) {
          dispatch(updateBusket(oldArrays));
        } else {
          oldArrays.splice(resIndex, 1);
          dispatch(updateBusket(oldArrays));
        }
      } else {
        let oldArrays = [...cartItems];
        let newResFoodArray = [
          ...oldArrays,
          {
            foods: [{ ...foodItem }],
            resName,
            resImage,
            resId,
          },
        ];
        dispatch(updateBusket(newResFoodArray));
      }
    } catch (error) {
      console.log("cabelo", error);
    }
  };

  function quantityUp() {
    setQty(prevQty => {
      const newQty = prevQty + 1;
      handleAddRemove(food.id, newQty);
      return newQty;
    });
  }

  function quantityDown() {
    setQty(prevQty => {
      if (prevQty > 0) {
        const newQty = prevQty - 1;
        handleAddRemove(food.id, newQty);
        return newQty;
      } else {
        return prevQty;
      }
    });
  }

  return (
    <div className="duration-300 border rounded-lg shadow-lg hover:scale-105">
      <Image
        src={food?.image}
        alt={food?.name}
        width={500} // specify width
        height={200} // specify height
        className="object-cover rounded-t-lg"
      />

      <div className="flex justify-between px-2 py-4">
        <p className="font-bold">{food?.name}</p>
        <p>
          <span className="bg-[#004AAD] text-white p-1 rounded-full">
            {food?.price} Kz
          </span>
        </p>
      </div>
      <div>
        <p>{food?.short_description}</p>
      </div>
      <div className="flex items-center justify-between pb-3">
        <FiMinusCircle onClick={quantityDown} size={40} color="#004AAD" />
        {qty}
        <FiPlusCircle onClick={quantityUp} size={40} color="#004AAD" />
      </div>
    </div>
  );
};

export default Menu;
