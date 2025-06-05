// app/AdminDashboard/Sidebar.tsx
import React, { useState } from "react";
import { MdClose, MdContacts, MdBarChart, MdTableBar, MdLogout, MdLocationOn, MdLaptop } from "react-icons/md";
import { motion } from "framer-motion";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import dynamic from "next/dynamic";

const CustomersList = dynamic(() => import("./CustomersList"));

const Report = dynamic(() => import("./Report"));
const DriverList = dynamic(() => import("./DriverList"));
const Orders = dynamic(() => import("./Orders"));
const Store = dynamic(() => import("./Store"));
const ProductList = dynamic(() => import("./store/ProductList"));
const DatabaseActions = dynamic(() => import("./DatabaseActions"));

const Sidebar: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const [showProducts, setShowProducts] = useState(false);
  const [showproducts, setShowproducts] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showstore, setShowstore] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [listOfCustomer, setListOfCustomer] = useState(false);
  const [listOfDriver, setListOfDriver] = useState(false);
  const [showDatabaseActions, setShowDatabaseActions] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
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
      <div className="flex h-full">
        <div className={`fixed inset-0 z-40 md:relative md:z-auto md:flex ${isOpen ? "flex" : "hidden"} h-full`}>
          <nav className="w-64 h-full bg-blue-500 text-white p-4 flex flex-col">
            <button onClick={onToggle} className="md:hidden text-2xl text-white mb-4 self-end">
              <MdClose />
            </button>
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative w-12 h-12">
                  <Image
                    src="https://www.kudya.shop/media/logo/azul.png" // Replace with actual logo URL
                    width={500}
                    height={300}
                    className="rounded-full"
                    alt="Fornecedor Logo"
                  />
                  <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-400 rounded-full"></span>
                </div>
                <div>
                  <h5 className="font-semibold">Administrador</h5>
                  <span>Administrador</span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ul className="space-y-4">
                <li className="text-xs font-semibold tracking-wide uppercase">Painel</li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    setShowProducts(false);
                    setShowOrders(false);
                    setShowstore(true);
                    setShowReport(false);
                    setListOfCustomer(false);
                    setListOfDriver(false);
                    setShowproducts(false);
                    setShowDatabaseActions(false);
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdContacts className="text-lg" />
                    <span>stores</span>
                  </div>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    setShowProducts(false);
                    setShowOrders(false);
                    setShowstore(false);
                    setShowReport(false);
                    setListOfCustomer(false);
                    setListOfDriver(false);
                    setShowproducts(true);
                    setShowDatabaseActions(false);
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdLaptop className="text-lg" />
                    <span>Menus</span>
                  </div>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    setShowProducts(false);
                    setShowOrders(true);
                    setShowstore(false);
                    setShowReport(false);
                    setListOfCustomer(false);
                    setListOfDriver(false);
                    setShowproducts(false);
                    setShowDatabaseActions(false);
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdLaptop className="text-lg" />
                    <span>Pedidos</span>
                  </div>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    setShowProducts(false);
                    setShowOrders(false);
                    setShowstore(false);
                    setShowReport(true);
                    setListOfCustomer(false);
                    setListOfDriver(false);
                    setShowproducts(false);
                    setShowDatabaseActions(false);
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdBarChart className="text-lg" />
                    <span>Relatórios</span>
                  </div>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    setShowProducts(false);
                    setShowOrders(false);
                    setShowstore(false);
                    setShowReport(false);
                    setListOfCustomer(true);
                    setListOfDriver(false);
                    setShowproducts(false);
                    setShowDatabaseActions(false);
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdTableBar className="text-lg" />
                    <span>Clientes</span>
                  </div>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    setShowProducts(false);
                    setShowOrders(false);
                    setShowstore(false);
                    setShowReport(false);
                    setListOfCustomer(false);
                    setListOfDriver(true);
                    setShowproducts(false);
                    setShowDatabaseActions(false);
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdBarChart className="text-lg" />
                    <span>Motoristas</span>
                  </div>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    setShowProducts(false);
                    setShowOrders(false);
                    setShowstore(true);
                    setShowReport(false);
                    setListOfCustomer(false);
                    setListOfDriver(false);
                    setShowproducts(false);
                    setShowDatabaseActions(false);
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdContacts className="text-lg" />
                    <span>Paeceiros</span>
                  </div>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    setShowProducts(false);
                    setShowOrders(false);
                    setShowstore(false);
                    setShowReport(false);
                    setListOfCustomer(false);
                    setListOfDriver(false);
                    setShowproducts(false);
                    setShowDatabaseActions(true);
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdBarChart className="text-lg" />
                    <span>Administração</span>
                  </div>
                </motion.li>
              </ul>
            </div>
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-full p-2 bg-green-500 rounded hover:bg-green-600 transition-colors duration-200"
                onClick={() => { /* handle location update logic */ }}
              >
                <MdLocationOn className="text-xl" />
                <span className="ml-2">Atualizar Localização</span>
              </motion.button>
              <motion.li
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 mt-4 rounded hover:bg-red-500 cursor-pointer"
                onClick={() => { /* handle logout logic */ }}
              >
                <div className="flex items-center space-x-3 text-red-400">
                  <MdLogout className="text-lg" />
                  <span>Sair</span>
                </div>
              </motion.li>
            </div>
          </nav>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-100">
          {showproducts && <ProductList />}
          {showOrders && <Orders />}
          {showstore && <Store />}
          {showReport && <Report />}
          {listOfCustomer && <CustomersList />}
          {listOfDriver && <DriverList />}
          {showDatabaseActions && <DatabaseActions />} {/* Render the DatabaseActions component */}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
