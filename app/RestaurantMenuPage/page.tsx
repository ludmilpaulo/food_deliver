"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import { Transition } from '@headlessui/react';
import { addItem, removeItem } from '@/redux/slices/basketSlice';
import { baseAPI } from '@/services/types';

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

type Category = string;

const RestaurantMenu: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const restaurant_id = searchParams.get('restaurant_id');
  const dispatch = useDispatch();
  const cartItems = useAppSelector((state) => state.basket.items);

  useEffect(() => {
    if (restaurant_id) {
      fetch(`${baseAPI}/customer/customer/meals/${restaurant_id}/`)
        .then((response) => response.json())
        .then((data) => {
          setMeals(data.meals);
          const uniqueCategories = Array.from(new Set<string>(data.meals.map((meal: Meal) => meal.category)));
          setCategories(uniqueCategories);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching meals:', error);
          setLoading(false);
        });
    }
  }, [restaurant_id]);

  const filteredMeals = selectedCategory
    ? meals.filter((meal) => meal.category === selectedCategory)
    : meals;

  const handleAddToCart = (meal: Meal) => {
    dispatch(addItem(meal));
  };

  const handleRemoveFromCart = (mealId: number) => {
    dispatch(removeItem(mealId));
  };

  const isInCart = (mealId: number) => cartItems.some((item) => item.id === mealId);

  const handleViewDetails = (meal: Meal) => {
    sessionStorage.setItem('selectedMeal', JSON.stringify(meal));
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
            {filteredMeals.map((meal) => (
              <div key={meal.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <Image src={meal.image_url} alt={meal.name} width={400} height={300} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h2 className="text-2xl font-semibold text-gray-800">{meal.name}</h2>
                  <p className="text-gray-600">{meal.short_description.length > 100 ? `${meal.short_description.substring(0, 100)}...` : meal.short_description}</p>
                  <p className="text-gray-800 font-bold">Preço: {meal.price} Kz</p>
                  <div className="flex items-center mt-4">
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
                  <div className="mt-4">
                    {isInCart(meal.id) ? (
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                        onClick={() => router.push('/cart')}
                      >
                        Ir para o carrinho
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                        onClick={() => handleViewDetails(meal)}
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

const RestaurantMenuPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestaurantMenu />
    </Suspense>
  );
};

export default RestaurantMenuPage;
