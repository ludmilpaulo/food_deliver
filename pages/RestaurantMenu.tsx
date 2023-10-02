import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";
import Link from "next/link";
import Menu from "@/components/Menu";
import Nav from "@/components/Nav";
import withAuth from "@/components/ProtectedPage";

interface Meals {
  category?: any;
  id?: number;
  image?: string;
  name?: string;
  price?: number;
  quantity?: number;
  short_description?: string;
}

const RestaurantMenu = () => {
  const router = useRouter();
  const { restaurantId, image_url, restaurantName, address, phone } =
    router.query;
  const [foods, setFoods] = useState<Meals[]>([]);
  const [data, setData] = useState<Meals[]>([]);

  const [open, setOpen] = useState(false);

  //let res_ID: number | null = Array.isArray(restaurantId) || !restaurantId ? null : Number(restaurantId);

  let res_ID: number = Number(restaurantId) || 0;

  //let res_NAME: string = restaurantName ?? "";
  let res_NAME: string = Array.isArray(restaurantName)
    ? restaurantName.join(" ")
    : restaurantName ?? "";

  let res_Image: string = Array.isArray(image_url)
    ? image_url[0]
    : image_url ?? "";

  //let res_Image: string = image_url || "";

  const fetchMeals = useCallback(() => {
    fetch(`https://www.sunshinedeliver.com/api/customer/meals/${res_ID}/`)
      .then((response) => response.json())
      .then((responseJson) => {
        setFoods(responseJson.meals);
        setData(responseJson.meals);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [res_ID]); // Add res_ID to the dependency array

  useEffect(() => {
    console.log("meals data", foods)
    fetchMeals();
  }, [fetchMeals]);

  // Get unique category names
  const uniqueCategories = Array.from(
    new Set(data.map((item) => item.category)),
  );

  // Filtering function
  const filterType = (category: string) => {
    setFoods(data.filter((item) => item.category === category));
  };

  return (
    <div className="max-w-full overflow-x-hidden">
      <Nav />
      <div className="relative h-[250px]">
        {res_Image.length > 0 && (
          <Image
            src={res_Image}
            alt={res_NAME}
            className="object-cover w-full h-full"
            layout="fill" // Making the image cover the entire container
            unoptimized={true}
          />
        )}
      </div>
      <div
          className="absolute top-0
          left-0
          w-full
          h-96
          bg-gradient-to-br
          from-[#FCB61A]
          to-[#0171CE]
          rounded-md
          filter
          blur-3xl
          opacity-50
          -z-20"
        />

      <div className="flex flex-col justify-between lg:flex-row p-4">
        {/* Filter Type */}
        <div>
          <p className="font-bold text-gray-700">Cardápio do restaurante</p>
          <div className="flex flex-wrap justify-between">
            <button
              onClick={fetchMeals}
              className="m-1 border-[#004AAD] text-orange-600 hover:bg-[#004AAD] hover:text-white"
            >
              Todos
            </button>

            {uniqueCategories.map((category) => (
              <button
                key={category}
                onClick={() => filterType(category)}
                className="m-1 border-[#004AAD] text-orange-600 hover:bg-[#004AAD] hover:text-white"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 w-full px-4 mx-auto">
        {foods?.map((food) => {
          return (
            <Menu
              key={food.id}
              resId={res_ID}
              foods={foods}
              food={food}
              resName={res_NAME}
              resImage={res_Image}
              meals={undefined}
              category={food.category}
              id={0}
              image={""}
              name={""}
              price={0}
              quantity={0}
              short_description={""}
            />
          );
        })}
      </div>
    </div>
  );
};

export default withAuth(RestaurantMenu);
