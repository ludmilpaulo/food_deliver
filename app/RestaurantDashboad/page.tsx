"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";
import dynamic from "next/dynamic";
import { Transition } from "@headlessui/react";
import { fetchFornecedorData, updateLocation } from "@/services/apiService";
import { FornecedorType } from "@/services/types";
import { MdMenu } from "react-icons/md";
import { HelpCircle } from "lucide-react";
import withAuth from "@/components/ProtectedPage";
import HelpGuideModal from "@/components/HelpGuideModal";

// Dynamically import Sidebar to reduce initial bundle size
const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const StoreDashboard: React.FC = () => {
  const user = useSelector(selectUser);
  const [fornecedor, setFornecedor] = useState<FornecedorType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const helpSections = [
    {
      title: 'Como usar o Dashboard',
      content: 'O dashboard do restaurante permite gerenciar pedidos, produtos e perfil.',
      steps: [
        'Navegue pelo menu lateral para acessar diferentes seções',
        'Visualize pedidos pendentes na página inicial',
        'Atualize o status dos pedidos conforme progridem',
        'Gerencie seus produtos e horários de funcionamento',
      ],
    },
    {
      title: 'Gerenciamento de Pedidos',
      content: 'Acompanhe e gerencie todos os seus pedidos em tempo real.',
      steps: [
        'Aceite ou rejeite novos pedidos',
        'Atualize o status do pedido (preparando, pronto, entregue)',
        'Veja detalhes completos do pedido e informações do cliente',
        'Entre em contato com entregadores quando necessário',
      ],
    },
    {
      title: 'Adicionar Produtos',
      content: 'Adicione e gerencie os produtos do seu restaurante.',
      steps: [
        'Clique em "Produtos" no menu',
        'Adicione fotos, descrições e preços',
        'Defina categorias para seus produtos',
        'Ative ou desative produtos conforme disponibilidade',
      ],
    },
    {
      title: 'Configurar Horários',
      content: 'Defina seus horários de funcionamento.',
      steps: [
        'Acesse "Perfil" no menu',
        'Configure horários para cada dia da semana',
        'Marque dias de fechamento ou feriados',
      ],
    },
    {
      title: 'Relatórios e Estatísticas',
      content: 'Visualize relatórios detalhados sobre seu negócio.',
      steps: [
        'Acesse "Relatórios" no menu',
        'Veja vendas por período',
        'Analise produtos mais vendidos',
        'Exporte relatórios para análise',
      ],
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (user?.user_id) {
        try {
          setLoading(true);
          const data = await fetchFornecedorData(user.user_id);
          setFornecedor(data);
        } catch (error) {
          setError("Ocorreu um erro ao buscar os dados");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const updateLocationWithRetry = async (userId: number, location: string, retries: number = 3) => {
    try {
      const response = await updateLocation(userId, location);
      console.log("Location update response:", response);
    } catch (error) {
      console.error("Error updating location:", error);
      if (retries > 0) {
        setTimeout(() => {
          updateLocationWithRetry(userId, location, retries - 1);
        }, 100000);
      } else {
        console.error("Failed to update location after multiple attempts");
      }
    }
  };

  useEffect(() => {
    const updateLocationPeriodically = () => {
      if (user?.user_id) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const location = `${latitude},${longitude}`;
            console.log("Updating location to:", location);
            await updateLocationWithRetry(user.user_id, location);
          },
          (error) => {
            console.error("Error fetching location:", error);
          },
          { enableHighAccuracy: true }
        );
      }
    };

    const intervalId = setInterval(updateLocationPeriodically, 5000); // Update every 5 seconds for testing
    return () => clearInterval(intervalId);
  }, [user]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Transition>
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          <div className="absolute top-4 right-4 z-40">
            <button
              onClick={() => setShowHelp(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
              title="Ajuda"
            >
              <HelpCircle size={24} />
            </button>
          </div>
          <div className="absolute top-0 left-0 md:hidden">
            <button
              onClick={handleSidebarToggle}
              className="text-2xl text-blue-500 p-2"
            >
              <MdMenu />
            </button>
          </div>
          <Sidebar fornecedor={fornecedor} isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
        </>
      )}
      <HelpGuideModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        sections={helpSections}
        title="Guia do Dashboard"
      />
    </div>
  );
};

export default withAuth(StoreDashboard);
