import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from '../redux/slices/authSlice';

const OrderHistory = () => {

    const dispatch = useDispatch();
    const user = useSelector(selectUser);

      const [data, setData ]= useState({
        "order_history": [
            {
                "id": 2,
                "customer": {
                    "id": 1,
                    "name": "Antonio jorge",
                    "avatar": "https://www.sunshinedeliver.com/media/customer/8901DF9D-710E-44D6-BF63-89D571349CDE_A3jy24a.jpg",
                    "phone": "0842368752",
                    "address": "luand-angole"
                },
                "restaurant": {
                    "id": 1,
                    "name": "LUNATHA MKHOSANA",
                    "phone": "0784161307",
                    "address": "10 kent street Maitland"
                },
                "driver": {
                    "id": 1,
                    "name": "Enio Antonio",
                    "avatar": "https://www.sunshinedeliver.com/media/driver/113d82b7-33d9-4668-bb94-f966aa01b26b.jpg",
                    "phone": "0842368752",
                    "address": "21 royal road Maitland "
                },
                "order_details": [
                    {
                        "id": 3,
                        "meal": {
                            "id": 1,
                            "name": "ludmil paulo",
                            "price": 2
                        },
                        "quantity": 4,
                        "sub_total": 8
                    },
                    {
                        "id": 4,
                        "meal": {
                            "id": 2,
                            "name": "ultimate",
                            "price": 4
                        },
                        "quantity": 2,
                        "sub_total": 8
                    }
                ],
                "total": 16,
                "status": "Entregue",
                "address": "21 royal road maitland"
            }
        ]
    });
      const [driverData, setdriverData] = useState();
      const [restaurantData, setRestaurantData] = useState([{}]);
      const [orderData, setOrderData] = useState([{}]);

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
            setdriverData(responseJson.order_history.driver);
            setRestaurantData(responseJson.order_history.restaurant);
            setOrderData(responseJson.order_history.order_details);
            })  
            .catch((error) => {
              console.error(error);
            });
    }
    
    useEffect(() =>{

        console.log("order data+>", driverData)
    
      orderHistory();
    
    }, []);
    




    return (

       

        <div className="bg-bg_image 2xl:container 2xl:mx-auto py-14 px-4 md:px-6 xl:px-20">
            <div className="flex flex-col xl:flex-row justify-center items-center space-y-10 xl:space-y-0 xl:space-x-8">
               
                <div className="flex justify-center flex-col items-start w-full lg:w-9/12 xl:w-full ">
                    <h3 className="text-3xl xl:text-4xl font-semibold leading-7 xl:leading-9 w-full  md:text-left text-gray-800">Order Summary</h3>
                    <p className="text-base leading-none mt-4 text-gray-800">
                        Paid using credit card ending with <span className="font-semibold">8822</span>
                    </p>
                    <div className="flex justify-center items-center w-full mt-8  flex-col space-y-4 ">
                        <div className="flex md:flex-row justify-start items-start md:items-center  border border-gray-200 w-full">
                            <div className="w-40 md:w-32">
                                <img className="hidden md:block" src="https://i.ibb.co/wWp4m6W/Rectangle-8.png" alt="girl-in-red-dress" />
                                <img className="md:hidden " src="https://i.ibb.co/f8pyz8q/Rectangle-8.png" alt="girl-in-red-dress" />
                            </div>
                            <div className="flex justify-start md:justify-between items-start md:items-center  flex-col md:flex-row w-full p-4 md:px-8">
                                <div className="flex flex-col md:flex-shrink-0  justify-start items-start">
                                    <h3 className="text-lg md:text-xl  w-full font-semibold leading-6 md:leading-5  text-gray-800">Premium Quaility Red Dress</h3>
                                    <div className="flex flex-row justify-start  space-x-4 md:space-x-6 items-start mt-4 ">
                                        <p className="text-sm leading-none text-gray-600">
                                            Size: <span className="text-gray-800"> Small</span>
                                        </p>
                                        <p className="text-sm leading-none text-gray-600">
                                            Quantity: <span className="text-gray-800"> 01</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex mt-4 md:mt-0 md:justify-end items-center w-full ">
                                    <p className="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-gray-800">$28.00</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex md:flex-row justify-start items-start md:items-center  border border-gray-200 w-full">
                            <div className="w-40 md:w-32">
                                <img className="hidden md:block" src="https://i.ibb.co/3ftbsMT/Rectangle-8-1.png" alt="girl-in-yellow-dress" />
                                <img className="md:hidden " src="https://i.ibb.co/D79dzHg/Rectangle-8.png" alt="girl-in-yellow-dress" />
                            </div>
                            <div className="flex justify-start md:justify-between items-start md:items-center  flex-col md:flex-row w-full p-4 md:px-8">
                                <div className="flex flex-col md:flex-shrink-0  justify-start items-start">
                                    <h3 className="text-lg md:text-xl font-semibold leading-6 md:leading-5  text-gray-800">Premium Quaility Yellow Dress</h3>
                                    <div className="flex flex-row justify-start  space-x-4 md:space-x-6 items-start mt-4 ">
                                        <p className="text-sm leading-none text-gray-600">
                                            Size: <span className="text-gray-800"> Small</span>
                                        </p>
                                        <p className="text-sm leading-none text-gray-600">
                                            Quantity: <span className="text-gray-800"> 01</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex mt-4 md:mt-0 md:justify-end items-center w-full ">
                                    <p className="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-gray-800">$28.00</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex md:flex-row justify-start items-start md:items-center  border border-gray-200 w-full">
                            <div className="w-40 md:w-32">
                                <img className="hidden md:block" src="https://i.ibb.co/C7M7Mvx/Rectangle-8-2.png" alt="girl-in-white-dress" />
                                <img className="md:hidden " src="https://i.ibb.co/MsbCZNJ/Rectangle-8.png" alt="girl-in-white-dress" />
                            </div>
                            <div className="flex justify-start md:justify-between items-start md:items-center  flex-col md:flex-row w-full p-4 md:px-8">
                                <div className="flex flex-col md:flex-shrink-0  justify-start items-start">
                                    <h3 className="text-lg md:text-xl  font-semibold leading-6 md:leading-5  text-gray-800">Premium Quaility White Dress</h3>
                                    <div className="flex flex-row justify-start  space-x-4 md:space-x-6 items-start mt-4 ">
                                        <p className="text-sm leading-none text-gray-600">
                                            Size: <span className="text-gray-800"> Small</span>
                                        </p>
                                        <p className="text-sm leading-none text-gray-600">
                                            Quantity: <span className="text-gray-800"> 01</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex mt-4 md:mt-0 md:justify-end items-center w-full ">
                                    <p className="text-xl lg:text-2xl font-semibold leading-5 lg:leading-6 text-gray-800">$28.00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-start items-start mt-8 xl:mt-10 space-y-10 w-full">
                        <div className="flex justify-start items-start flex-col md:flex-row  w-full md:w-auto space-y-8 md:space-y-0 md:space-x-14 xl:space-x-8  lg:w-full">
                            <div className="flex jusitfy-start items-start flex-col space-y-2">
                                <p className="text-base font-semibold leading-4  text-gray-800">Billing Address</p>
                                <p className="text-sm leading-5 text-gray-600">180 North King Street, Northhampton MA 1060</p>
                            </div>
                            <div className="flex jusitfy-start items-start flex-col space-y-2">
                                <p className="text-base font-semibold leading-4  text-gray-800">Shipping Address</p>
                                <p className="text-sm leading-5 text-gray-600">180 North King Street, Northhampton MA 1060</p>
                            </div>
                            <div className="flex jusitfy-start items-start flex-col space-y-2">
                                <p className="text-base font-semibold leading-4  text-gray-800">Shipping Method</p>
                                <p className="text-sm leading-5 text-gray-600">DHL - Takes up to 3 working days</p>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-4 w-full">
                            <div className="flex justify-center items-center w-full space-y-4 flex-col border-gray-200 border-b pb-4">
                                <div className="flex justify-between  w-full">
                                    <p className="text-base leading-4 text-gray-800">Subtotal</p>
                                    <p className="text-base leading-4 text-gray-600">$56.00</p>
                                </div>
                                <div className="flex justify-between  w-full">
                                    <p className="text-base leading-4 text-gray-800">
                                        Discount <span className="bg-gray-200 p-1 text-xs font-medium leading-3  text-gray-800">STUDENT</span>
                                    </p>
                                    <p className="text-base leading-4 text-gray-600">-$28.00 (50%)</p>
                                </div>
                                <div className="flex justify-between  w-full">
                                    <p className="text-base leading-4 text-gray-800">Shipping</p>
                                    <p className="text-base leading-4 text-gray-600">$8.00</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <p className="text-base font-semibold leading-4 text-gray-800">Total</p>
                                <p className="text-base font-semibold leading-4 text-gray-600">$36.00</p>
                            </div>
                            <div className="flex w-full justify-center items-center pt-1 md:pt-4  xl:pt-8 space-y-6 md:space-y-8 flex-col">
                                <button className="py-5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800  w-full text-base font-medium leading-4 text-white bg-gray-800 hover:bg-black">Track Your Order</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
