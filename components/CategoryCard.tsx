import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import { Restaurant, basAPI } from "@/configs/variable";

interface Category {
  id: number;
  name: string;
  image: string;
  // Add other category properties if needed
}

interface CategoriesProps {
  onSelectCategory: (category: string) => void;
}

type Restaurants = Restaurant[];

export default function CategoryCard({ onSelectCategory }: CategoriesProps) {
  const [restaurants, setRestaurants] = useState<Restaurants>([]);
  const [isHovered, setIsHovered] = useState(false);

  const controls = useAnimation();

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${basAPI}api/customer/restaurants/`);
      const data = await response.json();

      // Use optional chaining to safely access nested properties
      const categoriesData = data?.restaurants.map(
        (restaurant: Restaurant) => restaurant?.category
      ) || [];

      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    if (!isHovered) {
      controls.start({
        x: ["100vw", "-100vw"],
        transition: { repeat: Infinity, duration: 10 },
      });
    } else {
      controls.stop();
    }
  }, [isHovered, controls]);

  useEffect(() => {
    fetch(`${basAPI}api/customer/restaurants/`)
      .then((response) => response.json())
      .then((data) => setRestaurants(data.restaurants));
  }, []);

 // ... (other imports)



  // ... (other imports)


  // ... (existing code)

  return (
    <div className="flex flex-row p-4 overflow-x-auto scroll-snap-x-mandatory">
      <motion.div
        animate={controls}
        className="flex flex-row overflow-x-auto scroll-snap-x-mandatory"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {categories.map((category, index) => (
          // Ensure each child in a list has a unique key
          <Link key={index} href="#" passHref>
            <div>
              <motion.div
                className="flex-none flex-shrink-0 scroll-snap-start"
                whileHover={{ scale: 1.05 }}
              >
                <div
                  onClick={(e) => {
                    e.preventDefault(); // Prevents the default behavior of the anchor tag
                    onSelectCategory(category?.name || "");
                  }}
                  className="flex flex-col items-center p-4 m-4 bg-white shadow-lg bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-xl"
                >
                  <Image
                    className="w-32 h-32 mb-4 rounded-full sm:w-32 sm:h-32 md:w-32 md:h-32 lg:w-64 lg:h-32 xl:w-32 xl:h-32"
                    width={300}
                    height={300}
                    src={category?.image}
                    alt={category?.name}
                  />
                  <div className="text-xl font-medium text-black">
                    {category?.name}
                  </div>
                </div>
              </motion.div>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
