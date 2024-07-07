// app/AdminDashboard/AdminLayout.tsx
"use client";

import React, { useState } from "react";
import { MdMenu } from "react-icons/md";
import { Transition } from "@headlessui/react";
import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
  loading: () => <p>Carregando...</p>,
});

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const handleSidebarToggle = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      <Transition
        show={false} // Replace with your loading state
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
      <div className="absolute top-0 left-0 md:hidden">
        <button onClick={handleSidebarToggle} className="text-2xl text-blue-500 p-2">
          <MdMenu />
        </button>
      </div>
      <Sidebar isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
};

export default AdminLayout;
