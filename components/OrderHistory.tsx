import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaTimesCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';
import { NextPage } from 'next';
import Link from 'next/link';

type CustomerData = {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  address: string;
};

type RestaurantData = {
  id: number;
  name: string;
  phone: string;
  address: string;
};

type MealData = {
  id: number;
  name: string;
  price: number;
};

type OrderDetailsData = {
  id: number;
  meal: MealData;
  quantity: number;
  sub_total: number;
};

type DriverData = {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  address: string;
};

type OrderHistoryItem = {
  id: number;
  customer: CustomerData;
  restaurant: RestaurantData;
  driver: DriverData;
  order_details: OrderDetailsData[];
  total: number;
  status: string;
  address: string;
};

const OrderHistory: NextPage = () => {
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const router = useRouter();
  const user = useSelector(selectUser);
  let userData = user;

  const fetchOrderHistory = async () => {
    try {
      let response = await fetch('https://www.sunshinedeliver.com/api/customer/order/history/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: user.token,
        }),
      });

      let responseJson = await response.json();

      setOrderHistory(responseJson.order_history);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  return (
    <div>
      <div className="flex-row items-center justify-between p-5">
        <Link href="/Home">
          
          <FaTimesCircle color="#004AAD" size={30} />
       
        </Link>
        <p className="text-lg font-light text-white">Ajuda</p>
      </div>
      <div className="p-4">
        {orderHistory.map((order, index) => (
          <div key={index} className="mb-4 border border-gray-300 p-4 rounded">
            <div className="flex-row items-center mb-2">
              <Image
                src={order.customer.avatar}
                alt={order.customer.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full mr-2"
              />
              <div>
                <p className="font-bold">{order.customer.name}</p>
                <p>{order.customer.phone}</p>
              </div>
            </div>
            <div className="mb-2">
              <p className="font-bold text-lg">{order.driver.name}</p>
              <p className="text-gray-500">{order.driver.phone}</p>
              <p className="font-bold text-green-500">{order.status}</p>
            </div>
            <div className="mb-2">
              {order.order_details.map((detail, detailIndex) => (
                <div key={detailIndex} className="mb-2">
                  <p>{detail.meal.name}</p>
                  <p>Quantity: {detail.quantity}</p>
                  <p>Subtotal: {detail.sub_total}</p>
                </div>
              ))}
            </div>
            <p className="font-bold text-lg mb-2">Total: {order.total}</p>
            <p className="text-gray-500">Address: {order.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
