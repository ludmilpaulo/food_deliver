import React from 'react';

interface SidebarProps {
  setSelectedMenu: React.Dispatch<React.SetStateAction<string>>;
}

const Sidebar: React.FC<SidebarProps> = ({ setSelectedMenu }) => {
  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen">
      <div className="p-4 text-2xl font-bold">Painel do Usuário</div>
      <ul>
        <li
          className="p-4 cursor-pointer hover:bg-gray-700"
          onClick={() => setSelectedMenu('trackOrders')}
        >
          Rastrear Pedidos
        </li>
        <li
          className="p-4 cursor-pointer hover:bg-gray-700"
          onClick={() => setSelectedMenu('updateProfile')}
        >
          Atualizar Perfil
        </li>
        <li
          className="p-4 cursor-pointer hover:bg-gray-700"
          onClick={() => setSelectedMenu('orderHistory')}
        >
          Histórico de Pedidos
        </li>
        <li
          className="p-4 cursor-pointer hover:bg-gray-700"
          onClick={() => setSelectedMenu('downloadInvoice')}
        >
          Baixar Fatura
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
