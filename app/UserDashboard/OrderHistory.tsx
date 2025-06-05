import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseAPI } from '@/services/types';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logoutUser } from '@/redux/slices/authSlice';
import { useAppSelector } from '@/redux/store';

type OrderDetail = {
  product: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
  sub_total: number;
};

type Order = {
  id: number;
  store: {
    id: number;
    name: string;
    phone: string;
    address: string;
  };
  customer: {
    id: number;
    name: string;
    avatar: string;
    phone: string;
    address: string;
  };
  total: number;
  picked_at: string;
  status: string;
  invoice_pdf: string;
  order_details: OrderDetail[];
};

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const user = useAppSelector(selectUser);
   const token = user?.token || '';

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
       
        if (!token) {
          console.error("Access token not found");
          return;
        }
        const response = await axios.post(`${baseAPI}/customer/customer/order/history/`, {
          access_token: token,
        });
        setOrders(response.data.order_history);
      } catch (error) {
        console.error("Error fetching order history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [token]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Histórico de Pedidos</h1>
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={order.customer.avatar}
                    alt={order.customer.name}
                    width={50}
                    height={50}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{order.store.name}</h2>
                  <p className="text-gray-600">{new Date(order.picked_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-800 font-bold">Total: {order.total} Kz</p>
                <p className={`mt-2 text-sm font-semibold ${order.status === 'Entregue' ? 'text-green-600' : 'text-red-600'}`}>
                  {order.status}
                </p>
                <div className="mt-2">
                  <span
                    onClick={() => window.open(order.invoice_pdf, '_blank')}
                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded mt-2 cursor-pointer hover:bg-blue-600 transition-colors duration-200"
                  >
                    Baixar Fatura
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Detalhes do Pedido</h3>
                <ul className="list-disc list-inside">
                  {order.order_details.map((detail, index) => (
                    <li key={index}>
                      {detail.product.name} - {detail.quantity} x {detail.sub_total}Kz
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
