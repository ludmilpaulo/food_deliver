"use client";
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import { addItem, removeItem } from '@/redux/slices/basketSlice';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { baseAPI } from '@/services/types';

type store = {
  id: number;
  name: string;
  is_approved: boolean;
};

type Meal = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  store: number;
};

const CartPage: React.FC = () => {
  const cartItems = useAppSelector((state) => state.basket.items as Meal[]);
  const dispatch = useDispatch();
  const router = useRouter();
  const [stores, setstores] = useState<store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${baseAPI}/customer/customer/stores/`)
      .then((response) => response.json())
      .then((data) => {
        const approvedstores = data.stores.filter(
          (store: store) => store.is_approved
        );
        setstores(approvedstores);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (meal: Meal) => {
    dispatch(addItem(meal));
  };

  const handleRemoveFromCart = (mealId: number) => {
    dispatch(removeItem(mealId));
  };

  const handleRemoveItemCompletely = (mealId: number) => {
    const item = cartItems.find((item) => item.id === mealId);
    if (item) {
      for (let i = 0; i < item.quantity; i++) {
        dispatch(removeItem(mealId));
      }
    }
  };

  const groupedItems = cartItems.reduce((acc: { [key: number]: Meal[] }, item: Meal) => {
    if (!acc[item.store]) {
      acc[item.store] = [];
    }
    acc[item.store].push(item);
    return acc;
  }, {});

  const handleCheckout = (storeId: number) => {
    const items = groupedItems[storeId];
    sessionStorage.setItem('checkoutItems', JSON.stringify(items));
    router.push(`/CheckoutPage?store_id=${storeId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold mb-6">Carrinho de Compras</h1>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">Seu carrinho está vazio.</p>
      ) : (
        Object.entries(groupedItems).map(([storeId, items]) => {
          const store = stores.find((res) => res.id === parseInt(storeId));
          const storeName = store ? store.name : `storee ${storeId}`;
          const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);
          return (
            <div key={storeId}>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">{storeName}</h2>
              <div className="grid grid-cols-1 gap-6 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="flex items-center p-4">
                      <Image src={item.image_url} alt={item.name} width={100} height={100} className="w-24 h-24 object-cover" />
                      <div className="ml-4 flex-grow">
                        <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
                        <p className="text-gray-800 font-bold">Preço: {item.price} Kz</p>
                        <div className="flex items-center mt-4">
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                            onClick={() => handleAddToCart(item)}
                          >
                            +
                          </button>
                          <span className="mx-4 text-gray-800 font-semibold">{item.quantity}</span>
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            -
                          </button>
                        </div>
                      </div>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                        onClick={() => handleRemoveItemCompletely(item.id)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-lg font-semibold text-gray-800">Total: {totalPrice} Kz</p>
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                  onClick={() => handleCheckout(parseInt(storeId))}
                >
                  Finalizar Compra
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default CartPage;
