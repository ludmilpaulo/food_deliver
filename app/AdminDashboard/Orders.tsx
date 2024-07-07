import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MdLaptop } from 'react-icons/md';
import UploadProofOfPayment from './order/UploadProofOfPayment';
import { baseAPI } from '@/services/types';

interface Order {
  id: number;
  customer: string;
  restaurant: string;
  status: string;
  total: number;
  created_at: string;
  invoice_pdf: string | null;
  payment_status_restaurant: string;
  payment_status_driver: string;
  original_price: number;
  driver_commission: number;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterBy, setFilterBy] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${baseAPI}/order/api/orders/?filter_by=${filterBy}`);
        console.log('API Response:', response.data); // Debug: log API response
        setOrders(response.data.orders);
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filterBy]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterBy(event.target.value);
  };

  const handleMarkAsPaid = async (orderId: number, type: 'restaurant' | 'driver') => {
    try {
      const url = `${baseAPI}/order/api/mark_as_paid/${type}/${orderId}/`;
      await axios.post(url);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? type === 'restaurant'
              ? { ...order, payment_status_restaurant: 'paid' }
              : { ...order, payment_status_driver: 'paid' }
            : order
        )
      );
    } catch (err) {
      console.error('Erro ao marcar como pago:', err);
      setError('Failed to mark as paid');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Pedidos</h1>
        <select value={filterBy} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded">
          <option value="all">Todos</option>
          <option value="day">Último Dia</option>
          <option value="week">Última Semana</option>
          <option value="month">Último Mês</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Cliente</th>
                <th className="py-2 px-4">Restaurante</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Total</th>
                <th className="py-2 px-4">Data</th>
                <th className="py-2 px-4">Fatura</th>
                <th className="py-2 px-4">Pagamento Restaurante</th>
                <th className="py-2 px-4">Pagamento Motorista</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="py-2 px-4">{order.id}</td>
                  <td className="py-2 px-4">{order.customer}</td>
                  <td className="py-2 px-4">{order.restaurant}</td>
                  <td className="py-2 px-4">{order.status}</td>
                  <td className="py-2 px-4">{order.total} Kz</td>
                  <td className="py-2 px-4">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="py-2 px-4">
                    {order.invoice_pdf ? (
                      <a href={order.invoice_pdf} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Baixar Fatura
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <p>Status: {order.payment_status_restaurant}</p>
                    <p>Valor: {order.original_price} Kz</p>
                    <UploadProofOfPayment orderId={order.id} uploadUrl={`${baseAPI}/order/api/upload_proof_of_payment/restaurant/${order.id}/`} />
                    {order.payment_status_restaurant === 'unpaid' && (
                      <button
                        onClick={() => handleMarkAsPaid(order.id, 'restaurant')}
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Marcar como Pago
                      </button>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <p>Status: {order.payment_status_driver}</p>
                    <p>Valor: {order.driver_commission} Kz</p>
                    <UploadProofOfPayment orderId={order.id} uploadUrl={`${baseAPI}/order/api/upload_proof_of_payment/driver/${order.id}/`} />
                    {order.payment_status_driver === 'unpaid' && (
                      <button
                        onClick={() => handleMarkAsPaid(order.id, 'driver')}
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Marcar como Pago
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
