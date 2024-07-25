import React from 'react';
import { FaTruck, FaUserEdit, FaHistory, FaFileInvoice, FaSignOutAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useRouter } from "next/navigation";
import { logoutUser } from '@/redux/slices/authSlice';
import { clearAllCart } from '@/redux/slices/basketSlice';

interface SidebarProps {
  setSelectedMenu: React.Dispatch<React.SetStateAction<string>>;
}

const Sidebar: React.FC<SidebarProps> = ({ setSelectedMenu }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearAllCart());
    router.push("/LoginScreenUser");
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4 text-2xl font-bold">Painel do Usuário</div>
      <ul className="flex-grow">
        <li
          className="p-4 cursor-pointer hover:bg-gray-700 flex items-center"
          onClick={() => setSelectedMenu('trackOrders')}
        >
          <FaTruck className="mr-2" />
          Rastrear Pedidos
        </li>
        <li
          className="p-4 cursor-pointer hover:bg-gray-700 flex items-center"
          onClick={() => setSelectedMenu('updateProfile')}
        >
          <FaUserEdit className="mr-2" />
          Atualizar Perfil
        </li>
        <li
          className="p-4 cursor-pointer hover:bg-gray-700 flex items-center"
          onClick={() => setSelectedMenu('orderHistory')}
        >
          <FaHistory className="mr-2" />
          Histórico de Pedidos
        </li>
        <li
          className="p-4 cursor-pointer hover:bg-gray-700 flex items-center"
          onClick={() => setSelectedMenu('downloadInvoice')}
        >
          <FaFileInvoice className="mr-2" />
          Baixar Fatura
        </li>
      </ul>
      <div
        className="p-4 cursor-pointer hover:bg-gray-700 flex items-center"
        onClick={handleLogout}
      >
        <FaSignOutAlt className="mr-2" />
        Sair
      </div>
    </div>
  );
};

export default Sidebar;
