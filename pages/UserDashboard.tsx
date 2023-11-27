import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import {
  MdContacts,
  MdLogout,
} from "react-icons/md";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { logoutUser, selectUser } from "@/redux/slices/authSlice";
import { FornecedorType, UserDetails, basAPI } from "@/configs/variable";
import UserProfile from "@/components/UserProfile";
import Nav from "@/components/Nav";
import OrderHistory from "@/components/OrderHistory";

interface SidebarProps {
  fornecedor: FornecedorType | null;
  onNavClick?: (navItem: string) => void; // Callback function to notify the parent about a menu click
}

const UserDashboard: React.FC<SidebarProps> = ({ fornecedor, onNavClick }) => {
  const [showProducts, setShowProducts] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const user = useSelector(selectUser);

  const [ showOrderHistory, setShowOrderHistory] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`${basAPI}api/customer/profile/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.user_id,
        }),
      });

      if (res.ok) {
        const resJson = await res.json();
        setUserDetails(resJson.customer_detais);
      } else {
        dispatch(logoutUser());
        console.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails, userDetails]);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the default navigation behavior
    dispatch(logoutUser());
    router.push("/"); // Replace with the desired path after logout
  };

  return (
    <><Nav /><div className="flex h-screen">

      <nav className="w-64 h-screen p-4 text-white bg-gray-800">
        <ul className="space-y-4">
          {/* Profile Section */}
          {userDetails && (
            <li className="flex items-center space-x-4">
              <div className="relative w-12 h-12">
                <Image
                  src={`${basAPI}${userDetails?.avatar || "/path/to/default/image.png"}`}
                  width={500}
                  height={300}
                  className="rounded-full"
                  alt="" />
                <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-400 rounded-full"></span>
              </div>
              <div>
                <h5 className="font-semibold">{user?.username}</h5>
                {userDetails.phone && <span>{userDetails.phone}</span>}
                {/* Display address only if it exists */}
              </div>
            </li>
          )}

          <li className="mt-4 mb-2 text-xs font-semibold tracking-wide uppercase">
            Painel
          </li>

          <li
            className="p-2 rounded hover:bg-blue-500"
            onClick={() => {
              console.log("Atualizar o Perfil clicked!");
              setShowProducts(true);
              setShowOrderHistory(false);
            } }
          >
            <Link className="flex items-center space-x-3" href={""}>
              <MdContacts className="text-lg" />
              <span>Atualizar o Perfil</span>
            </Link>
          </li>

          <li
            className="p-2 rounded hover:bg-blue-500"
            onClick={() => {
              console.log("Atualizar o Perfil clicked!");
              setShowProducts(false);
              setShowOrderHistory(true);
            } }
          >
            <Link className="flex items-center space-x-3" href={""}>
              <MdContacts className="text-lg" />
              <span>Meu Pedido</span>
            </Link>
          </li>

          {/* Rest of the menu items */}

          {/* Logout */}
          <li className="p-2 mt-4 rounded hover:bg-red-500">
            <Link href="">
              <div
                onClick={handleLogout}
                className="flex items-center space-x-3 text-red-400 cursor-pointer"
              >
                <MdLogout className="text-lg" />
                <span>Sair</span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="flex-1 overflow-y-auto bg-gray-100">
        {showProducts && <UserProfile />}
        {showOrderHistory && <OrderHistory />}
      </div>
    </div></>
  );
};

export default UserDashboard;
