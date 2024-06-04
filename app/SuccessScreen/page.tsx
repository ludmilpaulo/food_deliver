"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaHistory, FaHome } from 'react-icons/fa';

const SuccessScreen: React.FC = () => {
  const router = useRouter();

  const handleViewOrders = () => {
    router.push('/order-history');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-yellow-400 to-blue-600 text-white">
      <FaCheckCircle className="text-9xl mb-6" />
      <h1 className="text-4xl font-bold mb-4">Pedido Realizado com Sucesso!</h1>
      <p className="text-lg mb-8">Obrigado por fazer seu pedido na Kudya. Seu pedido foi recebido e está sendo processado.</p>
      <div className="flex space-x-4">
        <button
          onClick={handleViewOrders}
          className="flex items-center px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition duration-300"
        >
          <FaHistory className="mr-2" /> Ver Histórico de Pedidos
        </button>
        <button
          onClick={handleGoHome}
          className="flex items-center px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition duration-300"
        >
          <FaHome className="mr-2" /> Voltar à Página Inicial
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
