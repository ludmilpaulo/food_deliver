import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import Image from 'next/image';

import {
  selectCartItems,
  selectTotalItems,
  selectTotalPrice,
  updateBusket,
} from "../redux/slices/basketSlice";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import { logoutUser, selectUser } from "../redux/slices/authSlice";

import Link from "next/link";
import { timeStamp } from "console";

interface Button {
  text: string;
  onClick?: () => void;
}

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
  handleRemove?: () => void;
}

const CartItem = ({ text, onClick }: Button) => {
  const all = useSelector(selectCartItems);

  const user = useSelector(selectUser);

  const url = "https://www.sunshinedeliver.com";

  const [username, setUsername] = useState();
  const [userPhoto, setUserPhoto] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userId, setUserId] = useState<any>();

  const customer_avatar = `${userPhoto}`;


  let allCartItems = all;

  const dispatch = useDispatch();

  const totalPrice = useSelector(selectTotalPrice);

  const pickUser = async () => {};

  useEffect(() => {
    pickUser();
    setUserId(user?.user_id);
    setUsername(user?.username);
  }, [user]); // Run this useEffect when `user` changes

  const handleRemove = (id: any, resName: any, resImage: any) => {
    const resIndex = allCartItems.findIndex(
      (item: { resName: any }) => item.resName === resName
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
          ? [...oldArrays, { foods: oldfoods, resName, resImage }]
          : oldArrays;
        dispatch(updateBusket(newArray));
      }
    }
  };

  return (
    <>
      <div className="px-4 py-14 md:px-6 2xl:px-20 2xl:container 2xl:mx-auto">
        {!!!allCartItems?.length && (
          <div className="flex flex-col justify-start space-y-2 item-start ">
            <h1 className="text-3xl font-semibold leading-7 text-gray-800 lg:text-4xl lg:leading-9">
              {" "}
              Nenhum item do carrinho!
            </h1>
            <p className="text-base font-medium leading-6 text-gray-600">
            {new Date().getFullYear()}
            </p>
          </div>
        )}
      {allCartItems?.map(
  (item: {
    resImage: (id: any, resName: string, resImage: any) => void;
    resName: string;
    foods: any[];
  }, index: number) => (
            <>
              <div key={index} className="flex flex-col justify-start space-y-2 item-start ">
                <h1 className="text-3xl font-semibold leading-7 text-gray-800 lg:text-4xl lg:leading-9">
                  {" "}
                  {item.resName}
                </h1>
                <p className="text-base font-medium leading-6 text-gray-600">
                {new Date().toISOString()}
                </p>
              </div>
              <div className="flex flex-col items-stretch w-full mt-10 space-y-4 xl:flex-row jusitfy-center xl:space-x-8 md:space-y-6 xl:space-y-0">
                <div className="flex flex-col items-start justify-start w-full space-y-4 md:space-y-6 xl:space-y-8">
                  <div className="flex flex-col items-start justify-start w-full px-4 py-4 bg-gray-50 md:py-6 md:p-6 xl:p-8">
                    <p className="text-lg font-semibold leading-6 text-gray-800 md:text-xl xl:leading-5">
                      Carrinho do cliente
                    </p>
                    {item?.foods?.map(
                      (food: {
                        id(
                          id: any,
                          resName:
                            | boolean
                            | React.Key
                            | React.ReactElement<
                                any,
                                string | React.JSXElementConstructor<any>
                              >
                            | React.ReactFragment
                            | null
                            | undefined,
                          resImage: any
                        ): void;
                        image: string | undefined;
                        name:
                          | string
                          | number
                          | boolean
                          | React.ReactElement<
                              any,
                              string | React.JSXElementConstructor<any>
                            >
                          | React.ReactFragment
                          | null
                          | undefined;
                        short_description:
                          | string
                          | number
                          | boolean
                          | React.ReactElement<
                              any,
                              string | React.JSXElementConstructor<any>
                            >
                          | React.ReactFragment
                          | React.ReactPortal
                          | null
                          | undefined;
                        price:
                          | string
                          | number
                          | boolean
                          | React.ReactElement<
                              any,
                              string | React.JSXElementConstructor<any>
                            >
                          | React.ReactFragment
                          | null
                          | undefined;
                        quantity:
                          | string
                          | number
                          | boolean
                          | React.ReactElement<
                              any,
                              string | React.JSXElementConstructor<any>
                            >
                          | React.ReactFragment
                          | React.ReactPortal
                          | null
                          | undefined;
                      }) => (
                        // eslint-disable-next-line react/jsx-key
                        <div className="flex flex-col items-start justify-start w-full mt-4 md:mt-6 md:flex-row md:items-center md:space-x-6 xl:space-x-8 ">
                          <div className="w-full pb-4 md:pb-8 md:w-40">
                         
                          <Image 
  className="hidden w-full md:block"
  src={food.image || 'default-image-path.jpg'}
  alt=""
/>

<Image 
  className="w-full md:hidden"
  src={food.image || 'default-image-path.jpg'}
  alt=""
/>

                                                        
    
                          </div>
                          <div className="flex flex-col items-start justify-between w-full pb-8 space-y-4 border-b border-gray-200 md:flex-row md:space-y-0">
                            <div className="flex flex-col items-start justify-start w-full space-y-8">
                              <h3 className="text-xl font-semibold leading-6 text-gray-800 xl:text-2xl">
                                {food.name}
                              </h3>
                              <div className="flex flex-col items-start justify-start space-y-2">
                                <p className="text-sm leading-none text-gray-800">
                                  {food.short_description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start justify-between w-full space-x-8">
                              <p className="text-base leading-6 xl:text-lg">
                                {food.price} Kz{" "}
                                <span className="text-red-300 line-through">
                                  {" "}
                                  {food.price} Kz
                                </span>
                              </p>

                              <button
                                onClick={() =>
                                  handleRemove(
                                    food?.id,
                                    item.resName,
                                    item.resImage
                                  )
                                }
                                className="bg-indigo-500 opacity-100 ..."
                              >
                                {" "}
                                Remover
                              </button>

                              <p className="text-base leading-6 text-gray-800 xl:text-lg">
                                Quantidade = {food.quantity}
                              </p>
                              <p className="text-base font-semibold leading-6 text-gray-800 xl:text-lg">
                                {food.price} Kz
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex flex-col items-stretch justify-center w-full space-y-4 md:flex-row md:space-y-0 md:space-x-6 xl:space-x-8">
                    <div className="flex flex-col w-full px-4 py-6 space-y-6 md:p-6 xl:p-8 bg-gray-50 ">
                      <h3 className="text-xl font-semibold leading-5 text-gray-800">
                        Summary
                      </h3>
                      <div className="flex flex-col items-center justify-center w-full pb-4 space-y-4 border-b border-gray-200">
                        <div className="flex justify-between w-full">
                          <p className="text-base leading-4 text-gray-800">
                            Subtotal
                          </p>
                          <p className="text-base leading-4 text-gray-600">
                            {totalPrice}Kz
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <p className="text-base font-semibold leading-4 text-gray-800">
                          Total
                        </p>
                        <p className="text-base font-semibold leading-4 text-gray-600">
                          {totalPrice}Kz
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center w-full px-4 py-6 space-y-6 md:p-6 xl:p-8 bg-gray-50 ">
                      <h3 className="text-xl font-semibold leading-5 text-gray-800">
                        Shipping
                      </h3>
                      <Link href={"/CheckoutScreen"}>
                        <div className="flex items-center justify-center w-full">
                          <button className="py-5 text-base font-medium leading-4 text-white bg-gray-800 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 w-96 md:w-full">
                            continuar para checkout
                          </button>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </>
  );
};

export default CartItem;
