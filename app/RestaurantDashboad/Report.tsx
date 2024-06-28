import { selectUser } from "@/redux/slices/authSlice";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { baseAPI } from "@/services/types";

// Dynamically import ApexCharts to prevent SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ReportData {
  revenue: number[];
  orders: number[];
  products?: { labels: string[]; data: number[] };
  drivers?: { labels: string[]; data: number[] };
  customers?: { labels: string[]; data: number[] };
}

const Report: React.FC = () => {
  const [data, setData] = useState<ReportData>({
    revenue: [],
    orders: [],
    products: { labels: [], data: [] },
    drivers: { labels: [], data: [] },
    customers: { labels: [], data: [] },
  });

  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseAPI}/report/restaurant/${user.user_id}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const responseData: ReportData = await response.json();
        setData(responseData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Relatório da loja</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">Rendimento</h2>
          </div>
          <div className="p-4">
            <Chart
              options={{
                chart: { id: "revenue-chart" },
                xaxis: {
                  categories: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
                },
              }}
              series={[{ name: "Revenue", data: data.revenue }]}
              type="bar"
            />
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">
              Número de encomendas
            </h2>
          </div>
          <div className="p-4">
            <Chart
              options={{
                chart: { id: "orders-chart" },
                xaxis: {
                  categories: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
                },
              }}
              series={[{ name: "Number of Orders", data: data.orders }]}
              type="bar"
            />
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">
              3 principais produtos
            </h2>
          </div>
          <div className="p-4">
            {data.products && (
              <Chart
                options={{ labels: data.products.labels }}
                series={[{ data: data.products.data }]}
                type="pie"
              />
            )}
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">
              3 principais motoristas
            </h2>
          </div>
          <div className="p-4">
            {data.drivers && (
              <Chart
                options={{ labels: data.drivers.labels }}
                series={[{ data: data.drivers.data }]}
                type="pie"
              />
            )}
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">
              3 principais clientes
            </h2>
          </div>
          <div className="p-4">
            {data.customers && (
              <Chart
                options={{ labels: data.customers.labels }}
                series={[{ data: data.customers.data }]}
                type="pie"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;