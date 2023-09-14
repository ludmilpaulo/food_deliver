import React, { useEffect, useState } from "react";
import Link from "next/link";

import {
  selectTotalItems,
  selectTotalPrice,
} from "../redux/slices/basketSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  updateBasket,
  clearCart,
  selectCartItems,
} from "../redux/slices/basketSlice";
import Nav from "@/components/Nav";
import CartMenu from "@/components/CartMenu";
import router from "next/router";

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
  const dispatch = useDispatch();

  const totalPrice = useSelector(selectTotalPrice);
  const getAllItems = useSelector(selectTotalItems);
  const allCartItems = useSelector(selectCartItems);

  console.log("all card item", allCartItems);

  useEffect(() => {
    // Assuming allCartItems is an array
    const firstResId = allCartItems[0]?.resId;
    const firstResName = allCartItems[0]?.resName;

    const hasDifferentRestaurant = allCartItems.some(
      (item) => item.resId !== firstResId || item.resName !== firstResName,
    );

    if (hasDifferentRestaurant) {
      alert("Please order food only from one restaurant at a time.");
      // Clear the cart (You will need to define this action and its reducer logic)
      dispatch(clearCart());
      // Redirect to HomeScreen
      router.push("/HomeScreen");
    }
  }, [allCartItems, dispatch]);

  const [userAddress, setUserAddress] = useState("");

  return (
    <>
      <div className="overflow-y-hidden">
        <Nav />
        <div className="flex justify-center items-center 2xl:container 2xl:mx-auto lg:py-16 md:py-12 py-9 px-4 md:px-6 lg:px-20 xl:px-44 ">
          <div className="flex w-full sm:w-9/12 lg:w-full flex-col lg:flex-row justify-center items-center lg:space-x-10 2xl:space-x-36 space-y-12 lg:space-y-0">
            <div className="flex w-full flex-col justify-start items-start">
              <div>
                <p className="text-3xl lg:text-4xl font-semibold leading-7 lg:leading-9 text-gray-800">
                  Confira
                </p>
              </div>
              <div className="mt-2">
                <Link
                  href={"/CartScreen"}
                  className="text-base leading-4 underline hover:text-gray-800 text-gray-600"
                >
                  Voltar o menu
                </Link>
              </div>
              <div className="mt-12">
                <p className="text-xl font-semibold leading-5 text-gray-800">
                  Detalhes da Entrega
                </p>
              </div>
              <CartMenu />

              <div className="flex justify-center md:flex-row flex-col items-stretch w-full space-y-4 md:space-y-0 md:space-x-6 xl:space-x-8">
                <div className="flex flex-col px-4 py-6 md:p-6 xl:p-8 w-full bg-gray-50 space-y-6   ">
                  <h3 className="text-xl font-semibold leading-5 text-gray-800">
                    Summary
                  </h3>
                  <div className="flex justify-center items-center w-full space-y-4 flex-col border-gray-200 border-b pb-4">
                    <div className="flex justify-between  w-full">
                      <p className="text-base leading-4 text-gray-800">
                        Subtotal
                      </p>
                      <p className="text-base leading-4 text-gray-600">
                        {totalPrice}Kz
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <p className="text-base font-semibold leading-4 text-gray-800">
                      Total
                    </p>
                    <p className="text-base font-semibold leading-4 text-gray-600">
                      {totalPrice}Kz
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href={"/CheckoutScreen"}
                className="focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-8 text-base font-medium leading-4 hover:bg-black py-4 w-full md:w-4/12 lg:w-full text-white bg-gray-800"
              >
                Prossiga para o pagamento
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSreen;
