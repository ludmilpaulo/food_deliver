"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { IoMdMenu, IoMdClose, IoIosSearch, IoMdCart, IoMdPerson, IoMdRestaurant } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '@/assets/azul.png';
import { selectUser } from '@/redux/slices/authSlice';
import { useSelector } from 'react-redux';
import { useAppSelector } from '@/redux/store';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const user = useSelector(selectUser);
  const cartItems = useAppSelector((state) => state.basket.items);
  const cartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(`/search?query=${searchText}`);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-yellow-400 to-blue-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src={logo}
                alt="Logo"
                width={50}
                height={50}
                className="cursor-pointer"
              />
            </Link>
            {user ? (
              <div className="hidden md:flex space-x-6 ml-10">
                <Link href="/HomeScreen">
                  <span className="flex items-center text-gray-800 hover:text-blue-600 transition duration-300 cursor-pointer">
                    <IoMdRestaurant size={20} className="mr-1" /> Restaurantes
                  </span>
                </Link>
                <Link href="/orders">
                  <span className="flex items-center text-gray-800 hover:text-blue-600 transition duration-300 cursor-pointer">
                    <IoMdCart size={20} className="mr-1" /> Pedidos
                  </span>
                </Link>
                <Link href="/profile">
                  <span className="flex items-center text-gray-800 hover:text-blue-600 transition duration-300 cursor-pointer">
                    <IoMdPerson size={20} className="mr-1" /> Perfil
                  </span>
                </Link>
              </div>
            ) : null}
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search food or restaurants"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-0 top-0 mt-2 mr-4 text-gray-600"
              >
                <IoIosSearch size={20} />
              </button>
            </form>
            <Link href="/cart" className="relative">
              <span className="flex items-center text-gray-800 hover:text-blue-600 transition duration-300 cursor-pointer">
                <IoMdCart size={20} className="mr-1" /> Carrinho
              </span>
              {cartQuantity > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartQuantity}
                </span>
              )}
            </Link>
            {user ? (
              <Link href="/profile">
                <span className="flex items-center text-gray-800 hover:text-blue-600 transition duration-300 cursor-pointer">
                  <IoMdPerson size={20} className="mr-1" /> Perfil
                </span>
              </Link>
            ) : (
              <Link href="/LoginScreenUser">
                <span className="flex items-center text-gray-800 hover:text-blue-600 transition duration-300 cursor-pointer">
                  <IoMdPerson size={20} className="mr-1" /> Entrar
                </span>
              </Link>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu}>
              {menuOpen ? (
                <IoMdClose size={28} className="text-gray-800" />
              ) : (
                <IoMdMenu size={28} className="text-gray-800" />
              )}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden flex flex-col space-y-2 pb-4">
            <form onSubmit={handleSearch} className="relative px-4">
              <input
                type="text"
                placeholder="Search food or restaurants"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-0 top-0 mt-2 mr-4 text-gray-600"
              >
                <IoIosSearch size={20} />
              </button>
            </form>
            <Link href="/restaurants">
              <span className="flex items-center text-gray-800 hover:text-blue-600 transition duration-300 cursor-pointer px-4">
                <IoMdRestaurant size={20} className="mr-1" /> Restaurants
              </span>
            </Link>
            <Link href="/orders">
              <span className="flex items-center text-gray-800 hover:text-blue-600 transition duration-300 cursor-pointer px-4">
                <IoMdCart size={20} className="mr-1" /> Pedios
              </span>
            </Link>
            <Link href="/profile">
              <span className="flex items-center text-gray-800 hover:text-blue-600 transition duration-300 cursor-pointer px-4">
                <IoMdPerson size={20} className="mr-1" /> Perfil
              </span>
            </Link>
            <Link href="/cart" className="relative px-4">
              <span className="flex items-center text-gray-800 hover:text-blue-600 transition duration-300 cursor-pointer">
                <IoMdCart size={20} className="mr-1" /> Carrinh
              </span>
              {cartQuantity > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartQuantity}
                </span>
              )}
            </Link>
            {!user && (
              <Link href="/LoginScreenUser">
                <span className="flex items-center text-gray-800 hover:text-blue-600 transition duration-300 cursor-pointer px-4">
                  <IoMdPerson size={20} className="mr-1" /> Perfil
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
