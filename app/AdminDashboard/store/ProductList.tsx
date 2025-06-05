import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Transition } from '@headlessui/react';
import { baseAPI, Product } from '@/services/types';
import { getproducts } from '@/services/managerService';

const ProductList: React.FC = () => {
  const [products, setproducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedstore, setSelectedstore] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]); // Updated range to ensure wide coverage

  useEffect(() => {
    const fetchproducts = async () => {
      try {
        const productData = await getproducts();
        console.log('Fetched products:', productData); // Debugging log
        setproducts(productData);
      } catch (error) {
        console.error('Erro ao buscar refeições:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchproducts();
  }, []);

  const filteredproducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesstore = selectedstore === '' || product.store_name === selectedstore;
    const matchesPrice = product.price_with_markup >= priceRange[0] && product.price_with_markup <= priceRange[1];

    return matchesSearch && matchesstore && matchesPrice;
  });

  const uniquestores = Array.from(new Set(products.map(product => product.store_name)));

  console.log('Filtered products:', filteredproducts); // Debugging log

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

      {!loading && (
        <div className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Pesquisar refeições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded mb-2 md:mb-0 md:mr-2"
            />
            <select
              value={selectedstore}
              onChange={(e) => setSelectedstore(e.target.value)}
              className="p-2 border border-gray-300 rounded mb-2 md:mb-0 md:mr-2"
            >
              <option value="">Todos os storees</option>
              {uniquestores.map((store, index) => (
                <option key={index} value={store}>
                  {store}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <label>Preço:</label>
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="p-2 border border-gray-300 rounded w-20"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="p-2 border border-gray-300 rounded w-20"
              />
            </div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredproducts.length > 0 ? (
              filteredproducts.map((product, index) => (
                <motion.li
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 rounded shadow-lg hover:bg-blue-100 cursor-pointer bg-white"
                >
                  <div className="flex flex-col items-center">
                    <Image src={`${baseAPI}${product.images}`} alt={product.name} width={100} height={100} className="rounded mb-2" />
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-gray-500">{product.description}</p>
                      <p className="text-gray-700">storee: {product.store_name}</p>
                      <p className="text-gray-700">Preço Original: {product.original_price.toFixed(2)} Kz</p>
                      <p className="text-gray-900 font-bold">Preço com Acréscimo: {product.price_with_markup.toFixed(2)} Kz</p>
                    </div>
                  </div>
                </motion.li>
              ))
            ) : (
              <div className="col-span-4 text-center text-gray-500">
                Nenhuma refeição encontrada.
              </div>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default ProductList;
