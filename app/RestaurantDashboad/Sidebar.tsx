import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MdLaptop,
  MdContacts,
  MdBarChart,
  MdTableBar,
  MdLogout,
  MdMenu,
  MdClose,
} from "react-icons/md";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/authSlice";
import { motion } from "framer-motion";
import { FornecedorType } from "@/services/types";
import Order from "./Order";
import Products from "./Products";
import Profile from "./Profile"; // Import Profile component

interface SidebarProps {
  fornecedor: FornecedorType | null;
  onNavClick?: (navItem: string) => void; // Callback function to notify the parent about a menu click
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ fornecedor, onNavClick, isOpen, onToggle }) => {
  const [showProducts, setShowProducts] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // State for profile view
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(logoutUser());
    router.push("/");
  };

  return (
    <><div className="flex h-full">
          <div className={`fixed inset-0 z-40 md:relative md:z-auto md:flex ${isOpen ? "flex" : "hidden"} h-full`}>
              <nav className="w-64 h-full bg-blue-500 text-white p-4 flex flex-col">
                  <button onClick={onToggle} className="md:hidden text-2xl text-white mb-4 self-end">
                      <MdClose />
                  </button>
                  <div className="mb-6">
                      <div className="flex items-center space-x-4">
                          <div className="relative w-12 h-12">
                              <Image
                                  src={fornecedor?.logo || "/path/to/default/image.png"}
                                  width={500}
                                  height={300}
                                  className="rounded-full"
                                  alt="Fornecedor Logo" />
                              <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-400 rounded-full"></span>
                          </div>
                          <div>
                              <h5 className="font-semibold">{fornecedor?.name}</h5>
                              <span>{fornecedor?.name}</span>
                          </div>
                      </div>
                  </div>
                  <div className="flex-1">
                      <ul className="space-y-4">
                          <li className="text-xs font-semibold tracking-wide uppercase">
                              Painel
                          </li>
                          <motion.li
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 rounded hover:bg-blue-500 cursor-pointer"
                              onClick={() => {
                                  setShowOrders(false);
                                  setShowProducts(true);
                                  setShowProfile(false);
                                  onToggle();
                              } }
                          >
                              <div className="flex items-center space-x-3">
                                  <MdContacts className="text-lg" />
                                  <span>Produtos</span>
                              </div>
                          </motion.li>
                          <motion.li
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 rounded hover:bg-blue-500 cursor-pointer"
                              onClick={() => {
                                  setShowProducts(false);
                                  setShowOrders(true);
                                  setShowProfile(false);
                                  onNavClick && onNavClick("Pedidos");
                                  onToggle();
                              } }
                          >
                              <div className="flex items-center space-x-3">
                                  <MdLaptop className="text-lg" />
                                  <span>Pedidos</span>
                              </div>
                          </motion.li>
                          <motion.li
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 rounded hover:bg-blue-500 cursor-pointer"
                              onClick={() => {
                                  onNavClick && onNavClick("Relatórios");
                                  setShowProfile(false);
                                  onToggle();
                              } }
                          >
                              <div className="flex items-center space-x-3">
                                  <MdBarChart className="text-lg" />
                                  <span>Relatórios</span>
                              </div>
                          </motion.li>
                          <motion.li
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 rounded hover:bg-blue-500 cursor-pointer"
                              onClick={() => {
                                  onNavClick && onNavClick("Clientes");
                                  setShowProfile(false);
                                  onToggle();
                              } }
                          >
                              <div className="flex items-center space-x-3">
                                  <MdTableBar className="text-lg" />
                                  <span>Clientes</span>
                              </div>
                          </motion.li>
                          <motion.li
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 rounded hover:bg-blue-500 cursor-pointer"
                              onClick={() => {
                                  onNavClick && onNavClick("Motoristas");
                                  setShowProfile(false);
                                  onToggle();
                              } }
                          >
                              <div className="flex items-center space-x-3">
                                  <MdBarChart className="text-lg" />
                                  <span>Motoristas</span>
                              </div>
                          </motion.li>
                          <motion.li
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 rounded hover:bg-blue-500 cursor-pointer"
                              onClick={() => {
                                  setShowProfile(true);
                                  setShowProducts(false);
                                  setShowOrders(false);
                                  onNavClick && onNavClick("Conta");
                                  onToggle();
                              } }
                          >
                              <div className="flex items-center space-x-3">
                                  <MdContacts className="text-lg" />
                                  <span>Perfil</span>
                              </div>
                          </motion.li>
                      </ul>
                  </div>
                  <div>
                      <motion.li
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 mt-4 rounded hover:bg-red-500 cursor-pointer"
                          onClick={handleLogout}
                      >
                          <div className="flex items-center space-x-3 text-red-400">
                              <MdLogout className="text-lg" />
                              <span>Sair</span>
                          </div>
                      </motion.li>
                  </div>
              </nav>
          </div>

      </div><div className="flex-1 overflow-y-auto p-4 bg-gray-100">
              {showProducts && <Products />}
              {showOrders && <Order />}
              {showProfile && <Profile />} {/* Show Profile when showProfile is true */}
          </div></>
  );
};

export default Sidebar;
