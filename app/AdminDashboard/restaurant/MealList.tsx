import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getMeals, Meal } from '../services/mealService';
import Image from 'next/image';

const MealList: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const mealData = await getMeals();
        setMeals(mealData);
      } catch (error) {
        console.error('Erro ao buscar refeições:', error);
      }
    };

    fetchMeals();
  }, []);

  return (
    <ul>
      {meals.map((meal, index) => (
        <motion.li
          key={index}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded hover:bg-blue-600 cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <Image src={meal.image} alt={meal.name} width={50} height={50} />
            <div>
              <h3>{meal.name}</h3>
              <p>{meal.short_description}</p>
              <p>Restaurante: {meal.restaurant_name}</p>
              <p>Preço Original: {meal.original_price.toFixed(2)} kz</p>
              <p>Preço com Acréscimo: R${meal.price_with_markup.toFixed(2)}</p>
            </div>
          </div>
        </motion.li>
      ))}
    </ul>
  );
};

export default MealList;
