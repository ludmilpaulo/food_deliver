import React, { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from '../redux/slices/authSlice';
import {
    selectTotalItems,
    selectTotalPrice,
  } from "../redux/slices/basketSlice";

  import Navbar from "@/components/Navbar";

interface Order{
    customer: any;
    driver: any;
    order_details: any;
    address: ReactNode;
    status: ReactNode;
    total: ReactNode;
    restaurant: any;
    id?: number;

}

const OrderHistory = () => {

    const dispatch = useDispatch();
    const user = useSelector(selectUser);

      const [data, setData ]= useState<Order[]>([]);
    

      const orderHistory = async() => {
        let tokenvalue = user?.token;
    
        let response = await fetch('https://www.sunshinedeliver.com/api/customer/order/history/', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                access_token: tokenvalue
              
              })
          })
           .then((response) => response.json())
           .then((responseJson) => {
    
            setData(responseJson.order_history);
           
            })  
            .catch((error) => {
              console.error(error);
            });
    }
    
    useEffect(() =>{
    
      orderHistory();
    
    }, []);
    




    return (
<>
        <Navbar total={undefined} count={undefined}/>

        <div className="bg-bg_image 2xl:container 2xl:mx-auto py-14 px-4 md:px-6 xl:px-20">
             
            <div className="flex flex-col xl:flex-col justify-center items-center space-y-10 xl:space-y-0 xl:space-x-8">
            {data.map((order) =>(

                        

                <div key={order?.id} className="flex justify-center flex-col items-start w-full lg:w-9/12 xl:w-full ">
                   
                    <h3 className="text-3xl xl:text-4xl font-semibold leading-7 xl:leading-9 w-full  md:text-left text-gray-800">Restaurant  {order?.restaurant?.name}</h3>
                    <p className="text-base leading-none mt-4 text-gray-800">
                        Telefone <span className="font-semibold"> {order?.restaurant?.phone}</span>
                    </p>
                   
                    <div className="flex justify-center items-center w-full mt-8  flex-col space-y-4 ">

                        <div className="flex md:flex-row justify-start items-start md:items-center  border border-gray-200 w-full">
                            <div className="w-40 md:w-32">
                                <img className="hidden md:block rounded-full" src={order?.customer?.avatar} alt="girl-in-red-dress" />
                                <img className="md:hidden rounded-full " src={order?.customer?.avatar} alt="girl-in-red-dress" />
                            </div>
                            <div className="flex justify-start md:justify-between items-start md:items-center  flex-col md:flex-row w-full p-4 md:px-8">
                                <div className="flex flex-col md:flex-shrink-0  justify-start items-start">
                                    <h3 className="text-lg md:text-xl  w-full font-semibold leading-6 md:leading-5  text-gray-800"> Cliente : {order?.customer?.name}</h3>
                                    <div className="flex flex-row justify-start  space-x-4 md:space-x-6 items-start mt-4 ">
                                        <p className="text-sm leading-none text-gray-600">
                                            telefone: <span className="text-gray-800"> {order?.customer?.phone}</span>
                                        </p>
                                        <p className="text-sm leading-none text-gray-600">
                                            Endereco: <span className="text-gray-800"> {order?.customer?.address}</span>
                                        </p>
                                    </div>
                                </div>
                               
                            </div>
                        </div>

                        <div className="flex md:flex-row justify-start items-start md:items-center  border border-gray-200 w-full">
                            <div className="w-40 md:w-32 rounded-full">
                                <img className="hidden md:block rounded-full" src={order?.driver?.avatar} alt="girl-in-yellow-dress" />
                                <img className="md:hidden rounded-full " src={order?.driver?.avatar} alt="girl-in-yellow-dress" />
                            </div>
                            <div className="flex justify-start md:justify-between items-start md:items-center  flex-col md:flex-row w-full p-4 md:px-8">
                                <div className="flex flex-col md:flex-shrink-0  justify-start items-start">
                                    <h3 className="text-lg md:text-xl font-semibold leading-6 md:leading-5  text-gray-800"> Motorista : {order?.driver?.name}</h3>
                                    <div className="flex flex-row justify-start  space-x-4 md:space-x-6 items-start mt-4 ">
                                        <p className="text-sm leading-none text-gray-600">
                                            Telephone: <span className="text-gray-800"> {order?.driver?.phone}</span>
                                        </p>
                                        <p className="text-sm leading-none text-gray-600">
                                            Endereco: <span className="text-gray-800"> {order?.driver?.address}</span>
                                        </p>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        {order?.order_details.map((detais: { meal: { name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; price: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }; quantity: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; sub_total: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; })=>(

                                    <div className="flex md:flex-row justify-start items-start md:items-center  border border-gray-200 w-full">
                                  
                                    <div className="flex justify-start md:justify-between items-start md:items-center  flex-col md:flex-row w-full p-4 md:px-8">
                                        <div className="flex flex-col md:flex-shrink-0  justify-start items-start">
                                            <h3 className="text-lg md:text-xl  font-semibold leading-6 md:leading-5  text-gray-800">{detais.meal.name}</h3>
                                            <div className="flex flex-row justify-start  space-x-4 md:space-x-6 items-start mt-4 ">
                                                <p className="text-sm leading-none text-gray-600">
                                                    Preco: <span className="text-gray-800">{detais.meal.price} Kz</span>
                                                </p>
                                                <p className="text-sm leading-none text-gray-600">
                                                    Quantidade: <span className="text-gray-800">{detais?.quantity}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex mt-4 md:mt-0 md:justify-end items-center w-full ">
                                            <p className="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-gray-800">{detais?.sub_total} Kz</p>
                                        </div>
                                    </div>
                                    </div>



                        ))}
                        
                    </div>


                    <div className="flex flex-col justify-start items-start mt-8 xl:mt-10 space-y-10 w-full">
                        <div className="flex justify-start items-start flex-col md:flex-row  w-full md:w-auto space-y-8 md:space-y-0 md:space-x-14 xl:space-x-8  lg:w-full">
                          
                            <div className="flex jusitfy-start items-start flex-col space-y-2">
                                <p className="text-base font-semibold leading-4  text-gray-800">Endereço da Entrega</p>
                                <p className="text-sm leading-5 text-gray-600">{order.address}</p>
                            </div>
                        
                        </div>
                        <div className="flex flex-col space-y-4 w-full">
                            <div className="flex justify-center items-center w-full space-y-4 flex-col border-gray-200 border-b pb-4">
                               
                               
                                <div className="flex justify-between  w-full">
                                    <p className="text-base leading-4 text-gray-800">status do pedido</p>
                                    <p className="text-base font-semibold leading-4 text-gray-600">{order.status}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <p className="text-base font-semibold leading-4 text-gray-800">Total</p>
                                <p className="text-base font-semibold leading-4 text-gray-600">{order.total} Kz</p>
                            </div>
                            <hr/>
                          
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
