"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import { addItem, removeItem } from '@/redux/slices/basketSlice';

type Meal = {
  id: number;
  image_url: string;
  name: string;
  short_description: string;
  price: number;
  quantity: number;
  category: string;
  restaurant: number;
};

const FoodDetailsPage: React.FC = () => {
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const cartItems = useAppSelector((state) => state.basket.items);
  const router = useRouter();

  useEffect(() => {
    const storedMeal = sessionStorage.getItem('selectedMeal');
    if (storedMeal) {
      setMeal(JSON.parse(storedMeal));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const handleAddToCart = (meal: Meal) => {
    dispatch(addItem(meal));
  };

  const handleRemoveFromCart = (mealId: number) => {
    dispatch(removeItem(mealId));
  };

  const isInCart = (mealId: number) => cartItems.some((item) => item.id === mealId);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!meal) {
    return <p className="text-center">Refeição não encontrada.</p>;
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col lg:flex-row">
        <Image src={meal.image_url} alt={meal.name} width={600} height={400} className="w-full lg:w-1/2 object-cover rounded-lg" />
        <div className="p-6 flex-grow">
          <h1 className="text-3xl font-semibold text-gray-800">{meal.name}</h1>
          <p className="text-gray-600 mt-4">{meal.short_description.length > 100 ? `${meal.short_description.substring(0, 100)}...` : meal.short_description}</p>
          <p className="text-gray-800 font-bold mt-4">Preço: {meal.price} Kz</p>
          <div className="flex items-center mt-6">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              onClick={() => handleAddToCart(meal)}
            >
              +
            </button>
            <span className="mx-4 text-gray-800 font-semibold">
              {cartItems.find((item) => item.id === meal.id)?.quantity || 0}
            </span>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
              onClick={() => handleRemoveFromCart(meal.id)}
            >
              -
            </button>
          </div>
          <div className="mt-6">
            {isInCart(meal.id) ? (
              <button
                className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700"
                onClick={() => router.push('/CartPage')}
              >
                Ir para o carrinho
              </button>
            ) : (
                <button
                className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700"
                onClick={() => router.push('/CartPage')}
              >
                Ir para o carrinho
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailsPage;
