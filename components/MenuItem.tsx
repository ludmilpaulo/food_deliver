import React, { useState, useEffect, ReactNode } from "react";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
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

const MenuItem = ({ resId, food, resName, resImage, foods }: Meals) => {
  //const [foods, setFoods] = useState<Meals[]>(food);
  const [qty, setQty] = useState(0);

  const [isPressed, setIsPressed] = useState(false);

  const cartItems = useSelector(selectCartItems);

  let allCartItems = cartItems;

  const dispatch = useDispatch();

  const setTheQuantity = () => {
    const resIndex = cartItems.findIndex(
      (item: { resName: string }) => item.resName === resName
    );

    if (resIndex >= 0) {
      const menuIndex = cartItems[resIndex].foods.findIndex(
        (item: { id: any }) => item.id === food.id
      );
      if (menuIndex >= 0) {
        console.log("Menu Index => ", menuIndex);
        const menuItem = cartItems[resIndex].foods[menuIndex];
        console.log("Menu Item => ", menuItem);
        setQty(menuItem.quantity);
      }
    }
  };

  function quantityUp() {
    setQty(qty + 1);
    setIsPressed(!isPressed);
  }

  function quantityDown() {
    if (qty != 1) {
      setQty(qty - 1);
      setIsPressed(!isPressed);
    }
  }

  useEffect(() => {
    console.log(resId, "restid")
    setTheQuantity();
    //  setFoods(food);
  }, []);

  const match = (id: any) => {
    const resIndex = cartItems.findIndex(
      (item: { resName: string }) => item.resName === resName
    );
    if (resIndex >= 0) {
      const menuIndex = cartItems[resIndex].foods.findIndex(
        (item: { id: any }) => item.id === id
      );
      if (menuIndex >= 0) return true;
      return false;
    }
    return false;
  };

  const handleAddRemove = (id: any) => {
    try {
      const indexFromFood = foods.findIndex((x: { id: any }) => x.id === id);
      const resIndex = cartItems.findIndex(
        (item: { resName: string }) => item.resName === resName
      );
      const foodItem = foods[indexFromFood];
      foodItem.quantity = qty;
   

      if (resIndex >= 0) {
        const menuIndex = cartItems[resIndex].foods.findIndex(
          (item: { id: any }) => item.id === id
        );
        if (menuIndex >= 0) {
          let oldArrays = [...cartItems];
          let oldfoods = [...oldArrays[resIndex].foods];
          oldfoods.splice(menuIndex, 1);
          oldArrays.splice(resIndex, 1);
          let newArray = [
            ...oldArrays,
            { foods: oldfoods, resName, resImage, resId },
          ];
          dispatch(updateBusket(newArray));
        } else {
          let oldArrays = [...cartItems];
          let newFoodArray = [...oldArrays[resIndex].foods, foodItem];
          oldArrays.splice(resIndex, 1);
          let updatedResArray = [
            ...oldArrays,
            { foods: newFoodArray, resName, resImage, resId },
          ];
          dispatch(updateBusket(updatedResArray));
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
      // return true;
      console.log("cabelo", error);
    }
  };

  const handleRemove = (id: any) => {
    const resIndex = allCartItems.findIndex(
      (item: { resName: string }) => item.resName === resName
    );

    if (resIndex >= 0) {
      const menuIndex = allCartItems[resIndex].foods.findIndex(
        (item: { id: any }) => item.id === id
      );
      if (menuIndex >= 0) {
        let oldArrays = [...allCartItems];
        let oldfoods = [...oldArrays[resIndex].foods];
        oldfoods.splice(menuIndex, 1);
        oldArrays.splice(resIndex, 1);
        let newArray = oldfoods.length
          ? [...oldArrays, { foods: oldfoods, resName, resImage, resId}]
          : oldArrays;
        dispatch(updateBusket(newArray));
      }
    }
  };

  return (
    <div className="border shadow-lg rounded-lg hover:scale-105 duration-300">
      <img
        src={food?.image}
        alt={food?.name}
        className="w-full h-[200px] object-cover rounded-t-lg"
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
      <div className="flex justify-between items-center pb-3">
        <FiMinusCircle onClick={quantityDown} size={40} color="#004AAD" />
        {qty}
        <FiPlusCircle onClick={quantityUp} size={40} color="#004AAD" />
      </div>

      {qty > 0 && (
        <>
          {match(food.id) ? (
            <div className="animate-bounce items-center">
              <button
                onClick={() => handleRemove(food.id)}
                className="flex-row items-center bg-indigo-500 w-full h-25 opacity-100 ..."
              >
                Remover da Bandeja
              </button>
            </div>
          ) : (
            <div className="animate-bounce items-center">
              <button
                onClick={() => handleAddRemove(food.id)}
                className="flex-row items-center bg-indigo-500 w-full h-25 opacity-100 ..."
              >
                Adicionar à bandeja
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MenuItem;
