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
  MdLocationOn,
} from "react-icons/md";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/authSlice";
import { motion } from "framer-motion";
import { FornecedorType } from "@/services/types";

import Order from "./Order";
import Products from "./Products";
import Profile from "./Profile"; // Import Profile component
import { updateLocation } from "@/services/apiService"; // Import the location update function
import { Transition } from "@headlessui/react";
import CustomersList from "./CustomersList";
import Report from "./Report";
import DriverList from "./DriverList";
import { useTranslation } from "@/hooks/useTranslation";

interface SidebarProps {
  fornecedor: FornecedorType | null;
  onNavClick?: (navItem: string) => void; // Callback function to notify the parent about a menu click
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ fornecedor, onNavClick, isOpen, onToggle }) => {
  const { t } = useTranslation();
  const [showProducts, setShowProducts] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [listOfCustomer, setListOfCustomer] = useState(false);
  const [listOfDriver, setListOfDriver] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // State for profile view
  const [loading, setLoading] = useState(false); // State for loading
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(logoutUser());
    router.push("/");
  };

  const handleUpdateLocation = async () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const location = `${latitude},${longitude}`;
        try {
          await updateLocation(fornecedor?.id || 0, location); // Replace with the correct user ID
          alert(t("locationUpdatedSuccess", "Location updated successfully!"));
        } catch (error) {
          console.error("Erro ao atualizar a localização:", error);
          alert(t("errorUpdatingLocation", "An error occurred while updating location."));
        } finally {
          setLoading(false);
        }
      }, (error) => {
        console.error("Erro ao obter a localização:", error);
        alert(t("errorGettingLocation", "An error occurred while getting location."));
        setLoading(false);
      });
    } else {
      alert(t("geolocationNotSupported", "Geolocation is not supported by your browser."));
    }
  };

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
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full">
          <div className="w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
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
                    src={fornecedor?.logo || "https://www.kudya.shop/media/logo/azul.png"}
                    width={500}
                    height={300}
                    className="rounded-full"
                    alt={t("supplierLogo", "Supplier Logo")}
                  />
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
                  {t("dashboard", "Dashboard")}
                </li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    setShowOrders(false);
                    setShowProducts(true);
                    setShowProfile(false);
                    setListOfCustomer(false);
                    setListOfDriver(false);
                    setShowServices(false);
                    setShowReport(false); 
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdContacts className="text-lg" />
                    <span>{t("products", "Products")}</span>
                  </div>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    setShowProducts(false);
                    setShowOrders(true);
                    setShowProfile(false);
                    setListOfCustomer(false);
                    setListOfDriver(false);
                    setShowServices(false);
                    setShowReport(false); 
                    onNavClick && onNavClick(t("orders", "Orders"));
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdLaptop className="text-lg" />
                    <span>{t("orders", "Orders")}</span>
                  </div>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    onNavClick && onNavClick(t("reports", "Reports"));
                    setShowProfile(false);
                    setShowProducts(false);
                    setShowOrders(false);
                    setListOfCustomer(false);
                    setListOfDriver(false);
                    setShowServices(false);
                    setShowReport(true);
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdBarChart className="text-lg" />
                    <span>{t("reports", "Reports")}</span>
                  </div>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    onNavClick && onNavClick(t("customers", "Customers"));
                    setShowProfile(false);
                    setShowProducts(false);
                    setShowOrders(false);
                    setShowReport(false); // Add this
                    setListOfDriver(false);
                    setListOfCustomer(true);
                    setShowServices(false);
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdTableBar className="text-lg" />
                    <span>{t("customers", "Customers")}</span>
                  </div>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    onNavClick && onNavClick(t("drivers", "Drivers"));
                    setShowProfile(false);
                    setShowProducts(false);
                    setShowOrders(false);
                    setShowReport(false); // Add this
                    setListOfCustomer(false);
                    setListOfDriver(true);
                    setShowServices(false);
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdBarChart className="text-lg" />
                    <span>{t("drivers", "Drivers")}</span>
                  </div>
                </motion.li>
                <motion.li
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded hover:bg-blue-600 cursor-pointer"
                  onClick={() => {
                    setShowProfile(true);
                    setShowProducts(false);
                    setShowOrders(false);
                    setShowReport(false); 
                    setListOfCustomer(false);
                    setListOfDriver(false);
                    onNavClick && onNavClick(t("account", "Account"));
                    onToggle();
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <MdContacts className="text-lg" />
                    <span>{t("Profile", "Profile")}</span>
                  </div>
                </motion.li>
              </ul>
            </div>
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-full p-2 bg-green-500 rounded hover:bg-green-600 transition-colors duration-200"
                onClick={handleUpdateLocation}
              >
                <MdLocationOn className="text-xl" />
                <span className="ml-2">{t("updateLocation", "Update Location")}</span>
              </motion.button>
              <motion.li
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 mt-4 rounded hover:bg-red-500 cursor-pointer"
                onClick={handleLogout}
              >
                <div className="flex items-center space-x-3 text-red-400">
                  <MdLogout className="text-lg" />
                  <span>{t("logout", "Logout")}</span>
                </div>
              </motion.li>
            </div>
          </nav>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {showProducts && <Products />}
        {showOrders && <Order />}
        {showProfile && <Profile />} {/* Show Profile when showProfile is true */}
        {showReport && <Report />}
        {listOfCustomer && <CustomersList />}
        {listOfDriver && <DriverList />}{" "}
      </div>
    </>
  );
};

export default Sidebar;
