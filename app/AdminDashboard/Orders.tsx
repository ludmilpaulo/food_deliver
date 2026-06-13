import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MdLaptop } from 'react-icons/md';
import UploadProofOfPayment from './order/UploadProofOfPayment';
import { baseAPI } from '@/services/types';
import { useTranslation } from "@/hooks/useTranslation";

interface Order {
  id: number;
  customer: string;
  store: string;
  status: string;
  total: number;
  created_at: string;
  invoice_pdf: string | null;
  payment_status_store: string;
  payment_status_driver: string;
  original_price: number;
  driver_commission: number;
}

const Orders: React.FC = () => {
  const { t } = useTranslation();
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
        setError(t("failedToFetchOrders", "Failed to fetch orders"));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filterBy]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterBy(event.target.value);
  };

  const handleMarkAsPaid = async (orderId: number, type: 'store' | 'driver') => {
    try {
      const url = `${baseAPI}/order/api/mark_as_paid/${type}/${orderId}/`;
      await axios.post(url);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? type === 'store'
              ? { ...order, payment_status_store: 'paid' }
              : { ...order, payment_status_driver: 'paid' }
            : order
        )
      );
    } catch (err) {
      console.error('Erro ao marcar como pago:', err);
      setError(t("failedToMarkAsPaid", "Failed to mark as paid"));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">{t("orders", "Orders")}</h1>
        <select value={filterBy} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded">
          <option value="all">{t("all", "All")}</option>
          <option value="day">{t("lastDay", "Last Day")}</option>
          <option value="week">{t("lastWeek", "Last Week")}</option>
          <option value="month">{t("lastMonth", "Last Month")}</option>
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
                <th className="py-2 px-4">{t("id", "ID")}</th>
                <th className="py-2 px-4">{t("customer", "Customer")}</th>
                <th className="py-2 px-4">{t("store", "Store")}</th>
                <th className="py-2 px-4">{t("status", "Status")}</th>
                <th className="py-2 px-4">{t("Total", "Total")}</th>
                <th className="py-2 px-4">{t("date", "Date")}</th>
                <th className="py-2 px-4">{t("invoice", "Invoice")}</th>
                <th className="py-2 px-4">{t("storePayment", "Store Payment")}</th>
                <th className="py-2 px-4">{t("driverPayment", "Driver Payment")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="py-2 px-4">{order.id}</td>
                  <td className="py-2 px-4">{order.customer}</td>
                  <td className="py-2 px-4">{order.store}</td>
                  <td className="py-2 px-4">{order.status}</td>
                  <td className="py-2 px-4">{order.total} Kz</td>
                  <td className="py-2 px-4">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="py-2 px-4">
                    {order.invoice_pdf ? (
                      <a href={order.invoice_pdf} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {t("downloadInvoice", "Download Invoice")}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <p>Status: {order.payment_status_store}</p>
                    <p>Valor: {order.original_price} Kz</p>
                    <UploadProofOfPayment orderId={order.id} uploadUrl={`${baseAPI}/order/api/upload_proof_of_payment/store/${order.id}/`} />
                    {order.payment_status_store === 'unpaid' && (
                      <button
                        onClick={() => handleMarkAsPaid(order.id, 'store')}
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        {t("markAsPaid", "Mark as Paid")}
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
                        {t("markAsPaid", "Mark as Paid")}
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
