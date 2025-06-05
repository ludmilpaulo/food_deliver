"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import { Transition } from '@headlessui/react';
import { addItem, removeItem } from '@/redux/slices/basketSlice';
import { baseAPI } from '@/services/types';

type product = {
  id: number;
  image_url: string;
  name: string;
  short_description: string;
  price: number;
  quantity: number;
  category: string;
  store: number;
};

type Category = string;

const storeMenu: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setproducts] = useState<product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const store_id = searchParams.get('store_id');
  const dispatch = useDispatch();
  const cartItems = useAppSelector((state) => state.basket.items);

  useEffect(() => {
    if (store_id) {
      fetch(`${baseAPI}/customer/customer/products/${store_id}/`)
        .then((response) => response.json())
        .then((data) => {
          setproducts(data.products);
          const uniqueCategories = Array.from(new Set<string>(data.products.map((product: product) => product.category)));
          setCategories(uniqueCategories);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching products:', error);
          setLoading(false);
        });
    }
  }, [store_id]);

  const filteredproducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  const handleAddToCart = (product: product) => {
    dispatch(addItem(product));
  };

  const handleRemoveFromCart = (productId: number) => {
    dispatch(removeItem(productId));
  };

  const isInCart = (productId: number) => cartItems.some((item) => item.id === productId);

  const handleViewDetails = (product: product) => {
    sessionStorage.setItem('selectedproduct', JSON.stringify(product));
    router.push(`/FoodDetailsPage`);
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <Transition
        show={loading}
        as="div"
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {loading && (
          <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-gray-900 bg-opacity-50">
            <div className="w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </Transition>
      {!loading && (
        <div>
          <div className="flex justify-between mb-6">
            <div className="flex space-x-4">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
              <button
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredproducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <Image src={product.image_url} alt={product.name} width={400} height={300} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h2 className="text-2xl font-semibold text-gray-800">{product.name}</h2>
                  <p className="text-gray-600">{product.short_description.length > 100 ? `${product.short_description.substring(0, 100)}...` : product.short_description}</p>
                  <p className="text-gray-800 font-bold">Preço: {product.price} Kz</p>
                  <div className="flex items-center mt-4">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                      onClick={() => handleAddToCart(product)}
                    >
                      +
                    </button>
                    <span className="mx-4 text-gray-800 font-semibold">
                      {cartItems.find((item) => item.id === product.id)?.quantity || 0}
                    </span>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      onClick={() => handleRemoveFromCart(product.id)}
                    >
                      -
                    </button>
                  </div>
                  <div className="mt-4">
                    {isInCart(product.id) ? (
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                        onClick={() => router.push('/CartPage')}
                      >
                        Ir para o carrinho
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                        onClick={() => handleViewDetails(product)}
                      >
                        Ver a refeição
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const storeMenuPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <storeMenu />
    </Suspense>
  );
};

export default storeMenuPage;
