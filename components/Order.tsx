import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/redux/slices/authSlice';
import { OrderTypes, basAPI } from '@/configs/variable';

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

    if (window.confirm("Are you sure you want to call the driver")) {
      try {
        const response = await fetch(
          `${basAPI}api/restaurant/status/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user_id, id: orderId }),
          },
        );

        if (response.ok) {
          alert("Product deleted successfully!");
         
        } else {
          alert("Failed to delete product. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(
          "An error occurred while trying to delete the product. Please try again.",
        );
      }
    }
  };

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
  
      if (user?.user_id) {
        try {
          const response = await fetch(
            `${basAPI}api/restaurant/orders/?user_id=${user.user_id}`
          );
          if (response.ok) {
            const data = await response.json();
  
            console.log("Order ==>", data);
            if (data && data.length > 0) {
              setOrders(data);
              setLoading(false);
            }
          } else {
            console.error("Failed to fetch product data");
          }
        } catch (error) {
          console.error("An error occurred:", error);
        }
      }
    };
  
    // Call fetchOrderData immediately when the component mounts
    fetchOrderData();
  
    // Set up an interval to call fetchOrderData every 5 seconds
    const intervalId = setInterval(fetchOrderData, 5000);
  
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [orders, user.user_id]);
  

  return (
    <div className="flex flex-wrap">
    <div className="w-full">
      <div className="card">
        <div className="card-body">
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
                  <th className="px-4 py-2 border">Ação</th> {/* Changed from "Açao" */}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-2 border">{order.id}</td>
                    <td className="px-4 py-2 border">
                      {order.order_details.map((od, index) => (
                        <span key={od.id}>
                          {od.meal.name} {od.meal.price} x {od.quantity} = {od.sub_total}kz
                          {index < order.order_details.length - 1 && <br />} {/* Line break between items */}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-2 border">{order.customer.name}</td>
                    <td className="px-4 py-2 border">{order.driver}</td>
                    <td className="px-4 py-2 border">{order.total}</td>
                    <td className="px-4 py-2 border">{order.status}</td>
                    <td>
                      {order.status === 'Cozinhando' && (
                        <button
                          onClick={() => handleStatus(order?.id || 0)}
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
  </div>
   
  );
};

export default Order;
