import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import {
  MdLaptop,
  MdContacts,
  MdBarChart,
  MdTableBar,
  MdLogout,
} from "react-icons/md";
import { ReactNode, useState } from "react";
import { useDispatch } from "react-redux";

import Products from "./Products";
import { logoutUser } from "@/redux/slices/authSlice";
import { FornecedorType } from "@/configs/variable";
import Order from "./Order";

interface SidebarProps {
  fornecedor: FornecedorType | null;
  onNavClick?: (navItem: string) => void; // Callback function to notify the parent about a menu click
}

const Sidebar: React.FC<SidebarProps> = ({ fornecedor, onNavClick }) => {
  const [showProducts, setShowProducts] = useState(false);
  const [ showOrders, setShowOrders] = useState(false);

  console.log("fonecedordata", fornecedor);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the default navigation behavior
    dispatch(logoutUser());
    router.push("/"); // Replace with the desired path after logout
  };

  return (
    <div className="flex h-screen">
      <nav className="w-64 h-screen p-4 text-white bg-gray-800">
        <ul className="space-y-4">
          {/* Profile Section */}
          <li className="flex items-center space-x-4">
            <div className="relative w-12 h-12">
              <Image
                src={fornecedor?.logo || "/path/to/default/image.png"}
                width={500}
                height={300}
                // layout="fill"
                className="rounded-full"
                alt=""
              />
              <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-400 rounded-full"></span>
            </div>
            <div>
              <h5 className="font-semibold">{fornecedor?.name}</h5>
              <span>{fornecedor?.name}</span>
            </div>
          </li>

          <li className="mt-4 mb-2 text-xs font-semibold tracking-wide uppercase">
            Painel
          </li>

          <li
            className="p-2 rounded hover:bg-blue-500"
            onClick={() => {
              console.log("Produtos clicked!");
              setShowOrders(false); 
              setShowProducts(true)
             // Set showProducts to true when "Produtos" is clicked
            }}
          >
            <Link className="flex items-center space-x-3" href={""}>
              <MdContacts className="text-lg" />
              <span>Produtos</span>
            </Link>
          </li>

          <li
            className="p-2 rounded hover:bg-blue-500"
            onClick={() => {
              setShowProducts(false);
              console.log("Pedidos clicked!"); // Add this
              setShowOrders(true); 
              onNavClick && onNavClick("Pedidos");
            }}
          >
            <Link className="flex items-center space-x-3" href={""}>
              <MdLaptop className="text-lg" />
              <span>Pedidos</span>
            </Link>
          </li>

          <li
            className="p-2 rounded hover:bg-blue-500"
            onClick={() => {
              console.log("Pedidos clicked!"); // Add this
              onNavClick && onNavClick("Pedidos");
            }}
          >
            <Link className="flex items-center space-x-3" href={""}>
              <MdBarChart className="text-lg" />
              <span>Relatórios</span>
            </Link>
          </li>

          <li
            className="p-2 rounded hover:bg-blue-500"
            onClick={() => {
              console.log("Pedidos clicked!"); // Add this
              onNavClick && onNavClick("Pedidos");
            }}
          >
            <Link className="flex items-center space-x-3" href={""}>
              <MdTableBar className="text-lg" />
              <span>Clientes</span>
            </Link>
          </li>

          <li
            className="p-2 rounded hover:bg-blue-500"
            onClick={() => {
              console.log("Pedidos clicked!"); // Add this
              onNavClick && onNavClick("Pedidos");
            }}
          >
            <Link className="flex items-center space-x-3" href={""}>
              <MdBarChart className="text-lg" />
              <span>Motoristas</span>
            </Link>
          </li>

          <li
            className="p-2 rounded hover:bg-blue-500"
            onClick={() => {
              console.log("Pedidos clicked!"); // Add this
              onNavClick && onNavClick("Pedidos");
            }}
          >
            <Link className="flex items-center space-x-3" href={""}>
              <MdContacts className="text-lg" />
              <span>Conta</span>
            </Link>
          </li>

          {/* Menu Items */}

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
        {showProducts && <Products />}{" "}
        {showOrders && <Order />}{" "}
        {/* Conditionally render Products based on showProducts state */}
      </div>
    </div>
  );
};

export default Sidebar;
