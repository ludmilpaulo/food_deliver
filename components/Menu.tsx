import React, { useState } from "react";
import { FiMinusCircle, FiPlusCircle, FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { updateBasket } from "../redux/slices/basketSlice";
import { selectCartItems } from "../redux/slices/basketSlice";

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

  const isInCart = cartItems.some((item) => item.id === food.id);

  const dispatch = useDispatch();

  function quantityUp() {
    setQty((prevQty) => {
      const newQty = prevQty + 1;

      dispatch(
        updateBasket({
          ...food,
          quantity: newQty,
          resName,
          resImage,
          resId,
        }),
      );

      return newQty;
    });
  }

  function quantityDown() {
    setQty((prevQty) => {
      if (prevQty > 0) {
        const newQty = prevQty - 1;

        dispatch(
          updateBasket({
            ...food,
            quantity: newQty,
            resName,
            resImage,
            resId,
          }),
        );

        return newQty;
      } else {
        return prevQty;
      }
    });
  }

  return (
    <div className="grid grid-cols-3 w-screen sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 py-4 px-4 mb-12">
      <div className="duration-300 w-full border rounded-lg shadow-lg hover:scale-105">
        <div className="items-center p-2 bg-blue-500 text-white uppercase font-bold text-xs rounded-br-lg">
          <span>{food.price * qty}Kz</span>
        </div>

        <Image
          src={food?.image}
          alt={food?.name}
          width={500} // specify width
          height={200} // specify height
          className="object-cover rounded-t-lg"
        />
        <div className="flex flex-col items-center flex-grow">
          <div className="text-xl font-medium text-black">{food?.name}</div>

          <p className="text-gray-500">{food?.short_description}</p>
        </div>

        <div className="flex items-center justify-between pb-3">
          <FiMinusCircle onClick={quantityDown} size={40} color="#004AAD" />
          {qty}
          <FiPlusCircle onClick={quantityUp} size={40} color="#004AAD" />
        </div>

        {isInCart && (
          <div className="animate-bounce items-center">
            <Link
              href="/CartScreen"
              className="flex-row items-center bg-indigo-500 opacity-100 ..."
            >
              <div className="items-center p-2 bg-blue-500 text-white uppercase font-bold text-xs rounded-br-lg">
                <span>
                  <FiShoppingCart size={24} />
                  Ir para a bandeja
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="fixed bottom-10 right-10 bg-blue-600 text-white p-2 rounded-full shadow-lg">
          <Link
            href="/CartScreen"
            className="flex-row items-center bg-indigo-500 w-full h-25 opacity-100 ..."
          >
            <span>
              <FiShoppingCart size={24} />
              Ir para a bandeja
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Menu;
