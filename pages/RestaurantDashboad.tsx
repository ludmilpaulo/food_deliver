import React, { ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
// Adjust the import path accordingly
import { FornecedorType, basAPI } from "@/configs/variable";
import withAuth from "@/components/ProtectedPage";
import { selectUser } from "@/redux/slices/authSlice";

const RestaurantDashboad: React.FC = () => {
  const user = useSelector(selectUser);
  const [fornecedor, setFornecedor] = useState<FornecedorType | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  console.log("usuario", user);

  useEffect(() => {
    const fetchFornecedorData = async () => {
      if (user?.user_id) {
        try {
          const response = await fetch(
            `${basAPI}/api/get_fornecedor/?user_id=${user.user_id}`,
          );
          if (response.ok) {
            const data = await response.json();

            if (data.fornecedor && data.fornecedor.length > 0) {
              setFornecedor(data.fornecedor[0]);
            }
          } else {
            console.error("Failed to fetch fornecedor data");
          }
        } catch (error) {
          console.error("An error occurred:", error);
        }
      }
    };
    fetchFornecedorData();
  }, [user]);

  return (
    <div className="relative h-full">
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && <Sidebar fornecedor={fornecedor} />}
      {/* Render any other necessary components here */}
    </div>
  );
};

export default withAuth(RestaurantDashboad);
