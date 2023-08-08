import React, { useState } from "react";
import Link from "next/link";

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
                <Link href={"/CartScreen"}
                  className="text-base leading-4 underline hover:text-gray-800 text-gray-600">
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

              <div className="mt-8 flex flex-col justify-start items-start w-full space-y-8 ">
                <input
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  className="px-2 focus:outline-none focus:ring-2 focus:ring-gray-500 border-b border-gray-200 leading-4 text-base placeholder-gray-600 py-4 w-full"
                  type="text"
                  placeholder="Por favor, adicione o endereço de entrega"
                />
              </div>
              <button
                className="focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-8 text-base font-medium leading-4 hover:bg-black py-4 w-full md:w-4/12 lg:w-full text-white bg-gray-800"
              >
                Prossiga para o pagamento
              </button>
            </div>
          </div>
            



        </div>
      </div>
    </>
  );
};

export default CartSreen;
