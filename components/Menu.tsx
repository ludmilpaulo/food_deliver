import React, { useState } from "react";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { selectCartItems, updateBusket } from "../redux/slices/basketSlice";
import Link from "next/link";

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
  let allCartItems = cartItems;

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

  const match = (id: any) => {
    const resIndex = cartItems.findIndex(
      (item: { resName: string }) => item.resName === resName,
    );
    if (resIndex >= 0) {
      const menuIndex = cartItems[resIndex].foods.findIndex(
        (item: { id: any }) => item.id === id,
      );
      if (menuIndex >= 0) return true;
      return false;
    }
    return false;
  };

  const handleRemove = (id: any) => {
    const resIndex = allCartItems.findIndex(
      (item: { resName: string }) => item.resName === resName,
    );

    if (resIndex >= 0) {
      const menuIndex = allCartItems[resIndex].foods.findIndex(
        (item: { id: any }) => item.id === id,
      );
      if (menuIndex >= 0) {
        let oldArrays = [...allCartItems];
        let oldfoods = [...oldArrays[resIndex].foods];
        oldfoods.splice(menuIndex, 1);
        oldArrays.splice(resIndex, 1);
        let newArray = oldfoods.length
          ? [...oldArrays, { foods: oldfoods, resName, resImage, resId }]
          : oldArrays;
        dispatch(updateBusket(newArray));
      }
    }
  };

  return (
    <div className="grid grid-cols-3 w-screen sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 py-4 px-4 mb-12">
    
    <div className="duration-300 w-full border rounded-lg shadow-lg hover:scale-105">
      <Image
        src={food?.image}
        alt={food?.name}
        width={500} // specify width
        height={200} // specify height
        className="object-cover rounded-t-lg"
      />
          <div className="flex flex-col items-center flex-grow">
            <div className="text-xl font-medium text-black">
              {food?.name}
            </div>
          
            <p className="text-gray-500">{food?.short_description}</p>
          </div>
          
          <div className="flex items-center justify-between pb-3">
        <FiMinusCircle onClick={quantityDown} size={40} color="#004AAD" />
        {qty}
        <FiPlusCircle onClick={quantityUp} size={40} color="#004AAD" />
      </div>

      {qty > 0 && (
        <>
          {match(food.id) ? (
            <div className="items-center animate-bounce">
              <button
                onClick={() => handleRemove(food.id)}
                className="flex-row items-center bg-indigo-500 w-full h-25 opacity-100 ..."
              >
                Remover da Bandeja
              </button>
            </div>
          ) : (
            <div className="items-center animate-bounce">
              <Link href="/CartScreen" className="flex-row items-center bg-indigo-500 w-full h-25 opacity-100 ...">
      Adicionar à bandeja
    </Link>
            </div>
          )}
        </>
      )}
        
        </div>
   
    </div>
  
  );
};

export default Menu;
