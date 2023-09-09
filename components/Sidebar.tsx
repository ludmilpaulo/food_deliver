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

type FornecedorType = {
  id: number;
  usuario: number;
  nome_fornecedor: string;
  telefone: string;
  endereco: string;
  logo: string;
  licenca: string;
  aprovado: boolean;
  criado_em: string;
  modificado_em: string;
  children: ReactNode;
};

interface SidebarProps {
  fornecedor: FornecedorType | null;
  onNavClick?: (navItem: string) => void; // Callback function to notify the parent about a menu click
}

const Sidebar: React.FC<SidebarProps> = ({ fornecedor, onNavClick }) => {
  const [showProducts, setShowProducts] = useState(false);

  console.log("fonecedordata", fornecedor)

  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the default navigation behavior
    dispatch(logoutUser());
    router.push("/"); // Replace with the desired path after logout
  };

  return (
    <div className="flex h-screen">
      <nav className="h-screen w-64 bg-gray-800 text-white p-4">
        <ul className="space-y-4">
          {/* Profile Section */}
          <li className="flex items-center space-x-4">
            <div className="w-12 h-12 relative">
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

          <li className="uppercase font-semibold tracking-wide text-xs mt-4 mb-2">
            Painel
          </li>

          <li
            className="hover:bg-blue-500 p-2 rounded"
            onClick={() => {
              console.log("Produtos clicked!");
              setShowProducts(true); // Set showProducts to true when "Produtos" is clicked
            }}
          >
            <Link className="flex items-center space-x-3" href={""}>
              <MdContacts className="text-lg" />
              <span>Produtos</span>
            </Link>
          </li>

          <li
            className="hover:bg-blue-500 p-2 rounded"
            onClick={() => {
              console.log("Pedidos clicked!"); // Add this
              onNavClick && onNavClick("Pedidos");
            }}
          >
            <Link className="flex items-center space-x-3" href={""}>
              <MdLaptop className="text-lg" />
              <span>Produtos</span>
            </Link>
          </li>

          <li
            className="hover:bg-blue-500 p-2 rounded"
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
            className="hover:bg-blue-500 p-2 rounded"
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
            className="hover:bg-blue-500 p-2 rounded"
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
            className="hover:bg-blue-500 p-2 rounded"
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
          <li className="hover:bg-red-500 p-2 rounded mt-4">
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
        {/* Conditionally render Products based on showProducts state */}
      </div>
    </div>
  );
};

export default Sidebar;
