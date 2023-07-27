import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectCartItems,
  selectTotalItems,
  selectTotalPrice,
  updateBusket,
} from "../redux/slices/basketSlice";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import { logoutUser, selectUser } from "../redux/slices/authSlice";
import router from "next/router";

interface CartItem {
  id: string; // or number, or whatever the id actually is
  // ...other properties
}


export default function CheckoutScreen() {
  const dispatch = useDispatch();

  const totalPrice = useSelector(selectTotalPrice);

  const allCartItems = useSelector(selectCartItems);

  const user = useSelector(selectUser);

  const [userAddress, setUserAddress] = useState("");
  const [userId, setUserId] = useState<any>();

  const [loading, setLoading] = useState(true);

  const [loadingOrder, setLoadingOrder] = useState(false);

  const tags = Object.keys(allCartItems).reduce((result, key) => {
    return result.concat(allCartItems[key].foods);
  }, []);

  let newA = tags.map(({ id, quantity }) => {
    return { meal_id: id, quantity };
  });

  let resId = allCartItems.map(({ resId }: { resId: any }) => {
    return `${resId}`.toString();
  });
  let restaurantId = resId.toString();

  const onPressBuy = async () => {
    setLoading(true);

    // Success;
    completeOrder();

    setLoading(false);
  };

  const completeOrder = async () => {
    let tokenvalue = user?.token;

    console.log(tokenvalue, "valor do token")

    if (!userAddress) {
      alert("Por favor Preencha o Endereço de Entrega");
    } else {
      let response = await fetch(
        "https://www.sunshinedeliver.com/api/customer/order/add/",
        {
          //mode: "no-cors",
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: user?.token,
            restaurant_id: restaurantId,
            address: userAddress,
            order_details: newA,
          }),
        }
      )
        .then((response) => response.json())
        .then((responseJson) => {
          alert(responseJson.status);
          //alert(responseJson.error);
          console.log("Response", responseJson);
          setTimeout(() => {
            setLoadingOrder(false);
            dispatch(updateBusket([]));
            router.push("/SuccessScreen");
            //  navigation.navigate("SuccessScreen");
          }, 2000);
        })
        .catch((error) => {
          alert("Selecione Comida apenas de um restaurante");
          dispatch(updateBusket([]));
          router.push("/");
          console.log(error);
        });
    }
  };

  return (
    <>
      <div className="overflow-y-hidden">
        <Navbar total={""} count={""} />
        <div className="flex items-center justify-center px-4 2xl:container 2xl:mx-auto lg:py-16 md:py-12 py-9 md:px-6 lg:px-20 xl:px-44 ">
          <div className="flex flex-col items-center justify-center w-full space-y-12 sm:w-9/12 lg:w-full lg:flex-row lg:space-x-10 2xl:space-x-36 lg:space-y-0">
            <div className="flex flex-col items-start justify-start w-full">
              <div>
                <p className="text-3xl font-semibold leading-7 text-gray-800 lg:text-4xl lg:leading-9">
                  Confira
                </p>
              </div>
              <div className="mt-2">
                <Link
                  href={"/CartScreen"}
                  className="text-base leading-4 text-gray-600 underline hover:text-gray-800"
                >
                  De volta à minha bandeja
                </Link>
              </div>
              <div className="mt-12">
                <p className="text-xl font-semibold leading-5 text-gray-800">
                  Detalhes da Entrega
                </p>
              </div>
              <div className="flex flex-col items-start justify-start w-full mt-8 space-y-8 ">
                <input
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  className="w-full px-2 py-4 text-base leading-4 placeholder-gray-600 border-b border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  type="text"
                  placeholder="Por favor, adicione o endereço de entrega"
                />
              </div>
              <button
                onClick={onPressBuy}
                className="w-full py-4 mt-8 text-base font-medium leading-4 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-ocus:ring-gray-800 hover:bg-black md:w-4/12 lg:w-full"
              >
                Proceed to payment
              </button>
            </div>
            {allCartItems?.map((item: CartItem, index: number) => (
              <div key={item.id} className="flex flex-col items-start justify-start w-full p-6 bg-gray-50 md:p-14">
                <div>
                  <h1 className="text-2xl font-semibold leading-6 text-gray-800">
                    Resumo do Pedido
                  </h1>
                </div>
                <div className="flex flex-col items-end w-full space-y-6 mt-7">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-lg leading-4 text-gray-600">
                      Total items
                    </p>
                    <p className="text-lg font-semibold leading-4 text-gray-600">
                      {allCartItems?.length}
                    </p>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <p className="text-lg leading-4 text-gray-600">
                      Sub total{" "}
                    </p>
                    <p className="text-lg font-semibold leading-4 text-gray-600">
                      {totalPrice}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full mt-32">
                  <p className="text-xl font-semibold leading-4 text-gray-800">
                    Estimated Total{" "}
                  </p>
                  <p className="text-lg font-semibold leading-4 text-gray-800">
                    {totalPrice} Kz
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
