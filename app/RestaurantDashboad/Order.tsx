import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/redux/slices/authSlice';
import { OrderTypes } from '@/services/types';
import { fetchOrders, updateOrderStatus } from '@/services/apiService';
import { Transition } from '@headlessui/react';

const Order = () => {
  const [orders, setOrders] = useState<OrderTypes[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector(selectUser);

  const handleStatus = async (orderId: number) => {
    const user_id = user?.user_id;

    if (!user_id) {
      alert("User ID not provided.");
      return;
    }

    if (window.confirm("Are you sure you want to call the driver?")) {
      try {
        await updateOrderStatus(user_id, orderId);
        alert("Driver called successfully!");
        fetchOrderData();
      } catch (error) {
        console.error("Error updating order status:", error);
        alert("Failed to update order status. Please try again.");
      }
    }
  };

  const fetchOrderData = async () => {
    setLoading(true);

    if (user?.user_id) {
      try {
        const data = await fetchOrders(user.user_id);
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  };

  useEffect(() => {
    fetchOrderData();

    const intervalId = setInterval(fetchOrderData, 5000);

    return () => clearInterval(intervalId);
  }, [user.user_id]);

  return (
    <div className="container mx-auto px-4">
      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full">
          <div className="w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Transition>

      {!loading && (
        <div className="flex flex-wrap -mx-2">
          <div className="w-full px-2 mb-4">
            <div className="bg-white border rounded-lg p-4 shadow">
              <div className="table-responsive">
                <table className="min-w-full bg-white border rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border">No</th>
                      <th className="px-4 py-2 border">Detalhes do Pedido</th>
                      <th className="px-4 py-2 border">Cliente</th>
                      <th className="px-4 py-2 border">Motorista</th>
                      <th className="px-4 py-2 border">Total</th>
                      <th className="px-4 py-2 border">Status</th>
                      <th className="px-4 py-2 border">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border">{order.id}</td>
                        <td className="px-4 py-2 border">
                          {order.order_details.map((od, index) => (
                            <span key={od.id}>
                              {od.meal.name} {od.meal.price} x {od.quantity} = {od.sub_total}kz
                              {index < order.order_details.length - 1 && <br />}
                            </span>
                          ))}
                        </td>
                        <td className="px-4 py-2 border">{order.customer.name}</td>
                        <td className="px-4 py-2 border">{order.driver}</td>
                        <td className="px-4 py-2 border">{order.total}</td>
                        <td className="px-4 py-2 border">{order.status}</td>
                        <td className="px-4 py-2 border">
                          {order.status === 'Cozinhando' && (
                            <button
                              onClick={() => handleStatus(order.id)}
                              className="px-4 py-2 ml-4 text-white bg-blue-500 rounded hover:bg-blue-600"
                            >
                              Chamar Motorista
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
