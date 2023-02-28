import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MenuItem from "@/components/MenuItem";



import {
  selectTotalItems,
  selectTotalPrice,
} from "../redux/slices/basketSlice";
import { useSelector } from "react-redux";
import Navbar from "@/components/Navbar";

interface Meals {
  category?: any;
  id?: number;
  image?: string;
  name?: string;
  price?: number;
  quantity?: number;
  short_description?: string;
}

function DetailsScreen() {
  const router = useRouter();
  const { restaurantId, image_url, name, address, phone } = router.query;
  const [foods, setFoods] = useState<Meals[]>([]);
  const [data, setData] = useState<Meals[]>([]);

  let res_ID: any = restaurantId || '';

  let res_NAME : any = name ?? '';

  let res_Image : any = image_url || '';

  const totalPrice = useSelector(selectTotalPrice);
  const getAllItems = useSelector(selectTotalItems);

  useEffect(() => {
    console.log("loga", restaurantId);
    fetchMeals();
  }, []);

  const fetchMeals = () => {
    fetch(`https://www.sunshinedeliver.com/api/customer/meals/${restaurantId}/`)
      .then((response) => response.json())
      .then((responseJson) => {
        setFoods(responseJson.meals);
        setData(responseJson.meals);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const filterType = (category: string) => {
    setFoods(
      foods.filter((item) => {
        return item.category === category;
      })
    );
  };

  return (
    <div className="bg-bg_image bg-cover bg-center bg-no-repeat h-screen md:h-screen">
      <Navbar total={totalPrice} count={getAllItems.length} />
      <div className="max-w-[1640px] m-auto px-4 py-12 bg-bg_image bg-cover bg-center bg-no-repeat h-screen md:h-screen">
        <h1 className="text-[#004AAD] font-bold text-4xl text-center">
        Menu do Restaurante {name}
        </h1>

        {/* Filter Row */}
        <div className="flex flex-col lg:flex-row justify-between">
          {/* Fliter Type */}
          <div>
            <p className="font-bold text-gray-700">Tipo de filtro</p>
            <div className="flex justfiy-between flex-wrap">
              <button
                onClick={fetchMeals}
                className="m-1 border-[#004AAD] text-orange-600 hover:bg-[#004AAD] hover:text-white"
              >
                Todos
              </button>

              {foods.map((item, index) => (
                <button
                  onClick={() => filterType(item.category)}
                  className="m-1 border-[#004AAD] text-orange-600 hover:bg-[#004AAD] hover:text-white"
                >
                  {item.category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12 bg-bg_image bg-cover bg-center bg-no-repeat h-screen md:h-screen">
          {foods?.map((food) => {
            return (
              <MenuItem
                key={food.id}
                resId={res_ID}
                foods={foods}
                food={food}
                resName={res_NAME}
                resImage={res_Image} meals={undefined} category={food.category} id={0} image={""} name={""} price={0} quantity={0} short_description={""}              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DetailsScreen;