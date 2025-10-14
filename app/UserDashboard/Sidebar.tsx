import React, { useState } from "react";
import {
  FaTruck,
  FaUserEdit,
  FaHistory,
  FaFileInvoice,
  FaSignOutAlt,
  FaUserSlash,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/redux/slices/authSlice";
import { clearAllCart } from "@/redux/slices/basketSlice";
import { t, getLanguage } from "@/configs/i18n";

interface SidebarProps {
  selectedMenu: string;
  setSelectedMenu: React.Dispatch<React.SetStateAction<string>>;
  onDeactivate?: () => void;
}

const menuItems = [
  {
    key: "trackOrders",
    icon: <FaTruck size={18} />,
    label: { en: "Track Orders", pt: "Rastrear Pedidos" },
  },
  {
    key: "trackDelivery",
    icon: <FaTruck size={18} />,
    label: { en: "Track Delivery", pt: "Rastrear Entrega" },
  },
  {
    key: "updateProfile",
    icon: <FaUserEdit size={18} />,
    label: { en: "Update Profile", pt: "Atualizar Perfil" },
  },
  {
    key: "orderHistory",
    icon: <FaHistory size={18} />,
    label: { en: "Order History", pt: "Histórico de Pedidos" },
  },
  {
    key: "serviceBookings",
    icon: <FaHistory size={18} />,
    label: { en: "Service Bookings", pt: "Agendamentos" },
  },
  {
    key: "downloadInvoice",
    icon: <FaFileInvoice size={18} />,
    label: { en: "Download Invoice", pt: "Baixar Fatura" },
  },
  {
    key: "deactivateAccount",
    icon: <FaUserSlash size={18} />,
    label: { en: "Deactivate Account", pt: "Desativar Conta" },
    danger: true,
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  selectedMenu,
  setSelectedMenu,
  onDeactivate,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const lang = getLanguage();

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearAllCart());
    router.push("/LoginScreenUser");
  };

  return (
    <aside className="h-screen w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-600 text-white shadow-2xl flex flex-col sticky top-0 z-30 rounded-r-3xl border-r-2 border-blue-200">
      <div className="py-7 px-8 text-3xl font-black tracking-wide bg-blue-950/80 rounded-tr-3xl rounded-br-3xl mb-4 drop-shadow-xl shadow-blue-800 text-center">
        {lang === "pt" ? "Painel do Usuário" : "User Dashboard"}
      </div>
      <nav className="flex-1 flex flex-col gap-1 px-2">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() =>
              item.key === "deactivateAccount"
                ? onDeactivate && onDeactivate()
                : setSelectedMenu(item.key)
            }
            className={`flex items-center gap-3 rounded-2xl px-6 py-3 text-lg font-semibold transition-all
              ${
                selectedMenu === item.key
                  ? "bg-yellow-400/90 text-blue-900 shadow-lg scale-105"
                  : item.danger
                  ? "bg-red-500/20 text-red-100 hover:bg-red-600/40 hover:text-white"
                  : "hover:bg-blue-500/80 hover:text-yellow-100 text-white"
              }`}
            aria-current={selectedMenu === item.key}
          >
            {item.icon}
            <span>{item.label[lang]}</span>
          </button>
        ))}
      </nav>
      <button
        className="flex items-center gap-3 px-6 py-3 mb-6 mt-8 rounded-2xl font-bold text-lg transition-all bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 shadow-lg"
        onClick={handleLogout}
      >
        <FaSignOutAlt size={18} />
        {lang === "pt" ? "Sair" : "Logout"}
      </button>
    </aside>
  );
};

export default Sidebar;
