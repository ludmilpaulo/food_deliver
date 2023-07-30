import React, { ReactNode, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import {
  selectTotalItems,
  selectTotalPrice,
} from "../redux/slices/basketSlice";

import Navbar from "@/components/Navbar";

interface Order {
  customer: any;
  driver: any;
  order_details: any;
  address: ReactNode;
  status: ReactNode;
  total: ReactNode;
  restaurant: any;
  id?: number;
}

interface OrderDetails {
  meal: {
    name: string | ReactNode;
    price: string | ReactNode;
  };
  quantity: string | ReactNode;
  sub_total: string | ReactNode;
}

const OrderHistory = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [data, setData] = useState<Order[]>([]);

  const orderHistory = useCallback(async () => {
    let tokenvalue = user?.token;

    let response = await fetch(
      "https://www.sunshinedeliver.com/api/customer/order/history/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: tokenvalue,
        }),
      },
    )
      .then((response) => response.json())
      .then((responseJson) => {
        setData(responseJson.order_history);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [user?.token]); // Assuming tokenvalue is a dependency

  useEffect(() => {
    orderHistory();
  }, [orderHistory]);

  return (
    <>
      <Navbar total={undefined} count={undefined} />

      <div className="px-4 bg-bg_image 2xl:container 2xl:mx-auto py-14 md:px-6 xl:px-20">
        <div className="flex flex-col items-center justify-center space-y-10 xl:flex-col xl:space-y-0 xl:space-x-8">
          {data.map((order) => (
            <div
              key={order?.id}
              className="flex flex-col items-start justify-center w-full lg:w-9/12 xl:w-full "
            >
              <h3 className="w-full text-3xl font-semibold leading-7 text-gray-800 xl:text-4xl xl:leading-9 md:text-left">
                Restaurant {order?.restaurant?.name}
              </h3>
              <p className="mt-4 text-base leading-none text-gray-800">
                Telefone{" "}
                <span className="font-semibold">
                  {" "}
                  {order?.restaurant?.phone}
                </span>
              </p>

              <div className="flex flex-col items-center justify-center w-full mt-8 space-y-4 ">
                <div className="flex items-start justify-start w-full border border-gray-200 md:flex-row md:items-center">
                  <div className="w-40 md:w-32">
                    <Image
                      className="hidden rounded-full md:block"
                      src={order?.customer?.avatar}
                      alt="girl-in-red-dress"
                      width={500} // Or whatever width you want
                      height={500} // Or whatever height you want
                    />
                  </div>
                  <div className="flex flex-col items-start justify-start w-full p-4 md:justify-between md:items-center md:flex-row md:px-8">
                    <div className="flex flex-col items-start justify-start md:flex-shrink-0">
                      <h3 className="w-full text-lg font-semibold leading-6 text-gray-800 md:text-xl md:leading-5">
                        {" "}
                        Cliente : {order?.customer?.name}
                      </h3>
                      <div className="flex flex-row items-start justify-start mt-4 space-x-4 md:space-x-6 ">
                        <p className="text-sm leading-none text-gray-600">
                          telefone:{" "}
                          <span className="text-gray-800">
                            {" "}
                            {order?.customer?.phone}
                          </span>
                        </p>
                        <p className="text-sm leading-none text-gray-600">
                          Endereco:{" "}
                          <span className="text-gray-800">
                            {" "}
                            {order?.customer?.address}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-start w-full border border-gray-200 md:flex-row md:items-center">
                  <div className="w-40 rounded-full md:w-32">
                    <Image
                      className="hidden rounded-full md:block"
                      src={order?.customer?.avatar}
                      alt="girl-in-red-dress"
                      width={500} // Or whatever width you want
                      height={500} // Or whatever height you want
                    />
                  </div>
                  <div className="flex flex-col items-start justify-start w-full p-4 md:justify-between md:items-center md:flex-row md:px-8">
                    <div className="flex flex-col items-start justify-start md:flex-shrink-0">
                      <h3 className="text-lg font-semibold leading-6 text-gray-800 md:text-xl md:leading-5">
                        {" "}
                        Motorista : {order?.driver?.name}
                      </h3>
                      <div className="flex flex-row items-start justify-start mt-4 space-x-4 md:space-x-6 ">
                        <p className="text-sm leading-none text-gray-600">
                          Telephone:{" "}
                          <span className="text-gray-800">
                            {" "}
                            {order?.driver?.phone}
                          </span>
                        </p>
                        <p className="text-sm leading-none text-gray-600">
                          Endereco:{" "}
                          <span className="text-gray-800">
                            {" "}
                            {order?.driver?.address}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {order?.order_details.map(
                  (detais: OrderDetails, index: number) => (
                    <div
                      key={index}
                      className="flex items-start justify-start w-full border border-gray-200 md:flex-row md:items-center"
                    >
                      <div className="flex flex-col items-start justify-start w-full p-4 md:justify-between md:items-center md:flex-row md:px-8">
                        <div className="flex flex-col items-start justify-start md:flex-shrink-0">
                          <h3 className="text-lg font-semibold leading-6 text-gray-800 md:text-xl md:leading-5">
                            {detais.meal.name}
                          </h3>
                          <div className="flex flex-row items-start justify-start mt-4 space-x-4 md:space-x-6 ">
                            <p className="text-sm leading-none text-gray-600">
                              Preco:{" "}
                              <span className="text-gray-800">
                                {detais.meal.price} Kz
                              </span>
                            </p>
                            <p className="text-sm leading-none text-gray-600">
                              Quantidade:{" "}
                              <span className="text-gray-800">
                                {detais?.quantity}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center w-full mt-4 md:mt-0 md:justify-end ">
                          <p className="text-xl font-semibold leading-5 text-gray-800 lg:text-2xl lg:leading-6">
                            {detais?.sub_total} Kz
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="flex flex-col items-start justify-start w-full mt-8 space-y-10 xl:mt-10">
                <div className="flex flex-col items-start justify-start w-full space-y-8 md:flex-row md:w-auto md:space-y-0 md:space-x-14 xl:space-x-8 lg:w-full">
                  <div className="flex flex-col items-start space-y-2 jusitfy-start">
                    <p className="text-base font-semibold leading-4 text-gray-800">
                      Endereço da Entrega
                    </p>
                    <p className="text-sm leading-5 text-gray-600">
                      {order.address}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col w-full space-y-4">
                  <div className="flex flex-col items-center justify-center w-full pb-4 space-y-4 border-b border-gray-200">
                    <div className="flex justify-between w-full">
                      <p className="text-base leading-4 text-gray-800">
                        status do pedido
                      </p>
                      <p className="text-base font-semibold leading-4 text-gray-600">
                        {order.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <p className="text-base font-semibold leading-4 text-gray-800">
                      Total
                    </p>
                    <p className="text-base font-semibold leading-4 text-gray-600">
                      {order.total} Kz
                    </p>
                  </div>
                  <hr />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default OrderHistory;
